use async_trait::async_trait;
use loco_rs::app::{AppContext, Initializer};
use sqlx::{AssertSqlSafe, PgConnection, PgPool};
use std::collections::HashSet;
use std::time::Instant;

use crate::db::schema::manifest::EntityManifest;
use crate::db::schema::schema::{ColumnSchema, TableSchema};

/// PostgreSQL advisory lock ID for schema synchronization.
pub const SCHEMA_SYNC_ADVISORY_LOCK_ID: i64 = 88421038;

/// Statistics gathered during the synchronization process.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SyncStats {
    pub tables_created: usize,
    pub columns_added: usize,
    pub indexes_created: usize,
    pub constraints_added: usize,
    pub entities_verified: usize,
    pub unmapped_columns_detected: usize,
    pub unsupported_differences: usize,
    pub duration_ms: u128,
}

/// Helper to safely quote PostgreSQL identifiers.
pub fn quote_ident(ident: &str) -> String {
    format!("\"{}\"", ident.replace('"', "\"\""))
}

/// Loco Initializer to execute entity-first schema synchronization prior to HTTP request serving.
pub struct SchemaSyncInitializer;

#[async_trait]
impl Initializer for SchemaSyncInitializer {
    fn name(&self) -> String {
        "schema-sync".to_string()
    }

    async fn before_run(&self, app_context: &AppContext) -> loco_rs::Result<()> {
        let pool = app_context.db.get_postgres_connection_pool();
        synchronize_schema(pool).await.map_err(|e| {
            loco_rs::Error::Message(format!("Database schema synchronization failed: {e}"))
        })?;
        Ok(())
    }
}

/// Compatibility alias matching the previous synchronization signature.
pub async fn sync_schema(pool: &PgPool) -> Result<(), sqlx::Error> {
    synchronize_schema(pool)
        .await
        .map_err(sqlx::Error::Protocol)?;
    Ok(())
}

/// Executes entity-first schema synchronization against the PostgreSQL database.
///
/// Guaranteed sequence:
/// 1. Acquire dedicated connection from the connection pool.
/// 2. Acquire PostgreSQL advisory lock (88421038) on this dedicated connection.
/// 3. Ensure required extensions (pgcrypto) exist.
/// 4. Introspect existing database tables, columns, indexes, and constraints.
/// 5. Compare with EntityManifest schemas and validate safety (rejecting any destructive or ambiguous changes).
/// 6. Apply safe additive changes (create missing tables, columns, indexes, constraints).
/// 7. Verify all registered entity tables via test queries.
/// 8. Always release the advisory lock on the same connection before completing or on error.
/// 9. Return detailed synchronization statistics.
pub async fn synchronize_schema(pool: &PgPool) -> Result<SyncStats, String> {
    let start_time = Instant::now();
    tracing::info!("Starting entity-first database schema synchronization...");
    println!("Starting entity-first database schema synchronization...");

    // Validate entity manifest before starting
    let manifest = EntityManifest::all();
    EntityManifest::validate(&manifest)
        .map_err(|e| format!("Entity manifest validation failed: {e}"))?;

    // Acquire single dedicated connection for the entire synchronization lifecycle
    let mut conn = pool
        .acquire()
        .await
        .map_err(|e| format!("Failed to acquire connection for schema synchronization: {e}"))?;

    // Acquire PostgreSQL advisory lock
    sqlx::query("SELECT pg_advisory_lock($1)")
        .bind(SCHEMA_SYNC_ADVISORY_LOCK_ID)
        .execute(&mut *conn)
        .await
        .map_err(|e| {
            format!(
                "Failed to acquire PostgreSQL advisory lock {SCHEMA_SYNC_ADVISORY_LOCK_ID}: {e}"
            )
        })?;

    tracing::info!(
        "Acquired advisory lock {SCHEMA_SYNC_ADVISORY_LOCK_ID} on dedicated connection."
    );

    // Execute synchronization wrapped so lock is always released
    let result = run_sync_reconciliation(&mut conn, &manifest).await;

    // Release PostgreSQL advisory lock on the exact same connection
    let unlock_result = sqlx::query("SELECT pg_advisory_unlock($1)")
        .bind(SCHEMA_SYNC_ADVISORY_LOCK_ID)
        .execute(&mut *conn)
        .await;

    if let Err(e) = unlock_result {
        tracing::error!(
            "Failed to release PostgreSQL advisory lock {SCHEMA_SYNC_ADVISORY_LOCK_ID}: {e}"
        );
        eprintln!("Failed to release PostgreSQL advisory lock {SCHEMA_SYNC_ADVISORY_LOCK_ID}: {e}");
    } else {
        tracing::info!("Released advisory lock {SCHEMA_SYNC_ADVISORY_LOCK_ID}.");
    }

    let mut stats = result?;
    stats.duration_ms = start_time.elapsed().as_millis();

    tracing::info!(
        "Entity-first schema synchronization completed in {}ms: {} tables created, {} columns added, {} indexes created, {} constraints added, {} entities verified, {} unmapped columns preserved.",
        stats.duration_ms,
        stats.tables_created,
        stats.columns_added,
        stats.indexes_created,
        stats.constraints_added,
        stats.entities_verified,
        stats.unmapped_columns_detected
    );
    println!(
        "Entity-first schema synchronization completed in {}ms: {} tables created, {} columns added, {} indexes created, {} constraints added, {} entities verified, {} unmapped columns preserved.",
        stats.duration_ms,
        stats.tables_created,
        stats.columns_added,
        stats.indexes_created,
        stats.constraints_added,
        stats.entities_verified,
        stats.unmapped_columns_detected
    );

    Ok(stats)
}

#[allow(dead_code)]
#[derive(Debug, sqlx::FromRow)]
struct DbColumnInfo {
    column_name: String,
    data_type: String,
    udt_name: String,
    is_nullable: String,
    column_default: Option<String>,
    character_maximum_length: Option<i32>,
    numeric_precision: Option<i32>,
    numeric_scale: Option<i32>,
}

#[derive(Debug, sqlx::FromRow)]
struct DbIndexInfo {
    indexname: String,
    indexdef: String,
}

#[derive(Debug, sqlx::FromRow)]
struct DbConstraintInfo {
    conname: String,
    contype: String,
    condef: String,
}

async fn run_sync_reconciliation(
    conn: &mut PgConnection,
    manifest: &[TableSchema],
) -> Result<SyncStats, String> {
    let mut stats = SyncStats::default();

    // 1. Ensure required pgcrypto extension exists for gen_random_uuid()
    sqlx::query("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")
        .execute(&mut *conn)
        .await
        .map_err(|e| format!("Failed to create pgcrypto extension: {e}"))?;

    // 2. Introspect existing base tables in public schema
    let existing_tables: Vec<(String,)> = sqlx::query_as(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
    )
    .fetch_all(&mut *conn)
    .await
    .map_err(|e| format!("Failed to inspect public tables: {e}"))?;

    let existing_table_set: HashSet<String> = existing_tables.into_iter().map(|(t,)| t).collect();

    // 3. Process each table in topological manifest order
    for target_table in manifest {
        if !existing_table_set.contains(&target_table.name) {
            // Table is missing: safely create table with all its columns and primary key
            create_missing_table(conn, target_table).await?;
            stats.tables_created += 1;
        } else {
            // Table exists: inspect and apply safe additive changes
            reconcile_existing_table(conn, target_table, &mut stats).await?;
        }
    }

    // 4. Reconcile foreign keys, unique constraints, check constraints, and indexes
    // (This runs for all tables after table creation so referenced tables exist)
    for target_table in manifest {
        reconcile_table_constraints_and_indexes(conn, target_table, &mut stats).await?;
    }

    // 5. Verification phase: Verify every registered entity table is accessible
    for target_table in manifest {
        let verify_sql = format!("SELECT 1 FROM {} LIMIT 1", quote_ident(&target_table.name));
        sqlx::query(AssertSqlSafe(&*verify_sql))
            .execute(&mut *conn)
            .await
            .map_err(|e| {
                format!(
                    "Post-sync entity verification failed for table '{}': {e}",
                    target_table.name
                )
            })?;
        stats.entities_verified += 1;
    }

    Ok(stats)
}

fn build_column_definition_sql(col: &ColumnSchema) -> String {
    let mut sql = format!("{} {}", quote_ident(&col.name), col.col_type.to_sql());
    if col.is_primary_key {
        // In PostgreSQL, primary key columns are implicitly not null
        sql.push_str(" PRIMARY KEY");
    } else if !col.is_nullable {
        sql.push_str(" NOT NULL");
    }
    if let Some(ref def) = col.default {
        sql.push_str(&format!(" DEFAULT {def}"));
    }
    if col.is_unique {
        sql.push_str(" UNIQUE");
    }
    sql
}

async fn create_missing_table(conn: &mut PgConnection, target: &TableSchema) -> Result<(), String> {
    let mut parts = Vec::new();

    for col in &target.columns {
        parts.push(build_column_definition_sql(col));
    }

    // Add composite primary key if multiple PK columns defined and not attached inline
    if target.primary_key.len() > 1 {
        let pk_cols = target
            .primary_key
            .iter()
            .map(|c| quote_ident(c))
            .collect::<Vec<_>>()
            .join(", ");
        parts.push(format!("PRIMARY KEY ({pk_cols})"));
    }

    for uq in &target.unique_constraints {
        let uq_cols = uq
            .columns
            .iter()
            .map(|c| quote_ident(c))
            .collect::<Vec<_>>()
            .join(", ");
        parts.push(format!(
            "CONSTRAINT {} UNIQUE ({uq_cols})",
            quote_ident(&uq.name)
        ));
    }

    for chk in &target.check_constraints {
        parts.push(format!(
            "CONSTRAINT {} CHECK ({})",
            quote_ident(&chk.name),
            chk.expression
        ));
    }

    let create_sql = format!(
        "CREATE TABLE IF NOT EXISTS {} (\n    {}\n)",
        quote_ident(&target.name),
        parts.join(",\n    ")
    );

    tracing::info!("Creating missing table: {}", target.name);
    sqlx::query(AssertSqlSafe(&*create_sql))
        .execute(&mut *conn)
        .await
        .map_err(|e| format!("Failed to create table '{}': {e}", target.name))?;

    Ok(())
}

async fn reconcile_existing_table(
    conn: &mut PgConnection,
    target: &TableSchema,
    stats: &mut SyncStats,
) -> Result<(), String> {
    let db_columns: Vec<DbColumnInfo> = sqlx::query_as(
        "SELECT column_name, data_type, udt_name, is_nullable, column_default, \
                character_maximum_length, numeric_precision, numeric_scale \
         FROM information_schema.columns \
         WHERE table_schema = 'public' AND table_name = $1 \
         ORDER BY ordinal_position",
    )
    .bind(&target.name)
    .fetch_all(&mut *conn)
    .await
    .map_err(|e| format!("Failed to inspect columns for table '{}': {e}", target.name))?;

    let db_col_map: std::collections::HashMap<String, &DbColumnInfo> = db_columns
        .iter()
        .map(|c| (c.column_name.clone(), c))
        .collect();

    // Check for target columns missing in database
    for target_col in &target.columns {
        if let Some(existing_col) = db_col_map.get(&target_col.name) {
            // Validate type compatibility
            let compatible = target_col.col_type.is_compatible_with(
                &existing_col.data_type,
                &existing_col.udt_name,
                existing_col.character_maximum_length,
                existing_col.numeric_precision,
                existing_col.numeric_scale,
            );

            if !compatible {
                return Err(format!(
                    "Unsafe type mismatch detected in table '{}', column '{}': \
                     existing database type is '{}/{}' (max_len: {:?}), but entity specifies '{}'. \
                     Automatic destructive conversion is rejected. DBA action required: execute manual migration.",
                    target.name,
                    target_col.name,
                    existing_col.data_type,
                    existing_col.udt_name,
                    existing_col.character_maximum_length,
                    target_col.col_type.to_sql()
                ));
            }

            // Check nullability tightening
            let is_db_nullable = existing_col.is_nullable.to_uppercase() == "YES";
            if !target_col.is_nullable && is_db_nullable && !target_col.is_primary_key {
                // Entity requires NOT NULL, but DB column is currently nullable.
                // Check if any existing rows contain NULL before tightening.
                let null_count_sql = format!(
                    "SELECT COUNT(*) FROM {} WHERE {} IS NULL",
                    quote_ident(&target.name),
                    quote_ident(&target_col.name)
                );
                let (null_rows,): (i64,) = sqlx::query_as(AssertSqlSafe(&*null_count_sql))
                    .fetch_one(&mut *conn)
                    .await
                    .map_err(|e| {
                        format!(
                            "Failed to check nulls for '{}.{}': {e}",
                            target.name, target_col.name
                        )
                    })?;

                if null_rows > 0 {
                    return Err(format!(
                        "Unsafe nullability change rejected for table '{}', column '{}': \
                         entity defines NOT NULL, but existing table has {} rows with NULL values. \
                         DBA action required: backfill NULL records before applying NOT NULL constraint.",
                        target.name, target_col.name, null_rows
                    ));
                } else {
                    let alter_not_null_sql = format!(
                        "ALTER TABLE {} ALTER COLUMN {} SET NOT NULL",
                        quote_ident(&target.name),
                        quote_ident(&target_col.name)
                    );
                    sqlx::query(AssertSqlSafe(&*alter_not_null_sql))
                        .execute(&mut *conn)
                        .await
                        .map_err(|e| {
                            format!(
                                "Failed to set NOT NULL on '{}.{}': {e}",
                                target.name, target_col.name
                            )
                        })?;
                    stats.constraints_added += 1;
                }
            }
        } else {
            // Missing column: verify safety before adding
            let is_safe = target_col.is_nullable || target_col.default.is_some();
            if !is_safe {
                // Column is NOT NULL with NO default: check if table has rows
                let count_sql = format!("SELECT COUNT(*) FROM {}", quote_ident(&target.name));
                let (row_count,): (i64,) = sqlx::query_as(AssertSqlSafe(&*count_sql))
                    .fetch_one(&mut *conn)
                    .await
                    .map_err(|e| format!("Failed to count rows in table '{}': {e}", target.name))?;

                if row_count > 0 {
                    return Err(format!(
                        "Unsafe schema change rejected for table '{}': \
                         entity adds non-nullable column '{}' without a default, but table contains {} existing rows. \
                         DBA action required: provide a default value, backfill data, or make the column nullable.",
                        target.name, target_col.name, row_count
                    ));
                }
            }

            // Safe additive column change
            let mut add_col_sql = format!(
                "ALTER TABLE {} ADD COLUMN IF NOT EXISTS {} {}",
                quote_ident(&target.name),
                quote_ident(&target_col.name),
                target_col.col_type.to_sql()
            );

            if let Some(ref def) = target_col.default {
                add_col_sql.push_str(&format!(" DEFAULT {def}"));
            }
            if !target_col.is_nullable {
                add_col_sql.push_str(" NOT NULL");
            }
            if target_col.is_unique {
                add_col_sql.push_str(" UNIQUE");
            }

            tracing::info!(
                "Adding missing column to table '{}': {}",
                target.name,
                target_col.name
            );
            sqlx::query(AssertSqlSafe(&*add_col_sql))
                .execute(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to add column '{}.{}': {e}",
                        target.name, target_col.name
                    )
                })?;

            stats.columns_added += 1;
        }
    }

    // Detect unmapped columns present in database but absent from entity
    let target_col_names: HashSet<String> = target.columns.iter().map(|c| c.name.clone()).collect();
    for db_col in &db_columns {
        if !target_col_names.contains(&db_col.column_name) {
            stats.unmapped_columns_detected += 1;
            tracing::info!(
                "Table '{}' has unmapped column '{}' (data preserved without dropping).",
                target.name,
                db_col.column_name
            );
        }
    }

    Ok(())
}

async fn reconcile_table_constraints_and_indexes(
    conn: &mut PgConnection,
    target: &TableSchema,
    stats: &mut SyncStats,
) -> Result<(), String> {
    // Introspect existing constraints for target table
    let db_constraints: Vec<DbConstraintInfo> = sqlx::query_as(
        "SELECT c.conname, c.contype::text, pg_get_constraintdef(c.oid) AS condef \
         FROM pg_constraint c \
         JOIN pg_namespace n ON n.oid = c.connamespace \
         WHERE n.nspname = 'public' \
           AND c.conrelid = $1::regclass",
    )
    .bind(&target.name)
    .fetch_all(&mut *conn)
    .await
    .map_err(|e| {
        format!(
            "Failed to inspect constraints for table '{}': {e}",
            target.name
        )
    })?;

    let existing_constraint_names: HashSet<String> =
        db_constraints.iter().map(|c| c.conname.clone()).collect();

    // 1. Reconcile Foreign Keys
    for fk in &target.foreign_keys {
        let fk_pattern_quoted = format!("FOREIGN KEY ({})", quote_ident(&fk.column));
        let fk_pattern_raw = format!("FOREIGN KEY ({})", fk.column);
        let already_exists = existing_constraint_names.contains(&fk.name)
            || db_constraints.iter().any(|c| {
                c.contype == "f"
                    && (c.condef.contains(&fk_pattern_quoted) || c.condef.contains(&fk_pattern_raw))
            });

        if !already_exists {
            let mut fk_sql = format!(
                "ALTER TABLE {} ADD CONSTRAINT {} FOREIGN KEY ({}) REFERENCES {}({})",
                quote_ident(&target.name),
                quote_ident(&fk.name),
                quote_ident(&fk.column),
                quote_ident(&fk.foreign_table),
                quote_ident(&fk.foreign_column)
            );
            if let Some(ref on_delete) = fk.on_delete {
                fk_sql.push_str(&format!(" ON DELETE {on_delete}"));
            }
            if let Some(ref on_update) = fk.on_update {
                fk_sql.push_str(&format!(" ON UPDATE {on_update}"));
            }

            tracing::info!(
                "Adding foreign key constraint '{}' to '{}'",
                fk.name,
                target.name
            );
            sqlx::query(AssertSqlSafe(&*fk_sql))
                .execute(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to add foreign key '{}' on '{}': {e}",
                        fk.name, target.name
                    )
                })?;

            stats.constraints_added += 1;
        }
    }

    // 2. Reconcile Unique Constraints
    for uq in &target.unique_constraints {
        let already_exists = existing_constraint_names.contains(&uq.name)
            || db_constraints
                .iter()
                .any(|c| c.contype == "u" && uq.columns.iter().all(|col| c.condef.contains(col)));

        if !already_exists {
            let uq_cols = uq
                .columns
                .iter()
                .map(|c| quote_ident(c))
                .collect::<Vec<_>>()
                .join(", ");
            let uq_sql = format!(
                "ALTER TABLE {} ADD CONSTRAINT {} UNIQUE ({})",
                quote_ident(&target.name),
                quote_ident(&uq.name),
                uq_cols
            );

            tracing::info!(
                "Adding unique constraint '{}' to '{}'",
                uq.name,
                target.name
            );
            sqlx::query(AssertSqlSafe(&*uq_sql))
                .execute(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to add unique constraint '{}' on '{}': {e}",
                        uq.name, target.name
                    )
                })?;

            stats.constraints_added += 1;
        }
    }

    // 3. Reconcile Check Constraints
    for chk in &target.check_constraints {
        let already_exists = existing_constraint_names.contains(&chk.name);

        if !already_exists {
            // Validate existing data against check constraint expression
            let validate_sql = format!(
                "SELECT COUNT(*) FROM {} WHERE NOT ({})",
                quote_ident(&target.name),
                chk.expression
            );
            let (invalid_rows,): (i64,) = sqlx::query_as(AssertSqlSafe(&*validate_sql))
                .fetch_one(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to validate check constraint '{}' against table '{}': {e}",
                        chk.name, target.name
                    )
                })?;

            if invalid_rows > 0 {
                return Err(format!(
                    "Unsafe check constraint rejected for table '{}', constraint '{}': \
                     {} existing rows violate the check condition ({}). \
                     DBA action required: correct existing data before adding constraint.",
                    target.name, chk.name, invalid_rows, chk.expression
                ));
            }

            let chk_sql = format!(
                "ALTER TABLE {} ADD CONSTRAINT {} CHECK ({})",
                quote_ident(&target.name),
                quote_ident(&chk.name),
                chk.expression
            );

            tracing::info!(
                "Adding check constraint '{}' to '{}'",
                chk.name,
                target.name
            );
            sqlx::query(AssertSqlSafe(&*chk_sql))
                .execute(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to add check constraint '{}' on '{}': {e}",
                        chk.name, target.name
                    )
                })?;

            stats.constraints_added += 1;
        }
    }

    // 4. Introspect and reconcile Indexes
    let db_indexes: Vec<DbIndexInfo> = sqlx::query_as(
        "SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename = $1",
    )
    .bind(&target.name)
    .fetch_all(&mut *conn)
    .await
    .map_err(|e| format!("Failed to inspect indexes for table '{}': {e}", target.name))?;

    let existing_index_names: HashSet<String> =
        db_indexes.iter().map(|i| i.indexname.clone()).collect();

    for idx in &target.indexes {
        let already_exists = existing_index_names.contains(&idx.name)
            || db_indexes.iter().any(|existing| {
                idx.columns
                    .iter()
                    .all(|col| existing.indexdef.contains(col))
                    && (existing.indexdef.contains("UNIQUE") == idx.is_unique)
            });

        if !already_exists {
            let unique_kw = if idx.is_unique { "UNIQUE " } else { "" };
            let nulls_distinct_clause = if idx.nulls_not_distinct {
                " NULLS NOT DISTINCT"
            } else {
                ""
            };
            let cols = idx
                .columns
                .iter()
                .map(|c| quote_ident(c))
                .collect::<Vec<_>>()
                .join(", ");
            let where_clause = idx
                .predicate
                .as_ref()
                .map(|p| format!(" WHERE {p}"))
                .unwrap_or_default();

            let idx_sql = format!(
                "CREATE {}INDEX IF NOT EXISTS {} ON {} ({}){}{}",
                unique_kw,
                quote_ident(&idx.name),
                quote_ident(&target.name),
                cols,
                nulls_distinct_clause,
                where_clause
            );

            tracing::info!("Creating missing index '{}' on '{}'", idx.name, target.name);
            sqlx::query(AssertSqlSafe(&*idx_sql))
                .execute(&mut *conn)
                .await
                .map_err(|e| {
                    format!(
                        "Failed to create index '{}' on '{}': {e}",
                        idx.name, target.name
                    )
                })?;

            stats.indexes_created += 1;
        }
    }

    Ok(())
}

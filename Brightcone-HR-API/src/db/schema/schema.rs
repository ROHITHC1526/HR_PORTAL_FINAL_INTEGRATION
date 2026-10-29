use std::fmt;

/// Represents supported PostgreSQL data types for entity-first schema synchronization.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PostgresType {
    BigSerial,
    Serial,
    SmallSerial,
    BigInt,
    Integer,
    SmallInt,
    VarChar(Option<usize>),
    Text,
    Boolean,
    Date,
    Time,
    Timestamp,
    TimestampTz,
    Numeric(Option<u8>, Option<u8>),
    Uuid,
    Json,
    Jsonb,
    Custom(String),
}

impl PostgresType {
    /// Returns the canonical PostgreSQL SQL representation of this type.
    pub fn to_sql(&self) -> String {
        match self {
            PostgresType::BigSerial => "BIGSERIAL".to_string(),
            PostgresType::Serial => "SERIAL".to_string(),
            PostgresType::SmallSerial => "SMALLSERIAL".to_string(),
            PostgresType::BigInt => "BIGINT".to_string(),
            PostgresType::Integer => "INTEGER".to_string(),
            PostgresType::SmallInt => "SMALLINT".to_string(),
            PostgresType::VarChar(Some(len)) => format!("VARCHAR({len})"),
            PostgresType::VarChar(None) => "VARCHAR".to_string(),
            PostgresType::Text => "TEXT".to_string(),
            PostgresType::Boolean => "BOOLEAN".to_string(),
            PostgresType::Date => "DATE".to_string(),
            PostgresType::Time => "TIME".to_string(),
            PostgresType::Timestamp => "TIMESTAMP".to_string(),
            PostgresType::TimestampTz => "TIMESTAMPTZ".to_string(),
            PostgresType::Numeric(Some(p), Some(s)) => format!("NUMERIC({p}, {s})"),
            PostgresType::Numeric(Some(p), None) => format!("NUMERIC({p})"),
            PostgresType::Numeric(_, _) => "NUMERIC".to_string(),
            PostgresType::Uuid => "UUID".to_string(),
            PostgresType::Json => "JSON".to_string(),
            PostgresType::Jsonb => "JSONB".to_string(),
            PostgresType::Custom(s) => s.clone(),
        }
    }

    /// Verifies if an existing database column definition is compatible with this entity type.
    pub fn is_compatible_with(
        &self,
        data_type: &str,
        udt_name: &str,
        char_max_len: Option<i32>,
        _num_prec: Option<i32>,
        _num_scale: Option<i32>,
    ) -> bool {
        let dt = data_type.to_lowercase();
        let udt = udt_name.to_lowercase();

        match self {
            PostgresType::BigSerial | PostgresType::BigInt => dt == "bigint" || udt == "int8",
            PostgresType::Serial | PostgresType::Integer => dt == "integer" || udt == "int4",
            PostgresType::SmallSerial | PostgresType::SmallInt => dt == "smallint" || udt == "int2",
            PostgresType::VarChar(expected_len) => {
                if dt == "character varying" || udt == "varchar" {
                    if let Some(expected) = expected_len {
                        // If DB column length is specified, ensure it can hold expected length
                        char_max_len.is_none_or(|actual| actual >= *expected as i32)
                    } else {
                        true
                    }
                } else {
                    dt == "text" || udt == "text"
                }
            }
            PostgresType::Text => {
                dt == "text" || udt == "text" || dt == "character varying" || udt == "varchar"
            }
            PostgresType::Boolean => dt == "boolean" || udt == "bool",
            PostgresType::Date => dt == "date" || udt == "date",
            PostgresType::Time => dt == "time without time zone" || udt == "time",
            PostgresType::Timestamp => dt == "timestamp without time zone" || udt == "timestamp",
            PostgresType::TimestampTz => dt == "timestamp with time zone" || udt == "timestamptz",
            PostgresType::Numeric(_, _) => dt == "numeric" || udt == "numeric",
            PostgresType::Uuid => dt == "uuid" || udt == "uuid",
            PostgresType::Json => dt == "json" || udt == "json",
            PostgresType::Jsonb => dt == "jsonb" || udt == "jsonb",
            PostgresType::Custom(custom) => {
                dt == custom.to_lowercase() || udt == custom.to_lowercase()
            }
        }
    }
}

impl fmt::Display for PostgresType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_sql())
    }
}

/// Normalized column schema representing a single entity field in PostgreSQL.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ColumnSchema {
    pub name: String,
    pub col_type: PostgresType,
    pub is_nullable: bool,
    pub default: Option<String>,
    pub is_primary_key: bool,
    pub is_unique: bool,
}

impl ColumnSchema {
    pub fn new(name: impl Into<String>, col_type: PostgresType) -> Self {
        Self {
            name: name.into(),
            col_type,
            is_nullable: true,
            default: None,
            is_primary_key: false,
            is_unique: false,
        }
    }

    pub fn not_null(mut self) -> Self {
        self.is_nullable = false;
        self
    }

    pub fn nullable(mut self) -> Self {
        self.is_nullable = true;
        self
    }

    pub fn default(mut self, expr: impl Into<String>) -> Self {
        self.default = Some(expr.into());
        self
    }

    pub fn primary_key(mut self) -> Self {
        self.is_primary_key = true;
        self.is_nullable = false;
        self
    }

    pub fn unique(mut self) -> Self {
        self.is_unique = true;
        self
    }
}

/// Represents a foreign key constraint referencing another table.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ForeignKeySchema {
    pub name: String,
    pub column: String,
    pub foreign_table: String,
    pub foreign_column: String,
    pub on_delete: Option<String>,
    pub on_update: Option<String>,
}

impl ForeignKeySchema {
    pub fn new(
        name: impl Into<String>,
        column: impl Into<String>,
        foreign_table: impl Into<String>,
        foreign_column: impl Into<String>,
    ) -> Self {
        Self {
            name: name.into(),
            column: column.into(),
            foreign_table: foreign_table.into(),
            foreign_column: foreign_column.into(),
            on_delete: None,
            on_update: None,
        }
    }

    pub fn on_delete(mut self, action: impl Into<String>) -> Self {
        self.on_delete = Some(action.into());
        self
    }

    pub fn on_update(mut self, action: impl Into<String>) -> Self {
        self.on_update = Some(action.into());
        self
    }
}

/// Represents a table-level unique constraint across one or more columns.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UniqueConstraintSchema {
    pub name: String,
    pub columns: Vec<String>,
}

impl UniqueConstraintSchema {
    pub fn new(name: impl Into<String>, columns: &[&str]) -> Self {
        Self {
            name: name.into(),
            columns: columns.iter().map(|s| s.to_string()).collect(),
        }
    }
}

/// Represents a SQL check constraint on a table.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CheckConstraintSchema {
    pub name: String,
    pub expression: String,
}

impl CheckConstraintSchema {
    pub fn new(name: impl Into<String>, expression: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            expression: expression.into(),
        }
    }
}

/// Represents an index on a database table.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IndexSchema {
    pub name: String,
    pub columns: Vec<String>,
    pub is_unique: bool,
    pub predicate: Option<String>,
    pub nulls_not_distinct: bool,
}

impl IndexSchema {
    pub fn new(name: impl Into<String>, columns: &[&str]) -> Self {
        Self {
            name: name.into(),
            columns: columns.iter().map(|s| s.to_string()).collect(),
            is_unique: false,
            predicate: None,
            nulls_not_distinct: false,
        }
    }

    pub fn unique(mut self) -> Self {
        self.is_unique = true;
        self
    }

    pub fn predicate(mut self, predicate: impl Into<String>) -> Self {
        self.predicate = Some(predicate.into());
        self
    }

    pub fn nulls_not_distinct(mut self) -> Self {
        self.nulls_not_distinct = true;
        self
    }
}

/// Full normalized schema for a single database table.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TableSchema {
    pub name: String,
    pub columns: Vec<ColumnSchema>,
    pub primary_key: Vec<String>,
    pub foreign_keys: Vec<ForeignKeySchema>,
    pub unique_constraints: Vec<UniqueConstraintSchema>,
    pub check_constraints: Vec<CheckConstraintSchema>,
    pub indexes: Vec<IndexSchema>,
}

impl TableSchema {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            columns: Vec::new(),
            primary_key: Vec::new(),
            foreign_keys: Vec::new(),
            unique_constraints: Vec::new(),
            check_constraints: Vec::new(),
            indexes: Vec::new(),
        }
    }

    pub fn column(mut self, col: ColumnSchema) -> Self {
        if col.is_primary_key && !self.primary_key.contains(&col.name) {
            self.primary_key.push(col.name.clone());
        }
        self.columns.push(col);
        self
    }

    pub fn primary_key(mut self, cols: &[&str]) -> Self {
        self.primary_key = cols.iter().map(|s| s.to_string()).collect();
        self
    }

    pub fn foreign_key(mut self, fk: ForeignKeySchema) -> Self {
        self.foreign_keys.push(fk);
        self
    }

    pub fn unique_constraint(mut self, uq: UniqueConstraintSchema) -> Self {
        self.unique_constraints.push(uq);
        self
    }

    pub fn check_constraint(mut self, chk: CheckConstraintSchema) -> Self {
        self.check_constraints.push(chk);
        self
    }

    pub fn index(mut self, idx: IndexSchema) -> Self {
        self.indexes.push(idx);
        self
    }
}

/// Trait to be implemented by any database-backed Rust entity.
/// Defines the single source of truth for the entity's database schema.
pub trait EntitySchema: Send + Sync {
    fn table_name() -> &'static str;
    fn schema() -> TableSchema;
}

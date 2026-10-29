use async_trait::async_trait;
use sqlx::{AssertSqlSafe, FromRow, PgPool};

/// Shared repository abstraction for database-backed entities.
#[async_trait]
pub trait Repository<T>: Send + Sync
where
    T: Send + Unpin + for<'r> FromRow<'r, sqlx::postgres::PgRow>,
{
    /// Entity table name.
    fn table_name() -> &'static str;

    /// Counts all records in the entity table.
    async fn count(pool: &PgPool) -> Result<i64, sqlx::Error> {
        let sql = format!("SELECT COUNT(*) FROM {}", Self::table_name());
        let (cnt,): (i64,) = sqlx::query_as(AssertSqlSafe(&*sql)).fetch_one(pool).await?;
        Ok(cnt)
    }

    /// Fetches all records from the table ordered by id ascending.
    async fn find_all(pool: &PgPool) -> Result<Vec<T>, sqlx::Error> {
        let sql = format!("SELECT * FROM {} ORDER BY id ASC", Self::table_name());
        sqlx::query_as(AssertSqlSafe(&*sql)).fetch_all(pool).await
    }

    /// Fetches an entity by its primary key ID.
    async fn find_by_id(pool: &PgPool, id: i64) -> Result<Option<T>, sqlx::Error> {
        let sql = format!("SELECT * FROM {} WHERE id = $1", Self::table_name());
        sqlx::query_as(AssertSqlSafe(&*sql))
            .bind(id)
            .fetch_optional(pool)
            .await
    }
}

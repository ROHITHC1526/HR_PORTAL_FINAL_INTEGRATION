use loco_rs::app::AppContext;
use sqlx::PgPool;

/// Abstraction to obtain a PostgreSQL connection pool from either Loco's AppContext
/// or directly from a sqlx::PgPool.
pub trait AsPgPool: Send + Sync + 'static {
    fn as_pg_pool(&self) -> &PgPool;
}

impl AsPgPool for PgPool {
    fn as_pg_pool(&self) -> &PgPool {
        self
    }
}

impl AsPgPool for AppContext {
    fn as_pg_pool(&self) -> &PgPool {
        self.db.get_postgres_connection_pool()
    }
}

/// Helper to obtain a reference to the PostgreSQL connection pool from Loco's AppContext.
pub fn get_pg_pool(ctx: &AppContext) -> &PgPool {
    ctx.db.get_postgres_connection_pool()
}

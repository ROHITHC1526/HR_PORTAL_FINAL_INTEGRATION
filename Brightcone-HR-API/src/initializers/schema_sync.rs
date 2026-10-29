use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Initializer},
    Result,
};

pub struct SchemaSyncInitializer;

#[async_trait]
impl Initializer for SchemaSyncInitializer {
    fn name(&self) -> String {
        "people_schema_sync".to_owned()
    }

    async fn before_run(&self, ctx: &AppContext) -> Result<()> {
        crate::database::people_sync::run_autonomous_sync(&ctx.db)
            .await
            .map_err(|e| loco_rs::Error::string(&format!("People schema sync failed: {e}")))?;
        tracing::info!("People Plus schema synchronized before HTTP routes are served");
        Ok(())
    }
}

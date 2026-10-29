use axum::extract::Extension;
use loco_rs::prelude::*;

use crate::models::SharedState;

// ---------------------------------------------------------------------------
// Route Handlers: Dashboard
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_dashboard_stats(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.get_dashboard_stats().await {
        Ok(stats) => format::json(stats),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

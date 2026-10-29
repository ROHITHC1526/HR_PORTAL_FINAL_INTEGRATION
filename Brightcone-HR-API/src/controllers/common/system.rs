use axum::extract::Extension;
use loco_rs::prelude::*;

use crate::models::SharedState;

// ---------------------------------------------------------------------------
// Route Handlers: Health & Status
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_health(Extension(state): Extension<SharedState>) -> Result<Response> {
    let db_latency = match state.repo.check_database_health().await {
        Ok(latency) => {
            if let Ok(mut t) = state.transient.write() {
                t.last_db_latency_ms = latency.round() as u64;
            }
            Some(latency)
        }
        Err(err) => {
            tracing::error!("[Health Check] Database query failed: {err}");
            None
        }
    };

    let status = if db_latency.is_some() {
        "ok"
    } else {
        "degraded"
    };

    format::json(serde_json::json!({
        "status": status,
        "database": if db_latency.is_some() { "ok" } else { "down" },
        "database_connected": db_latency.is_some(),
        "database_latency_ms": db_latency,
        "app": "Brightcone HR Portal",
        "version": "1.0.0"
    }))
}

// ---------------------------------------------------------------------------
// Wake-up Calls & Heartbeat Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_wakeup_status(Extension(state): Extension<SharedState>) -> Result<Response> {
    format::json(state.get_wakeup_info())
}

#[debug_handler]
pub async fn api_trigger_wakeup(Extension(state): Extension<SharedState>) -> Result<Response> {
    state.record_wakeup_ping();
    format::json(state.get_wakeup_info())
}

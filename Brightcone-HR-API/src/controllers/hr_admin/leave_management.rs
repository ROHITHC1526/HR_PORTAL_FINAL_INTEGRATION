use axum::{
    extract::{Extension, Path},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::SharedState;

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveStatusPayload {
    pub status: String,
}

// ---------------------------------------------------------------------------
// Route Handlers: HR Admin Leave Management (Approve/Reject)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_update_leave_status(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateLeaveStatusPayload>,
) -> Result<Response> {
    sqlx::query("UPDATE employee_leaves SET status = $1 WHERE id = $2;")
        .bind(&payload.status)
        .bind(&id)
        .execute(state.repo.pool())
        .await
        .map_err(|e| Error::BadRequest(e.to_string()))?;

    format::json(serde_json::json!({
        "success": true,
        "id": id,
        "status": payload.status
    }))
}

use axum::{
    extract::{Extension, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{EmployeeLeave, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct LeaveQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeavePayload {
    pub employee_id: String,
    pub leave_type: String,
    pub from_date: String,
    pub to_date: String,
    pub days: u32,
    pub reason: String,
}

// ---------------------------------------------------------------------------
// Route Handlers: Employee Leaves (Self-Service)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_leaves(
    Extension(state): Extension<SharedState>,
    Query(params): Query<LeaveQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_leaves(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_leave(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateLeavePayload>,
) -> Result<Response> {
    let count_row = sqlx::query("SELECT count(*) as count FROM employee_leaves;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("count");
    let leave_id = format!("LV-{}", 100 + count + 1);

    let leave = EmployeeLeave {
        id: leave_id,
        employee_id: payload.employee_id,
        leave_type: payload.leave_type,
        from_date: payload.from_date,
        to_date: payload.to_date,
        days: payload.days,
        reason: payload.reason,
        status: "Approved".to_string(),
    };

    match state.repo.create_leave(leave).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

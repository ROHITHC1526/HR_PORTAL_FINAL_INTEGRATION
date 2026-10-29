use axum::{
    extract::{Extension, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::{CreateRegularisationPayload, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct AttendanceQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PunchAttendancePayload {
    pub employee_id: String,
}

// ---------------------------------------------------------------------------
// Route Handlers: Employee Attendance (Self-Service)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_attendance(
    Extension(state): Extension<SharedState>,
    Query(params): Query<AttendanceQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_attendance(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_punch_attendance(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<PunchAttendancePayload>,
) -> Result<Response> {
    match state
        .repo
        .record_attendance_punch(&payload.employee_id)
        .await
    {
        Ok(record) => format::json(record),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_attendance_summary(
    Extension(state): Extension<SharedState>,
    Query(params): Query<AttendanceQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.get_attendance_summary(emp_id).await {
        Ok(summary) => format::json(summary),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_punch_clock(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<PunchAttendancePayload>,
) -> Result<Response> {
    match state.repo.punch_clock(&payload.employee_id).await {
        Ok(summary) => format::json(summary),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_regularisations(
    Extension(state): Extension<SharedState>,
    Query(params): Query<AttendanceQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_attendance_regularisations(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_regularisation(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateRegularisationPayload>,
) -> Result<Response> {
    match state.repo.create_attendance_regularisation(payload).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

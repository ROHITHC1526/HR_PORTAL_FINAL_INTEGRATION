use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use loco_rs::prelude::*;

use crate::modules::time::leave_requests;
use crate::modules::time::models::{
    ApproveLeaveRequestPayload, CreateLeaveRequestPayload, LeaveRequestQuery,
    RejectLeaveRequestPayload,
};

#[derive(Debug, serde::Deserialize)]
pub struct BalanceQuery {
    pub employee_id: i64,
    pub year: Option<i32>,
}

pub async fn submit(
    State(ctx): State<AppContext>,
    Json(payload): Json<CreateLeaveRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::create_leave_request_db(pool, payload).await {
        Ok(data) => Ok((StatusCode::CREATED, axum::Json(data)).into_response()),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn list(
    State(ctx): State<AppContext>,
    Query(params): Query<LeaveRequestQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::list_leave_requests_db(pool, params).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn get_one(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::get_leave_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct BalanceYearQuery {
    pub year: Option<i32>,
}

pub async fn get_balance_by_id(
    State(ctx): State<AppContext>,
    Path(employee_id): Path<i64>,
    Query(params): Query<BalanceYearQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::get_employee_leave_balances_db(pool, employee_id, params.year).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn get_balances(
    State(ctx): State<AppContext>,
    Query(params): Query<BalanceQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::get_employee_leave_balances_db(pool, params.employee_id, params.year)
        .await
    {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn approve(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<ApproveLeaveRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::approve_leave_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn reject(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<RejectLeaveRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::reject_leave_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn cancel(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match leave_requests::cancel_leave_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub fn routes() -> Routes {
    Routes::new()
        // Hyphenated variants matching frontend api.ts
        .add("/leave-requests", get(list).post(submit))
        .add("/leave-requests/{id}", get(get_one))
        .add("/leave-requests/{id}/approve", post(approve))
        .add("/leave-requests/{id}/reject", post(reject))
        .add("/leave-requests/{id}/cancel", post(cancel))
        .add("/leave-requests/balance/{id}", get(get_balance_by_id))
        .add("/api/leave-requests", get(list).post(submit))
        .add("/api/leave-requests/{id}", get(get_one))
        .add("/api/leave-requests/{id}/approve", post(approve))
        .add("/api/leave-requests/{id}/reject", post(reject))
        .add("/api/leave-requests/{id}/cancel", post(cancel))
        .add("/api/leave-requests/balance/{id}", get(get_balance_by_id))
        // Slashed variants
        .add("/leave/requests", get(list).post(submit))
        .add("/leave/requests/{id}", get(get_one))
        .add("/leave/requests/{id}/approve", post(approve))
        .add("/leave/requests/{id}/reject", post(reject))
        .add("/leave/requests/{id}/cancel", post(cancel))
        .add("/leave/balances", get(get_balances))
        .add("/leave/balance/{id}", get(get_balance_by_id))
        .add("/api/leave/requests", get(list).post(submit))
        .add("/api/leave/requests/{id}", get(get_one))
        .add("/api/leave/requests/{id}/approve", post(approve))
        .add("/api/leave/requests/{id}/reject", post(reject))
        .add("/api/leave/requests/{id}/cancel", post(cancel))
        .add("/api/leave/balances", get(get_balances))
        .add("/api/leave/balance/{id}", get(get_balance_by_id))
}

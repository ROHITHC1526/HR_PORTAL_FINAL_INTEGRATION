use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use loco_rs::prelude::*;

use crate::modules::time::comp_off;
use crate::modules::time::models::{
    ApproveCompOffRequestPayload, CompOffQuery, CreateCompOffRequestPayload, GrantCompOffPayload,
    RejectCompOffRequestPayload,
};

#[derive(Debug, serde::Deserialize)]
pub struct CompOffBalanceQuery {
    pub employee_id: i64,
}

pub async fn get_balance(
    State(ctx): State<AppContext>,
    Query(params): Query<CompOffBalanceQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::get_comp_off_balance_db(pool, params.employee_id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn list_entitlements(
    State(ctx): State<AppContext>,
    Query(params): Query<CompOffQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::list_entitlements_db(pool, params).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn grant_entitlement(
    State(ctx): State<AppContext>,
    Json(payload): Json<GrantCompOffPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::grant_entitlement_db(pool, payload).await {
        Ok(data) => Ok((StatusCode::CREATED, axum::Json(data)).into_response()),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn list_requests(
    State(ctx): State<AppContext>,
    Query(params): Query<CompOffQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::list_comp_off_requests_db(pool, params).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn get_request(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::get_comp_off_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn submit_request(
    State(ctx): State<AppContext>,
    Json(payload): Json<CreateCompOffRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::create_comp_off_request_db(pool, payload).await {
        Ok(data) => Ok((StatusCode::CREATED, axum::Json(data)).into_response()),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn approve_request(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<ApproveCompOffRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::approve_comp_off_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn reject_request(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<RejectCompOffRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::reject_comp_off_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn cancel_request(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match comp_off::cancel_comp_off_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/comp-off/balance", get(get_balance))
        .add(
            "/comp-off/entitlements",
            get(list_entitlements).post(grant_entitlement),
        )
        .add(
            "/comp-off/requests",
            get(list_requests).post(submit_request),
        )
        .add(
            "/comp-off-requests",
            get(list_requests).post(submit_request),
        )
        .add("/comp-off/requests/{id}", get(get_request))
        .add("/comp-off-requests/{id}", get(get_request))
        .add("/comp-off/requests/{id}/approve", post(approve_request))
        .add("/comp-off/requests/{id}/reject", post(reject_request))
        .add("/comp-off/requests/{id}/cancel", post(cancel_request))
        .add("/api/comp-off/balance", get(get_balance))
        .add(
            "/api/comp-off/entitlements",
            get(list_entitlements).post(grant_entitlement),
        )
        .add(
            "/api/comp-off/requests",
            get(list_requests).post(submit_request),
        )
        .add(
            "/api/comp-off-requests",
            get(list_requests).post(submit_request),
        )
        .add("/api/comp-off/requests/{id}", get(get_request))
        .add("/api/comp-off-requests/{id}", get(get_request))
        .add("/api/comp-off/requests/{id}/approve", post(approve_request))
        .add("/api/comp-off/requests/{id}/reject", post(reject_request))
        .add("/api/comp-off/requests/{id}/cancel", post(cancel_request))
}

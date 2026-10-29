use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use loco_rs::prelude::*;

use crate::modules::time::models::{
    ApproveWfhRequestPayload, CreateWfhRequestPayload, RejectWfhRequestPayload, WfhRequestQuery,
};
use crate::modules::time::wfh;

pub async fn list(
    State(ctx): State<AppContext>,
    Query(params): Query<WfhRequestQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::list_wfh_requests_db(pool, params).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn get_one(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::get_wfh_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn submit(
    State(ctx): State<AppContext>,
    Json(payload): Json<CreateWfhRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::create_wfh_request_db(pool, payload).await {
        Ok(data) => Ok((StatusCode::CREATED, axum::Json(data)).into_response()),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn approve(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<ApproveWfhRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::approve_wfh_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn reject(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<RejectWfhRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::reject_wfh_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn cancel(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match wfh::cancel_wfh_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub fn routes() -> Routes {
    Routes::new()
        // Hyphenated routes matching frontend api.ts
        .add("/wfh-requests", get(list).post(submit))
        .add("/wfh-requests/{id}", get(get_one))
        .add("/wfh-requests/{id}/approve", post(approve))
        .add("/wfh-requests/{id}/reject", post(reject))
        .add("/wfh-requests/{id}/cancel", post(cancel))
        .add("/api/wfh-requests", get(list).post(submit))
        .add("/api/wfh-requests/{id}", get(get_one))
        .add("/api/wfh-requests/{id}/approve", post(approve))
        .add("/api/wfh-requests/{id}/reject", post(reject))
        .add("/api/wfh-requests/{id}/cancel", post(cancel))
        // Slashed routes
        .add("/wfh/requests", get(list).post(submit))
        .add("/wfh/requests/{id}", get(get_one))
        .add("/wfh/requests/{id}/approve", post(approve))
        .add("/wfh/requests/{id}/reject", post(reject))
        .add("/wfh/requests/{id}/cancel", post(cancel))
        .add("/api/wfh/requests", get(list).post(submit))
        .add("/api/wfh/requests/{id}", get(get_one))
        .add("/api/wfh/requests/{id}/approve", post(approve))
        .add("/api/wfh/requests/{id}/reject", post(reject))
        .add("/api/wfh/requests/{id}/cancel", post(cancel))
}

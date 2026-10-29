use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use loco_rs::prelude::*;

use crate::modules::time::models::{
    ApproveSwapRequestPayload, CreateSwapRequestPayload, RejectSwapRequestPayload, SwapRequestQuery,
};
use crate::modules::time::swaps;

pub async fn list(
    State(ctx): State<AppContext>,
    Query(params): Query<SwapRequestQuery>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::list_swap_requests_db(pool, params).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn get_one(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::get_swap_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn submit(
    State(ctx): State<AppContext>,
    Json(payload): Json<CreateSwapRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::create_swap_request_db(pool, payload).await {
        Ok(data) => Ok((StatusCode::CREATED, axum::Json(data)).into_response()),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn approve(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<ApproveSwapRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::approve_swap_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn reject(
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(payload): Json<RejectSwapRequestPayload>,
) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::reject_swap_request_db(pool, id, payload).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub async fn cancel(State(ctx): State<AppContext>, Path(id): Path<i64>) -> Result<Response> {
    let pool = ctx.db.get_postgres_connection_pool();
    match swaps::cancel_swap_request_db(pool, id).await {
        Ok(data) => format::json(data),
        Err((code, body)) => Ok((code, body).into_response()),
    }
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/swap-requests", get(list).post(submit))
        .add("/swap-requests/{id}", get(get_one))
        .add("/swap-requests/{id}/approve", post(approve))
        .add("/swap-requests/{id}/reject", post(reject))
        .add("/swap-requests/{id}/cancel", post(cancel))
        .add("/api/swap-requests", get(list).post(submit))
        .add("/api/swap-requests/{id}", get(get_one))
        .add("/api/swap-requests/{id}/approve", post(approve))
        .add("/api/swap-requests/{id}/reject", post(reject))
        .add("/api/swap-requests/{id}/cancel", post(cancel))
}

use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::{CreateLetterRequestPayload, SharedState, UploadDocumentPayload};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct DocumentQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct AcknowledgePolicyPayload {
    pub employee_id: Option<String>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Policies, Documents & Letter Requests
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_company_policies(
    Extension(state): Extension<SharedState>,
    Query(params): Query<DocumentQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_company_policies(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_acknowledge_policy(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<AcknowledgePolicyPayload>,
) -> Result<Response> {
    let emp_id = payload.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.acknowledge_policy(&id, emp_id).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_my_documents(
    Extension(state): Extension<SharedState>,
    Query(params): Query<DocumentQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_employee_documents(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_upload_document(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<UploadDocumentPayload>,
) -> Result<Response> {
    match state.repo.upload_employee_document(payload).await {
        Ok(doc) => format::json(doc),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_letter_requests(
    Extension(state): Extension<SharedState>,
    Query(params): Query<DocumentQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_letter_requests(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_letter_request(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateLetterRequestPayload>,
) -> Result<Response> {
    match state.repo.create_letter_request(payload).await {
        Ok(req) => format::json(req),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

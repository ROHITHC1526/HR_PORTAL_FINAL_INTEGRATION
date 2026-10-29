use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{CandidateTracker, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct CandidateFilterParams {
    pub q: Option<String>,
    pub status: Option<String>,
    pub job_id: Option<usize>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCandidatePayload {
    pub name: String,
    pub email: String,
    pub job_id: usize,
    pub skills: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCandidateStatusPayload {
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCandidateTrackerPayload {
    pub full_name: String,
    pub applied_for: String,
    pub source: String,
    pub total_experience: u32,
    pub current_ctc: Option<u64>,
    pub expected_ctc: u64,
    pub notice_period: Option<u32>,
    pub current_location: Option<String>,
    pub resume: Option<String>,
    pub consent_to_store_data: Option<String>,
    pub stage: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub employee_id: Option<String>,
    pub archived: Option<bool>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Candidates (Job pipeline)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_candidates(
    Extension(state): Extension<SharedState>,
    Query(query): Query<CandidateFilterParams>,
) -> Result<Response> {
    match state
        .repo
        .list_candidates(query.q.as_deref(), query.status.as_deref(), query.job_id)
        .await
    {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_candidate(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateCandidatePayload>,
) -> Result<Response> {
    let skills = payload.skills.unwrap_or_default();
    let status = payload.status.unwrap_or_else(|| "Applied".to_string());

    let job_title = sqlx::query("SELECT title FROM jobs WHERE id = $1 LIMIT 1;")
        .bind(payload.job_id as i32)
        .fetch_optional(state.repo.pool())
        .await
        .ok()
        .flatten()
        .map(|r| r.get::<String, _>("title"))
        .unwrap_or_else(|| "General Application".to_string());

    match state
        .repo
        .create_candidate(
            payload.name,
            payload.email,
            payload.job_id,
            job_title,
            skills,
            status,
        )
        .await
    {
        Ok(candidate) => format::json(candidate),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_candidate_status(
    Path(id): Path<usize>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<UpdateCandidateStatusPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_candidate_status(id, &payload.status)
        .await
    {
        Ok(true) => format::json(serde_json::json!({ "success": true })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Candidate Tracker (Sourcing pipeline)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_candidate_trackers(
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    match state.repo.list_candidate_trackers().await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_candidate_tracker(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateCandidateTrackerPayload>,
) -> Result<Response> {
    let count_row = sqlx::query("SELECT count(*) as count FROM candidate_trackers;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("count");
    let new_id = format!("CAN-{:04}", count + 1);

    let cand = CandidateTracker {
        id: new_id,
        full_name: payload.full_name,
        applied_for: payload.applied_for,
        source: payload.source,
        total_experience: payload.total_experience,
        current_ctc: payload.current_ctc,
        expected_ctc: payload.expected_ctc,
        notice_period: payload.notice_period,
        current_location: payload.current_location,
        resume: payload.resume,
        consent_to_store_data: payload.consent_to_store_data,
        stage: payload.stage.unwrap_or_else(|| "Applied".to_string()),
        email: payload.email.unwrap_or_default(),
        phone: payload.phone.unwrap_or_default(),
        employee_id: payload.employee_id,
        archived: payload.archived.or(Some(false)),
        created_at: Some("Today".to_string()),
        updated_at: Some("Today".to_string()),
    };

    match state.repo.create_candidate_tracker(cand).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_candidate_tracker(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<CandidateTracker>,
) -> Result<Response> {
    match state.repo.update_candidate_tracker(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_candidate_tracker(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_candidate_tracker(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_convert_candidate_to_employee(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.convert_candidate_to_employee(&id).await {
        Ok(new_emp) => format::json(new_emp),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

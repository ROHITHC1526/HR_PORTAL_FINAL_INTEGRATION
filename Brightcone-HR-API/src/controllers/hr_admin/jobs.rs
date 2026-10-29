use axum::{
    extract::{Extension, Path},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{ManpowerRequirement, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct CreateJobPayload {
    pub title: String,
    pub department: String,
    pub location: String,
    pub skills: String,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateJobStatusPayload {
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateManpowerPayload {
    pub designation: String,
    pub department: String,
    pub positions: u32,
    pub employment_type: Option<String>,
    pub location: Option<String>,
    pub experience: Option<String>,
    pub budget_ctc: Option<String>,
    pub reason: Option<String>,
    pub replacing: Option<String>,
    pub hiring_manager: Option<String>,
    pub required_by: String,
    pub status: Option<String>,
    pub job_description: Option<String>,
    pub archived: Option<bool>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Jobs
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_jobs(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_jobs().await {
        Ok(jobs) => format::json(jobs),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_job(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateJobPayload>,
) -> Result<Response> {
    let status = payload.status.unwrap_or_else(|| "Active".to_string());
    match state
        .repo
        .create_job(
            payload.title,
            payload.department,
            payload.location,
            payload.skills,
            status,
        )
        .await
    {
        Ok(job) => format::json(job),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_job_status(
    Path(id): Path<usize>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<UpdateJobStatusPayload>,
) -> Result<Response> {
    match state.repo.update_job_status(id, payload.status).await {
        Ok(Some(job)) => format::json(job),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Manpower Requirements
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_manpower(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_manpower().await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_manpower(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateManpowerPayload>,
) -> Result<Response> {
    let count_row = sqlx::query("SELECT count(*) as count FROM manpower_requirements;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("count");
    let new_id = format!("MR-{:04}", count + 1);

    let req = ManpowerRequirement {
        id: new_id,
        designation: payload.designation,
        department: payload.department,
        positions: payload.positions,
        employment_type: payload.employment_type.or(Some("Full-time".to_string())),
        location: payload.location.or(Some("Hyderabad".to_string())),
        experience: payload.experience.or(Some("2-5".to_string())),
        budget_ctc: payload.budget_ctc.or(Some("120000".to_string())),
        reason: payload.reason.or(Some("New position".to_string())),
        replacing: payload.replacing.or(Some("—".to_string())),
        hiring_manager: payload.hiring_manager.unwrap_or_else(|| "—".to_string()),
        required_by: payload.required_by,
        status: payload.status.unwrap_or_else(|| "Pending".to_string()),
        job_description: payload.job_description.or(Some(String::new())),
        created_at: Some("Today".to_string()),
        updated_at: Some("Today".to_string()),
        archived: payload.archived.or(Some(false)),
    };

    match state.repo.create_manpower(req).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_manpower(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<ManpowerRequirement>,
) -> Result<Response> {
    match state.repo.update_manpower(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_manpower(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_manpower(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

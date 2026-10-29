use axum::{
    extract::{Extension, Path},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{Interview, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ScheduleInterviewPayload {
    pub candidate_id: usize,
    pub candidate_name: Option<String>,
    pub interview_date: String,
    pub interviewer: String,
    pub interview_type: Option<String>,
    pub notes: Option<String>,
    pub round: Option<String>,
    pub mode: Option<String>,
    pub time: Option<String>,
    pub venue_link: Option<String>,
    pub rating: Option<u32>,
    pub result: Option<String>,
    pub feedback: Option<String>,
    pub status: Option<String>,
    pub archived: Option<bool>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub history: Option<serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Interviews
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_interviews(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_interviews().await {
        Ok(interviews) => format::json(interviews),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_schedule_interview(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<ScheduleInterviewPayload>,
) -> Result<Response> {
    let itype = payload
        .interview_type
        .unwrap_or_else(|| "Technical Screening".to_string());
    let notes = payload.notes.unwrap_or_default();
    let clean_date = payload.interview_date.trim();
    let formatted_date = clean_date.replace('T', " ");

    let cand_row =
        sqlx::query("SELECT name, email, job_title FROM candidates WHERE id = $1 LIMIT 1;")
            .bind(payload.candidate_id as i32)
            .fetch_optional(state.repo.pool())
            .await
            .ok()
            .flatten();

    let (cand_name, cand_email, job_title) = if let Some(r) = cand_row {
        let name: String = r.get("name");
        let email: String = r.get("email");
        let job_title: String = r.get("job_title");
        (payload.candidate_name.unwrap_or(name), email, job_title)
    } else {
        let name = payload
            .candidate_name
            .unwrap_or_else(|| "Candidate".to_string());
        let email = format!(
            "{}.cand@brightcone.ai",
            name.to_lowercase().replace(' ', ".")
        );
        (name, email, "Specialist".to_string())
    };

    let interview = Interview {
        id: 0,
        candidate_id: payload.candidate_id,
        candidate_name: cand_name,
        candidate_email: cand_email,
        job_title,
        interview_date: clean_date.to_string(),
        formatted_date,
        interviewer: payload.interviewer.trim().to_string(),
        interview_type: itype,
        notes: notes.trim().to_string(),
        status: "Scheduled".to_string(),
        round: Some(payload.round.unwrap_or_else(|| "Technical 1".to_string())),
        mode: Some(payload.mode.unwrap_or_else(|| "Video call".to_string())),
        time: Some(payload.time.unwrap_or_else(|| "11:00 AM".to_string())),
        venue_link: payload.venue_link,
        rating: payload.rating,
        result: Some(payload.result.unwrap_or_else(|| "Pending".to_string())),
        feedback: payload.feedback,
        archived: Some(false),
        created_at: payload.created_at,
        updated_at: payload.updated_at,
        history: payload.history,
    };

    match state.repo.create_interview(interview).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_interview(
    Path(id): Path<usize>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<Interview>,
) -> Result<Response> {
    match state.repo.update_interview(id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_interview(
    Path(id): Path<usize>,
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    match state.repo.delete_interview(id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

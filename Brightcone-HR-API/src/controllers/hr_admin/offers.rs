use axum::{
    extract::{Extension, Path},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{AuditHistoryItem, OfferLetter, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct CreateOfferPayload {
    pub candidate_id: Option<String>,
    pub candidate_name: String,
    pub designation: String,
    pub department: Option<String>,
    pub annual_ctc: String,
    pub joining_date: String,
    pub offer_date: Option<String>,
    pub valid_till: String,
    pub approved_by: Option<String>,
    pub offer_letter_file: Option<String>,
    pub status: Option<String>,
    pub archived: Option<bool>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub history: Option<Vec<AuditHistoryItem>>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Offer Letters
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_offers(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_offer_letters().await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_offer(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateOfferPayload>,
) -> Result<Response> {
    let count_row = sqlx::query("SELECT count(*) as count FROM offer_letters;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("count");
    let offer_id = format!("OF-{:04}", count + 1);

    let now_row =
        sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
            .fetch_one(state.repo.pool())
            .await
            .map_err(|e| Error::string(&e.to_string()))?;
    let now_str: String = now_row.get("now_str");

    let status = payload
        .status
        .unwrap_or_else(|| "Pending approval".to_string());

    let history = payload.history.unwrap_or_else(|| {
        vec![AuditHistoryItem {
            status: status.clone(),
            timestamp: now_str.clone(),
            user: "ananya.rao@brightcone.ai".to_string(),
        }]
    });

    let offer = OfferLetter {
        id: offer_id,
        candidate_id: payload.candidate_id.unwrap_or_default(),
        candidate_name: payload.candidate_name,
        designation: payload.designation,
        department: payload.department.or(Some("Engineering".to_string())),
        annual_ctc: payload.annual_ctc,
        joining_date: payload.joining_date,
        offer_date: payload.offer_date.or(Some(now_str.clone())),
        valid_till: payload.valid_till,
        approved_by: payload.approved_by.or(Some("—".to_string())),
        offer_letter_file: payload.offer_letter_file.or(Some("—".to_string())),
        status,
        archived: payload.archived.or(Some(false)),
        created_at: payload.created_at.or(Some(now_str.clone())),
        updated_at: payload.updated_at.or(Some(now_str)),
        history: Some(history),
    };

    match state.repo.create_offer_letter(offer).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_offer(
    Path(id): Path<String>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<OfferLetter>,
) -> Result<Response> {
    match state.repo.update_offer_letter(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_offer(
    Path(id): Path<String>,
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    match state.repo.delete_offer_letter(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

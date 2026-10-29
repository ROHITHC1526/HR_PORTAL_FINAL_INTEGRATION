use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{
    CreateDependentPayload, CreateServiceRequestPayload, EmployeeDependent, EmployeeProfile,
    EmployeeReferral, ServiceRequest, SharedState,
};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct ProfileQueryParams {
    pub email: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ReferralQueryParams {
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReferralPayload {
    pub candidate_name: String,
    pub role: String,
    pub referred_by: Option<String>,
    pub bonus: Option<u64>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct DependentFilterParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ServiceRequestFilterParams {
    pub employee_id: Option<String>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Personal Profile
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_my_profile(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ProfileQueryParams>,
) -> Result<Response> {
    let email = params
        .email
        .as_deref()
        .unwrap_or("rahul.varma@brightcone.ai");
    match state.repo.get_profile_by_email(email).await {
        Ok(Some(profile)) => format::json(profile),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_my_profile(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<EmployeeProfile>,
) -> Result<Response> {
    match state.repo.upsert_profile(payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Employee Referrals
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_referrals(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ReferralQueryParams>,
) -> Result<Response> {
    let email = params
        .email
        .as_deref()
        .unwrap_or("rahul.varma@brightcone.ai");
    match state.repo.list_referrals(email).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_referral(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateReferralPayload>,
) -> Result<Response> {
    let count_row = sqlx::query("SELECT count(*) as count FROM employee_referrals;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("count");
    let referral_id = format!("RF-{:03}", count + 1);

    let referrer = payload
        .referred_by
        .unwrap_or_else(|| "rahul.varma@brightcone.ai".to_string());
    let candidate_email = payload.email.clone().unwrap_or_default();
    let candidate_phone = payload.phone.clone().unwrap_or_default();
    let notes = payload.notes.clone().unwrap_or_default();

    let referral = EmployeeReferral {
        id: referral_id,
        candidate_name: payload.candidate_name.clone(),
        role: payload.role.clone(),
        referred_by: referrer.clone(),
        bonus: payload.bonus.unwrap_or(40000),
        status: "Applied".to_string(),
        date: "Oct 19, 2026".to_string(),
        email: Some(candidate_email.clone()),
        phone: Some(candidate_phone.clone()),
        notes: Some(notes.clone()),
    };

    let created = state
        .repo
        .create_referral(referral)
        .await
        .map_err(|err| Error::BadRequest(err.to_string()))?;

    // Also link into candidate_trackers so HR Admin can see the referral in Candidate Tracker
    let can_count_row = sqlx::query("SELECT count(*) as count FROM candidate_trackers;")
        .fetch_one(state.repo.pool())
        .await;
    if let Ok(can_count) = can_count_row {
        let cnt: i64 = can_count.get("count");
        let can_id = format!("CAN-{:03}", cnt + 1);
        let _ = sqlx::query(
            "INSERT INTO candidate_trackers (id, full_name, applied_for, source, total_experience, expected_ctc, stage, email, phone, status, archived)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO NOTHING;"
        )
        .bind(&can_id)
        .bind(&payload.candidate_name)
        .bind(&payload.role)
        .bind("Referral")
        .bind(3)
        .bind(2500000)
        .bind("Applied")
        .bind(&candidate_email)
        .bind(&candidate_phone)
        .bind("Active")
        .bind(false)
        .execute(state.repo.pool())
        .await;
    }

    format::json(created)
}

// ---------------------------------------------------------------------------
// Route Handlers: Employee Dependents (Family Tab)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_dependents(
    Query(query): Query<DependentFilterParams>,
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    let emp_id = query.employee_id.unwrap_or_else(|| "all".to_string());
    match state.repo.list_dependents(&emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_dependent(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateDependentPayload>,
) -> Result<Response> {
    let emp_id = payload.employee_id.unwrap_or_else(|| "BC-1038".to_string());
    let now_row =
        sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
            .fetch_one(state.repo.pool())
            .await
            .map_err(|e| Error::string(&e.to_string()))?;
    let now_str: String = now_row.get("now_str");

    let dep = EmployeeDependent {
        id: String::new(),
        employee_id: emp_id,
        name: payload.name.trim().to_string(),
        relationship: payload.relationship.trim().to_string(),
        dob: payload.dob.trim().to_string(),
        created_at: Some(now_str),
    };

    match state.repo.create_dependent(dep).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_dependent(
    Path(id): Path<String>,
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    match state.repo.delete_dependent(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Employee Service Requests (Helpdesk / Bank change)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_service_requests(
    Extension(state): Extension<SharedState>,
    Query(query): Query<ServiceRequestFilterParams>,
) -> Result<Response> {
    match state
        .repo
        .list_service_requests(query.employee_id.as_deref())
        .await
    {
        Ok(reqs) => format::json(reqs),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_service_request(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateServiceRequestPayload>,
) -> Result<Response> {
    let now_row =
        sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
            .fetch_one(state.repo.pool())
            .await
            .ok();
    let formatted_now = now_row
        .and_then(|r| r.get::<Option<String>, _>("now_str"))
        .unwrap_or_else(|| "21 Oct 2026, 12:00 pm".to_string());

    let emp_id = payload.employee_id.unwrap_or_else(|| "BC-1038".to_string());
    let emp_name = payload
        .employee_name
        .unwrap_or_else(|| "Rahul Varma".to_string());

    let req = ServiceRequest {
        id: String::new(),
        employee_id: emp_id,
        employee_name: emp_name,
        category: payload.category,
        subject: payload.subject,
        priority: payload.priority,
        details: payload.details,
        status: "Submitted".to_string(),
        created_at: formatted_now.clone(),
        updated_at: formatted_now,
    };

    match state.repo.create_service_request(req).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::{
    ArchiveInternshipPayload, ConvertInternshipPayload, CreateInternshipPayload, Internship,
    SharedState, UpdateInternshipStatusPayload,
};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct InternshipQueryParams {
    pub status: Option<String>,
    pub archived: Option<bool>,
    pub department: Option<String>,
    pub q: Option<String>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Internship Management
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_internships(
    Extension(state): Extension<SharedState>,
    Query(params): Query<InternshipQueryParams>,
) -> Result<Response> {
    match state
        .repo
        .list_internships(
            params.status.as_deref(),
            params.archived,
            params.department.as_deref(),
            params.q.as_deref(),
        )
        .await
    {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_internship(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.get_internship(&id).await {
        Ok(Some(intern)) => format::json(intern),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_internship(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateInternshipPayload>,
) -> Result<Response> {
    let role = payload.internship_role.unwrap_or_else(|| {
        if let Some(ref d) = payload.department {
            if !d.trim().is_empty() {
                format!("{} Intern", d.trim())
            } else {
                "Intern".to_string()
            }
        } else {
            "Intern".to_string()
        }
    });

    let intern = Internship {
        id: String::new(),
        intern_name: payload.intern_name,
        email: payload.email,
        phone: payload.phone,
        college: payload.college,
        degree: payload.degree,
        department: payload.department,
        internship_role: role,
        mentor_employee_id: payload.mentor_employee_id,
        mentor_name: payload.mentor_name,
        start_date: payload.start_date,
        end_date: payload.end_date,
        stipend: payload.stipend,
        status: payload.status.unwrap_or_else(|| "Active".to_string()),
        work_mode: payload.work_mode.or(Some("Hybrid".to_string())),
        project_title: payload.project_title,
        performance_rating: payload.performance_rating,
        feedback: payload.feedback,
        archived: Some(false),
        history: None,
        created_at: None,
        updated_at: None,
    };

    match state
        .repo
        .create_internship(
            intern,
            payload.timestamp.as_deref(),
            payload.user.as_deref(),
        )
        .await
    {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_internship(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<Internship>,
) -> Result<Response> {
    match state.repo.update_internship(&id, payload, None, None).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_internship_status(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateInternshipStatusPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_internship_status(
            &id,
            &payload.status,
            payload.feedback.as_deref(),
            payload.performance_rating,
            payload.timestamp.as_deref(),
            payload.user.as_deref(),
        )
        .await
    {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_archive_internship(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<ArchiveInternshipPayload>,
) -> Result<Response> {
    let archived = payload.archived.unwrap_or(true);
    match state.repo.toggle_archive_internship(&id, archived).await {
        Ok(intern) => format::json(intern),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_convert_internship(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<ConvertInternshipPayload>,
) -> Result<Response> {
    match state
        .repo
        .convert_internship_to_employee(&id, payload)
        .await
    {
        Ok((internship, employee)) => format::json(serde_json::json!({
            "success": true,
            "internship": internship,
            "employee": employee
        })),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_internship(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_internship(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

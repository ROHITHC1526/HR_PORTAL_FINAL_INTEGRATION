use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;
use sqlx::Row;

use crate::models::{
    AuditHistoryItem, CreateChecklistItemPayload, CreateChecklistPayload,
    CreateJoiningRecordPayload, CreateOnboardingTaskPayload, CreateStandardChecklistPayload,
    JoiningRecord, OnboardingChecklist, OnboardingChecklistItem, SharedState,
    UpdateChecklistItemPayload, UpdateItemStatusPayload, UpdateJoiningDocumentsPayload,
    UpdateJoiningStatusPayload,
};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct JoiningQueryParams {
    pub status: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct CompleteJoiningPayload {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ChecklistQueryParams {
    pub employee_id: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct OnboardingTaskQueryParams {
    pub employee_id: Option<String>,
    pub status: Option<String>,
    pub archived: Option<bool>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct UpdateTaskStatusPayload {
    pub status: String,
    pub completed_on: Option<String>,
    pub timestamp: Option<String>,
    pub user: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ArchiveTaskPayload {
    pub archived: Option<bool>,
}

// ---------------------------------------------------------------------------
// Route Handlers: Joining Formalities
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_joining_formalities(
    Extension(state): Extension<SharedState>,
    Query(params): Query<JoiningQueryParams>,
) -> Result<Response> {
    match state
        .repo
        .list_joining_formalities(params.status.as_deref(), params.q.as_deref())
        .await
    {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_joining_formality(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.get_joining_formality(&id).await {
        Ok(Some(record)) => format::json(record),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_joining_formality(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateJoiningRecordPayload>,
) -> Result<Response> {
    let now_row =
        sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
            .fetch_one(state.repo.pool())
            .await
            .map_err(|e| Error::string(&e.to_string()))?;
    let now_str: String = now_row.get("now_str");

    let count_row = sqlx::query("SELECT count(*) as c FROM joining_formalities;")
        .fetch_one(state.repo.pool())
        .await
        .map_err(|e| Error::string(&e.to_string()))?;
    let count: i64 = count_row.get("c");
    let record_id = payload.id.unwrap_or_else(|| format!("JN-{:03}", count + 1));

    let joining_status = payload
        .joining_status
        .or(payload.status)
        .unwrap_or_else(|| "Pending".to_string());
    let remarks = payload.remarks.or(payload.notes).unwrap_or_default();

    let record = JoiningRecord {
        id: record_id,
        candidate_id: payload.candidate_id,
        offer_letter_id: payload.offer_letter_id,
        employee_id: payload.employee_id,
        candidate_name: payload.candidate_name.clone(),
        employee_name: payload.employee_name.or(payload.candidate_name),
        joining_date: payload.joining_date,
        department: payload.department,
        designation: payload.designation,
        reporting_manager: payload.reporting_manager,
        documents_submitted: payload.documents_submitted,
        documents_verified: payload.documents_verified.or(Some(false)),
        verification_status: payload.verification_status.or(Some("Pending".to_string())),
        joining_status: Some(joining_status.clone()),
        remarks: Some(remarks.clone()),
        documents_collected: payload.documents_collected.or(Some("No".to_string())),
        id_card_issued: payload.id_card_issued.or(Some("No".to_string())),
        work_email_created: payload.work_email_created.or(Some("No".to_string())),
        laptop_issued: payload.laptop_issued.or(Some("No".to_string())),
        pf_nomination_form: payload.pf_nomination_form.or(Some("No".to_string())),
        appointment_letter_issued: payload.appointment_letter_issued.or(Some("No".to_string())),
        status: Some(joining_status.clone()),
        notes: Some(remarks),
        archived: payload.archived.or(Some(false)),
        history: payload.history.or_else(|| {
            Some(vec![AuditHistoryItem {
                status: joining_status,
                timestamp: now_str.clone(),
                user: "ananya.rao@brightcone.ai".to_string(),
            }])
        }),
        created_at: Some(now_str.clone()),
        updated_at: Some(now_str),
    };

    match state.repo.create_joining_formality(record).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_joining_formality(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<JoiningRecord>,
) -> Result<Response> {
    match state.repo.update_joining_formality(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_joining_status(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateJoiningStatusPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_joining_status(
            &id,
            &payload.status,
            payload.remarks.as_deref(),
            "ananya.rao@brightcone.ai",
        )
        .await
    {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_joining_documents(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateJoiningDocumentsPayload>,
) -> Result<Response> {
    match state.repo.update_joining_documents(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_complete_joining_formality(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<CompleteJoiningPayload>,
) -> Result<Response> {
    match state
        .repo
        .complete_joining_and_link_employee(&id, payload.employee_id.as_deref())
        .await
    {
        Ok((record, employee)) => format::json(serde_json::json!({
            "record": record,
            "employee": employee,
            "success": true
        })),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_joining_formality(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_joining_formality(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Onboarding Checklists
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_onboarding_checklists(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ChecklistQueryParams>,
) -> Result<Response> {
    match state
        .repo
        .list_checklists(params.employee_id.as_deref(), params.status.as_deref())
        .await
    {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_onboarding_checklist(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.get_checklist(&id).await {
        Ok(Some(chk)) => format::json(chk),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_onboarding_checklist(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateChecklistPayload>,
) -> Result<Response> {
    let checklist = OnboardingChecklist {
        id: String::new(),
        employee_id: payload.employee_id,
        employee_name: None,
        title: payload.title,
        description: payload.description,
        assigned_by: payload.assigned_by,
        start_date: payload.start_date,
        due_date: payload.due_date,
        status: "Pending".to_string(),
        completion_percentage: 0,
        items: Vec::new(),
        created_at: None,
        updated_at: None,
    };

    let items = payload
        .items
        .unwrap_or_default()
        .into_iter()
        .map(|it| OnboardingChecklistItem {
            id: String::new(),
            checklist_id: String::new(),
            title: it.title,
            description: it.description,
            assigned_to: it.assigned_to,
            due_date: it.due_date,
            status: it.status.unwrap_or_else(|| "Pending".to_string()),
            completed_at: None,
            created_at: None,
            updated_at: None,
            ..Default::default()
        })
        .collect();

    match state.repo.create_checklist(checklist, items).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_onboarding_checklist(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<OnboardingChecklist>,
) -> Result<Response> {
    match state.repo.update_checklist(&id, payload).await {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_add_checklist_item(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<CreateChecklistItemPayload>,
) -> Result<Response> {
    let item = OnboardingChecklistItem {
        id: String::new(),
        checklist_id: id.clone(),
        title: payload.title,
        description: payload.description,
        assigned_to: payload.assigned_to,
        due_date: payload.due_date,
        status: payload.status.unwrap_or_else(|| "Pending".to_string()),
        completed_at: None,
        created_at: None,
        updated_at: None,
        ..Default::default()
    };

    match state.repo.add_checklist_item(&id, item).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_checklist_item(
    Extension(state): Extension<SharedState>,
    Path((id, item_id)): Path<(String, String)>,
    Json(payload): Json<UpdateChecklistItemPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_checklist_item(&id, &item_id, payload)
        .await
    {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_checklist_item_status(
    Extension(state): Extension<SharedState>,
    Path((id, item_id)): Path<(String, String)>,
    Json(payload): Json<UpdateItemStatusPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_item_status(&id, &item_id, &payload.status)
        .await
    {
        Ok(_) => match state.repo.get_checklist(&id).await {
            Ok(Some(chk)) => format::json(chk),
            _ => Err(Error::NotFound),
        },
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_onboarding_checklist(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_checklist(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_checklist_item(
    Extension(state): Extension<SharedState>,
    Path((id, item_id)): Path<(String, String)>,
) -> Result<Response> {
    match state.repo.delete_checklist_item(&id, &item_id).await {
        Ok(true) => {
            format::json(serde_json::json!({ "success": true, "deleted_item_id": item_id }))
        }
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

// ---------------------------------------------------------------------------
// Route Handlers: Onboarding Tasks Direct (Checklist UI)
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_onboarding_tasks(
    Extension(state): Extension<SharedState>,
    Query(params): Query<OnboardingTaskQueryParams>,
) -> Result<Response> {
    match state
        .repo
        .list_all_onboarding_tasks(
            params.employee_id.as_deref(),
            params.status.as_deref(),
            params.archived,
            params.q.as_deref(),
        )
        .await
    {
        Ok(tasks) => format::json(tasks),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_onboarding_task(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.get_onboarding_task(&id).await {
        Ok(Some(task)) => format::json(task),
        Ok(None) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_onboarding_task(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateOnboardingTaskPayload>,
) -> Result<Response> {
    match state.repo.create_onboarding_task(payload).await {
        Ok(task) => format::json(task),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_standard_checklist(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateStandardChecklistPayload>,
) -> Result<Response> {
    match state
        .repo
        .create_standard_checklist(&payload.employee_id)
        .await
    {
        Ok(tasks) => format::json(serde_json::json!({
            "success": true,
            "created_count": tasks.len(),
            "tasks": tasks
        })),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_onboarding_task(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<CreateOnboardingTaskPayload>,
) -> Result<Response> {
    match state.repo.update_onboarding_task(&id, payload).await {
        Ok(task) => format::json(task),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_onboarding_task_status(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateTaskStatusPayload>,
) -> Result<Response> {
    match state
        .repo
        .update_onboarding_task_status(
            &id,
            &payload.status,
            payload.completed_on.as_deref(),
            payload.timestamp.as_deref(),
            payload.user.as_deref(),
        )
        .await
    {
        Ok(task) => format::json(task),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_archive_onboarding_task(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<ArchiveTaskPayload>,
) -> Result<Response> {
    let archived = payload.archived.unwrap_or(true);
    match state
        .repo
        .toggle_archive_onboarding_task(&id, archived)
        .await
    {
        Ok(task) => format::json(task),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_delete_onboarding_task(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    match state.repo.delete_onboarding_task(&id).await {
        Ok(true) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

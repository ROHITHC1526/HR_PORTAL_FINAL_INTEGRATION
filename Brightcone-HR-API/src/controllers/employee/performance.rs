use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::{
    CreateFeedbackPayload, CreateGoalPayload, Goal, PerformanceReview, SelfReviewPayload,
    SharedState, UpdateGoalProgressPayload,
};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct FeedbackQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ReviewStatusQueryParams {
    pub employee_id: Option<String>,
    pub cycle: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReviewPayload {
    pub employee_id: String,
    pub employee_name: String,
    pub reviewer_name: String,
    pub cycle: String,
    pub rating: f32,
    pub feedback: String,
    pub status: String,
}

// ---------------------------------------------------------------------------
// Route Handlers: Goals, Reviews & Feedback
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_goals(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_goals().await {
        Ok(goals) => format::json(goals),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_goal(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateGoalPayload>,
) -> Result<Response> {
    let goal = Goal {
        id: 0,
        employee_id: payload.employee_id,
        employee_name: payload
            .employee_name
            .unwrap_or_else(|| "Rahul Varma".to_string()),
        title: payload.title,
        category: payload
            .category
            .unwrap_or_else(|| "Engineering".to_string()),
        target_date: payload.target_date,
        progress: payload.progress.unwrap_or(0),
        status: "In Progress".to_string(),
    };

    match state.repo.create_goal(goal).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_goal_progress(
    Path(id): Path<usize>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<UpdateGoalProgressPayload>,
) -> Result<Response> {
    match state.repo.update_goal_progress(id, payload.progress).await {
        Ok(true) => format::json(serde_json::json!({ "success": true })),
        Ok(false) => Err(Error::NotFound),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_reviews(Extension(state): Extension<SharedState>) -> Result<Response> {
    match state.repo.list_reviews().await {
        Ok(reviews) => format::json(reviews),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_review(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateReviewPayload>,
) -> Result<Response> {
    let review = PerformanceReview {
        id: 0,
        employee_id: payload.employee_id,
        employee_name: payload.employee_name,
        reviewer_name: payload.reviewer_name,
        cycle: payload.cycle,
        rating: payload.rating,
        feedback: payload.feedback,
        status: payload.status,
        updated_at: "Today".to_string(),
    };

    match state.repo.create_review(review).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_feedbacks(
    Extension(state): Extension<SharedState>,
    Query(params): Query<FeedbackQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    match state.repo.list_feedbacks(emp_id).await {
        Ok(list) => format::json(list),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_feedback(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateFeedbackPayload>,
) -> Result<Response> {
    match state.repo.create_feedback(payload).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_get_review_status(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ReviewStatusQueryParams>,
) -> Result<Response> {
    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    let cycle = params.cycle.as_deref().unwrap_or("H2 2026");
    match state.repo.get_review_status(emp_id, cycle).await {
        Ok(status) => format::json(status),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_submit_self_review(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<SelfReviewPayload>,
) -> Result<Response> {
    match state.repo.submit_self_review(payload).await {
        Ok(status) => format::json(status),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

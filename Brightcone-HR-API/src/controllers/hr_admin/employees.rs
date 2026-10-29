use axum::{
    extract::{Extension, Path, Query},
    http::header,
    response::IntoResponse,
    Json,
};
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::models::{Employee, SharedState};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
pub struct EmployeeFilterParams {
    pub q: Option<String>,
    pub department: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEmployeePayload {
    pub id: Option<String>,
    pub name: String,
    pub role: String,
    pub department: String,
    pub grade: String,
    pub location: String,
    pub manager: String,
    pub status: String,
    pub email: String,
}

// ---------------------------------------------------------------------------
// Route Handlers: HR Admin Employees
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_employees(
    Extension(state): Extension<SharedState>,
    Query(query): Query<EmployeeFilterParams>,
) -> Result<Response> {
    match state
        .repo
        .list_employees(
            query.q.as_deref(),
            query.department.as_deref(),
            query.status.as_deref(),
        )
        .await
    {
        Ok(employees) => format::json(employees),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_create_employee(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateEmployeePayload>,
) -> Result<Response> {
    let emp = Employee {
        id: payload.id.unwrap_or_default(),
        name: payload.name,
        role: payload.role,
        department: payload.department,
        grade: payload.grade,
        location: payload.location,
        manager: payload.manager,
        status: payload.status,
        email: payload.email,
    };

    match state.repo.create_employee(emp).await {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_update_employee(
    Path(id): Path<String>,
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateEmployeePayload>,
) -> Result<Response> {
    let emp = Employee {
        id: id.clone(),
        name: payload.name,
        role: payload.role,
        department: payload.department,
        grade: payload.grade,
        location: payload.location,
        manager: payload.manager,
        status: payload.status,
        email: payload.email,
    };

    match state.repo.update_employee(&id, emp).await {
        Ok(updated) => format::json(updated),
        Err(_) => Err(Error::NotFound),
    }
}

#[debug_handler]
pub async fn api_export_employees_csv(
    Extension(state): Extension<SharedState>,
) -> Result<Response> {
    let employees = state
        .repo
        .list_employees(None, None, None)
        .await
        .unwrap_or_default();
    let mut csv = String::from("ID,Name,Role,Department,Grade,Location,Manager,Status,Email\n");
    for emp in &employees {
        csv.push_str(&format!(
            "\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\"\n",
            emp.id,
            emp.name,
            emp.role,
            emp.department,
            emp.grade,
            emp.location,
            emp.manager,
            emp.status,
            emp.email
        ));
    }

    let mut resp = csv.into_response();
    resp.headers_mut().insert(
        header::CONTENT_TYPE,
        "text/csv; charset=utf-8".parse().unwrap(),
    );
    resp.headers_mut().insert(
        header::CONTENT_DISPOSITION,
        "attachment; filename=\"brightcone_employees.csv\""
            .parse()
            .unwrap(),
    );
    Ok(resp)
}

#[debug_handler]
pub async fn api_import_employees_csv(
    Extension(state): Extension<SharedState>,
    body: String,
) -> Result<Response> {
    let mut imported = 0;
    for line in body.lines().skip(1) {
        let parts: Vec<&str> = line
            .split(',')
            .map(|s| s.trim().trim_matches('"'))
            .collect();
        if parts.len() >= 8 {
            let emp = Employee {
                id: parts[0].to_string(),
                name: parts[1].to_string(),
                role: parts[2].to_string(),
                department: parts[3].to_string(),
                grade: parts[4].to_string(),
                location: parts[5].to_string(),
                manager: parts[6].to_string(),
                status: parts[7].to_string(),
                email: if parts.len() > 8 {
                    parts[8].to_string()
                } else {
                    "employee@brightcone.ai".to_string()
                },
            };
            if state.repo.create_employee(emp).await.is_ok() {
                imported += 1;
            }
        }
    }

    format::json(serde_json::json!({
        "count": imported,
        "message": format!("Successfully processed {imported} employee records")
    }))
}

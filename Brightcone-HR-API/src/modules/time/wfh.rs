use axum::http::StatusCode;
use chrono::NaiveDate;
use sqlx::PgPool;

use super::models::{
    ApproveWfhRequestPayload, CreateWfhRequestPayload, ErrorResponse, RejectWfhRequestPayload,
    WfhRequestQuery, WorkFromHomeRequestWithEmployee,
};

fn err_resp(status: StatusCode, msg: &str) -> (StatusCode, axum::Json<ErrorResponse>) {
    (
        status,
        axum::Json(ErrorResponse {
            error: msg.to_string(),
        }),
    )
}

pub async fn list_wfh_requests_db(
    pool: &PgPool,
    params: WfhRequestQuery,
) -> Result<Vec<WorkFromHomeRequestWithEmployee>, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut sql = String::from(
        "SELECT w.id, w.pid::TEXT as pid, w.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                w.start_date::TEXT as start_date, w.end_date::TEXT as end_date, \
                w.reason, w.status, w.reviewer_name, w.rejection_reason, \
                to_char(w.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(w.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(w.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM work_from_home_requests w \
         JOIN time_employees e ON w.employee_id = e.id \
         WHERE 1=1",
    );

    let mut conditions = Vec::new();

    if let Some(emp_id) = params.employee_id {
        conditions.push(format!("w.employee_id = {emp_id}"));
    }

    if let Some(status) = params.status {
        if !status.is_empty() && status.to_uppercase() != "ALL" {
            let safe_status = status.replace('\'', "''");
            conditions.push(format!("w.status = '{safe_status}'"));
        }
    }

    if let Some(start) = params.start_date {
        let safe_start = start.replace('\'', "''");
        conditions.push(format!("w.end_date >= '{safe_start}'::DATE"));
    }

    if let Some(end) = params.end_date {
        let safe_end = end.replace('\'', "''");
        conditions.push(format!("w.start_date <= '{safe_end}'::DATE"));
    }

    for c in conditions {
        sql.push_str(" AND ");
        sql.push_str(&c);
    }

    sql.push_str(" ORDER BY w.created_at DESC, w.id DESC");

    let rows: Vec<WorkFromHomeRequestWithEmployee> = sqlx::query_as(sqlx::AssertSqlSafe(&*sql))
        .fetch_all(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(rows)
}

pub async fn get_wfh_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<WorkFromHomeRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let row: Option<WorkFromHomeRequestWithEmployee> = sqlx::query_as(
        "SELECT w.id, w.pid::TEXT as pid, w.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                w.start_date::TEXT as start_date, w.end_date::TEXT as end_date, \
                w.reason, w.status, w.reviewer_name, w.rejection_reason, \
                to_char(w.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(w.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(w.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM work_from_home_requests w \
         JOIN time_employees e ON w.employee_id = e.id \
         WHERE w.id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match row {
        Some(r) => Ok(r),
        None => Err(err_resp(
            StatusCode::NOT_FOUND,
            &format!("Work from home request #{id} not found"),
        )),
    }
}

pub async fn create_wfh_request_db(
    pool: &PgPool,
    payload: CreateWfhRequestPayload,
) -> Result<WorkFromHomeRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    // 1. Validate employee exists
    let emp_exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM time_employees WHERE id = $1 AND is_active = true)",
    )
    .bind(payload.employee_id)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    if !emp_exists.0 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "Employee #{} does not exist or is inactive",
                payload.employee_id
            ),
        ));
    }

    // 2. Validate date range
    let start_date = NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d").map_err(|_| {
        err_resp(
            StatusCode::BAD_REQUEST,
            "Invalid start_date format, expected YYYY-MM-DD",
        )
    })?;
    let end_date = NaiveDate::parse_from_str(&payload.end_date, "%Y-%m-%d").map_err(|_| {
        err_resp(
            StatusCode::BAD_REQUEST,
            "Invalid end_date format, expected YYYY-MM-DD",
        )
    })?;

    if start_date > end_date {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "start_date cannot be after end_date",
        ));
    }

    // 3. Reason validation
    if payload.reason.trim().is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Reason for Work From Home is required",
        ));
    }

    // 4. Overlapping request check
    let has_overlap: (bool,) = sqlx::query_as(
        "SELECT EXISTS( \
            SELECT 1 FROM work_from_home_requests \
            WHERE employee_id = $1 \
              AND status IN ('PENDING', 'APPROVED') \
              AND start_date <= $3::DATE \
              AND end_date >= $2::DATE \
         )",
    )
    .bind(payload.employee_id)
    .bind(start_date)
    .bind(end_date)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    if has_overlap.0 {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "An active Work From Home request already exists for this employee overlapping the requested dates",
        ));
    }

    // 5. Insert request
    let inserted_id: (i64,) = sqlx::query_as(
        "INSERT INTO work_from_home_requests (employee_id, start_date, end_date, reason, status) \
         VALUES ($1, $2::DATE, $3::DATE, $4, 'PENDING') \
         RETURNING id",
    )
    .bind(payload.employee_id)
    .bind(start_date)
    .bind(end_date)
    .bind(payload.reason.trim())
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    get_wfh_request_db(pool, inserted_id.0).await
}

pub async fn approve_wfh_request_db(
    pool: &PgPool,
    id: i64,
    payload: ApproveWfhRequestPayload,
) -> Result<WorkFromHomeRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "HR Admin".to_string());

    let updated: Option<(i64,)> = sqlx::query_as(
        "UPDATE work_from_home_requests \
         SET status = 'APPROVED', \
             reviewer_name = $2, \
             reviewed_at = CURRENT_TIMESTAMP, \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $1 AND status = 'PENDING' \
         RETURNING id",
    )
    .bind(id)
    .bind(&reviewer)
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match updated {
        Some(_) => get_wfh_request_db(pool, id).await,
        None => {
            // Check why it wasn't updated
            let exists = get_wfh_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot approve request with status '{}'", exists.status),
            ))
        }
    }
}

pub async fn reject_wfh_request_db(
    pool: &PgPool,
    id: i64,
    payload: RejectWfhRequestPayload,
) -> Result<WorkFromHomeRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    if payload.rejection_reason.trim().is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Rejection reason is required",
        ));
    }

    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "HR Admin".to_string());

    let updated: Option<(i64,)> = sqlx::query_as(
        "UPDATE work_from_home_requests \
         SET status = 'REJECTED', \
             reviewer_name = $2, \
             rejection_reason = $3, \
             reviewed_at = CURRENT_TIMESTAMP, \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $1 AND status = 'PENDING' \
         RETURNING id",
    )
    .bind(id)
    .bind(&reviewer)
    .bind(payload.rejection_reason.trim())
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match updated {
        Some(_) => get_wfh_request_db(pool, id).await,
        None => {
            let exists = get_wfh_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot reject request with status '{}'", exists.status),
            ))
        }
    }
}

pub async fn cancel_wfh_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<WorkFromHomeRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let updated: Option<(i64,)> = sqlx::query_as(
        "UPDATE work_from_home_requests \
         SET status = 'CANCELLED', \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $1 AND status = 'PENDING' \
         RETURNING id",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match updated {
        Some(_) => get_wfh_request_db(pool, id).await,
        None => {
            let exists = get_wfh_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot cancel request with status '{}'; only PENDING requests may be cancelled", exists.status),
            ))
        }
    }
}

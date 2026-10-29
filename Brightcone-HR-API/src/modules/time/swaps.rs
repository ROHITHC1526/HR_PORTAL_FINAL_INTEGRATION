#![allow(clippy::type_complexity)]
use axum::http::StatusCode;
use chrono::NaiveDate;
use sqlx::PgPool;

use super::models::{
    ApproveSwapRequestPayload, CreateSwapRequestPayload, ErrorResponse, RejectSwapRequestPayload,
    SwapRequestQuery, SwapRequestWithDetails,
};

fn err_resp(status: StatusCode, msg: &str) -> (StatusCode, axum::Json<ErrorResponse>) {
    (
        status,
        axum::Json(ErrorResponse {
            error: msg.to_string(),
        }),
    )
}

pub async fn list_swap_requests_db(
    pool: &PgPool,
    params: SwapRequestQuery,
) -> Result<Vec<SwapRequestWithDetails>, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut sql = String::from(
        "SELECT sr.id, sr.pid::TEXT as pid, \
                sr.requester_id, \
                e1.name as requester_name, e1.email as requester_email, \
                e1.department as requester_department, e1.avatar_color as requester_avatar_color, \
                sr.target_employee_id, \
                e2.name as target_employee_name, e2.email as target_employee_email, \
                e2.department as target_employee_department, e2.avatar_color as target_employee_avatar_color, \
                sr.request_date::TEXT as request_date, \
                sr.target_date::TEXT as target_date, \
                sr.source_shift_id, \
                s1.name as source_shift_name, s1.code as source_shift_code, \
                sr.target_shift_id, \
                s2.name as target_shift_name, s2.code as target_shift_code, \
                sr.status, sr.reason, sr.reviewer_name, sr.rejection_reason, \
                to_char(sr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(sr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(sr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM swap_requests sr \
         JOIN time_employees e1 ON sr.requester_id = e1.id \
         LEFT JOIN time_employees e2 ON sr.target_employee_id = e2.id \
         LEFT JOIN shifts s1 ON sr.source_shift_id = s1.id \
         LEFT JOIN shifts s2 ON sr.target_shift_id = s2.id \
         WHERE 1=1"
    );

    let mut conditions = Vec::new();
    if let Some(emp_id) = params.employee_id {
        conditions.push(format!(
            "(sr.requester_id = {emp_id} OR sr.target_employee_id = {emp_id})"
        ));
    }

    if let Some(status) = params.status {
        if !status.is_empty() && status.to_uppercase() != "ALL" {
            let safe_status = status.replace('\'', "''");
            conditions.push(format!("sr.status = '{safe_status}'"));
        }
    }

    if let Some(date) = params.date {
        let safe_date = date.replace('\'', "''");
        conditions.push(format!(
            "(sr.request_date = '{safe_date}'::DATE OR sr.target_date = '{safe_date}'::DATE)"
        ));
    }

    for c in conditions {
        sql.push_str(" AND ");
        sql.push_str(&c);
    }

    sql.push_str(" ORDER BY sr.created_at DESC, sr.id DESC");

    let rows: Vec<SwapRequestWithDetails> = sqlx::query_as(sqlx::AssertSqlSafe(&*sql))
        .fetch_all(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(rows)
}

pub async fn get_swap_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<SwapRequestWithDetails, (StatusCode, axum::Json<ErrorResponse>)> {
    let row: Option<SwapRequestWithDetails> = sqlx::query_as(
        "SELECT sr.id, sr.pid::TEXT as pid, \
                sr.requester_id, \
                e1.name as requester_name, e1.email as requester_email, \
                e1.department as requester_department, e1.avatar_color as requester_avatar_color, \
                sr.target_employee_id, \
                e2.name as target_employee_name, e2.email as target_employee_email, \
                e2.department as target_employee_department, e2.avatar_color as target_employee_avatar_color, \
                sr.request_date::TEXT as request_date, \
                sr.target_date::TEXT as target_date, \
                sr.source_shift_id, \
                s1.name as source_shift_name, s1.code as source_shift_code, \
                sr.target_shift_id, \
                s2.name as target_shift_name, s2.code as target_shift_code, \
                sr.status, sr.reason, sr.reviewer_name, sr.rejection_reason, \
                to_char(sr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(sr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(sr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM swap_requests sr \
         JOIN time_employees e1 ON sr.requester_id = e1.id \
         LEFT JOIN time_employees e2 ON sr.target_employee_id = e2.id \
         LEFT JOIN shifts s1 ON sr.source_shift_id = s1.id \
         LEFT JOIN shifts s2 ON sr.target_shift_id = s2.id \
         WHERE sr.id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match row {
        Some(r) => Ok(r),
        None => Err(err_resp(
            StatusCode::NOT_FOUND,
            &format!("Shift swap request #{id} not found"),
        )),
    }
}

pub async fn create_swap_request_db(
    pool: &PgPool,
    payload: CreateSwapRequestPayload,
) -> Result<SwapRequestWithDetails, (StatusCode, axum::Json<ErrorResponse>)> {
    // 1. Validate requester exists
    let req_exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM time_employees WHERE id = $1 AND is_active = true)",
    )
    .bind(payload.requester_id)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    if !req_exists.0 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "Requester employee #{} does not exist or is inactive",
                payload.requester_id
            ),
        ));
    }

    // 2. Validate target employee if provided
    if let Some(target_id) = payload.target_employee_id {
        if target_id == payload.requester_id {
            return Err(err_resp(
                StatusCode::BAD_REQUEST,
                "Requester and target employee cannot be the same person",
            ));
        }

        let target_exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS(SELECT 1 FROM time_employees WHERE id = $1 AND is_active = true)",
        )
        .bind(target_id)
        .fetch_one(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

        if !target_exists.0 {
            return Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!(
                    "Target employee #{} does not exist or is inactive",
                    target_id
                ),
            ));
        }
    }

    let request_date =
        NaiveDate::parse_from_str(&payload.request_date, "%Y-%m-%d").map_err(|_| {
            err_resp(
                StatusCode::BAD_REQUEST,
                "Invalid request_date format (expected YYYY-MM-DD)",
            )
        })?;

    let target_date = match payload.target_date {
        Some(ref d) if !d.trim().is_empty() => Some(
            NaiveDate::parse_from_str(d, "%Y-%m-%d")
                .map_err(|_| err_resp(StatusCode::BAD_REQUEST, "Invalid target_date format"))?,
        ),
        _ => Some(request_date),
    };

    // 3. Duplicate check
    let has_duplicate: (bool,) = sqlx::query_as(
        "SELECT EXISTS( \
            SELECT 1 FROM swap_requests \
            WHERE requester_id = $1 \
              AND request_date = $2::DATE \
              AND status = 'PENDING' \
         )",
    )
    .bind(payload.requester_id)
    .bind(request_date)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    if has_duplicate.0 {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "A pending swap request already exists for this employee on the requested date",
        ));
    }

    let reason = payload.reason.as_deref().unwrap_or("").trim();

    let inserted: (i64,) = sqlx::query_as(
        "INSERT INTO swap_requests (requester_id, target_employee_id, request_date, target_date, source_shift_id, target_shift_id, reason, status) \
         VALUES ($1, $2, $3::DATE, $4::DATE, $5, $6, $7, 'PENDING') \
         RETURNING id"
    )
    .bind(payload.requester_id)
    .bind(payload.target_employee_id)
    .bind(request_date)
    .bind(target_date)
    .bind(payload.source_shift_id)
    .bind(payload.target_shift_id)
    .bind(if reason.is_empty() { None } else { Some(reason) })
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    get_swap_request_db(pool, inserted.0).await
}

pub async fn approve_swap_request_db(
    pool: &PgPool,
    id: i64,
    payload: ApproveSwapRequestPayload,
) -> Result<SwapRequestWithDetails, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    // 1. Fetch swap request with lock
    let req: Option<(i64, Option<i64>, NaiveDate, Option<NaiveDate>, Option<i64>, Option<i64>, String)> = sqlx::query_as(
        "SELECT requester_id, target_employee_id, request_date, target_date, source_shift_id, target_shift_id, status \
         FROM swap_requests \
         WHERE id = $1 FOR UPDATE"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let (requester_id, target_emp_id, req_date, tgt_date, _source_shift, target_shift, status) =
        match req {
            Some(r) => r,
            None => {
                return Err(err_resp(
                    StatusCode::NOT_FOUND,
                    &format!("Swap request #{id} not found"),
                ))
            }
        };

    if status != "PENDING" {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!("Cannot approve swap request with status '{status}'"),
        ));
    }

    // 2. If target employee is specified, swap roster assignments if they exist
    if let Some(target_employee_id) = target_emp_id {
        let actual_target_date = tgt_date.unwrap_or(req_date);

        // Fetch roster assignments if any
        let req_roster: Option<(i64, Option<i64>, Option<String>, Option<String>)> =
            sqlx::query_as(
                "SELECT id, shift_id, shift_code, shift_name \
             FROM roster_assignments \
             WHERE employee_id = $1 AND roster_date = $2::DATE",
            )
            .bind(requester_id)
            .bind(req_date)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

        let tgt_roster: Option<(i64, Option<i64>, Option<String>, Option<String>)> =
            sqlx::query_as(
                "SELECT id, shift_id, shift_code, shift_name \
             FROM roster_assignments \
             WHERE employee_id = $1 AND roster_date = $2::DATE",
            )
            .bind(target_employee_id)
            .bind(actual_target_date)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

        // If both roster assignments exist, swap their shifts
        if let (Some(r1), Some(r2)) = (req_roster, tgt_roster) {
            sqlx::query(
                "UPDATE roster_assignments \
                 SET shift_id = $2, shift_code = $3, shift_name = $4, updated_at = CURRENT_TIMESTAMP \
                 WHERE id = $1"
            )
            .bind(r1.0)
            .bind(r2.1)
            .bind(r2.2)
            .bind(r2.3)
            .execute(&mut *tx)
            .await
            .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

            sqlx::query(
                "UPDATE roster_assignments \
                 SET shift_id = $2, shift_code = $3, shift_name = $4, updated_at = CURRENT_TIMESTAMP \
                 WHERE id = $1"
            )
            .bind(r2.0)
            .bind(r1.1)
            .bind(r1.2)
            .bind(r1.3)
            .execute(&mut *tx)
            .await
            .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;
        } else if let Some(new_target_shift) = target_shift {
            // If explicit shifts were passed in swap request, update requester's roster assignment if exists
            let shift_info: Option<(String, String)> =
                sqlx::query_as("SELECT code, name FROM shifts WHERE id = $1")
                    .bind(new_target_shift)
                    .fetch_optional(&mut *tx)
                    .await
                    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

            if let Some((s_code, s_name)) = shift_info {
                sqlx::query(
                    "INSERT INTO roster_assignments (employee_id, roster_date, shift_id, shift_code, shift_name, is_off) \
                     VALUES ($1, $2::DATE, $3, $4, $5, false) \
                     ON CONFLICT (employee_id, roster_date) \
                     DO UPDATE SET shift_id = EXCLUDED.shift_id, shift_code = EXCLUDED.shift_code, shift_name = EXCLUDED.shift_name, updated_at = CURRENT_TIMESTAMP"
                )
                .bind(requester_id)
                .bind(req_date)
                .bind(new_target_shift)
                .bind(s_code)
                .bind(s_name)
                .execute(&mut *tx)
                .await
                .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;
            }
        }
    }

    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "HR Admin".to_string());

    sqlx::query(
        "UPDATE swap_requests \
         SET status = 'APPROVED', \
             reviewer_name = $2, \
             reviewed_at = CURRENT_TIMESTAMP, \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $1",
    )
    .bind(id)
    .bind(&reviewer)
    .execute(&mut *tx)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    get_swap_request_db(pool, id).await
}

pub async fn reject_swap_request_db(
    pool: &PgPool,
    id: i64,
    payload: RejectSwapRequestPayload,
) -> Result<SwapRequestWithDetails, (StatusCode, axum::Json<ErrorResponse>)> {
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
        "UPDATE swap_requests \
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
        Some(_) => get_swap_request_db(pool, id).await,
        None => {
            let exists = get_swap_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot reject request with status '{}'", exists.status),
            ))
        }
    }
}

pub async fn cancel_swap_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<SwapRequestWithDetails, (StatusCode, axum::Json<ErrorResponse>)> {
    let updated: Option<(i64,)> = sqlx::query_as(
        "UPDATE swap_requests \
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
        Some(_) => get_swap_request_db(pool, id).await,
        None => {
            let exists = get_swap_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot cancel request with status '{}'; only PENDING requests may be cancelled", exists.status),
            ))
        }
    }
}

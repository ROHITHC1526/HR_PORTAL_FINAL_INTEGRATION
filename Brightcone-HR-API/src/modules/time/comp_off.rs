use axum::http::StatusCode;
use chrono::NaiveDate;
use sqlx::PgPool;

use super::models::{
    ApproveCompOffRequestPayload, CompOffBalance, CompOffEntitlementWithEmployee, CompOffQuery,
    CompOffRequestWithEmployee, CreateCompOffRequestPayload, ErrorResponse, GrantCompOffPayload,
    RejectCompOffRequestPayload,
};

fn err_resp(status: StatusCode, msg: &str) -> (StatusCode, axum::Json<ErrorResponse>) {
    (
        status,
        axum::Json(ErrorResponse {
            error: msg.to_string(),
        }),
    )
}

pub async fn get_comp_off_balance_db(
    pool: &PgPool,
    employee_id: i64,
) -> Result<CompOffBalance, (StatusCode, axum::Json<ErrorResponse>)> {
    let emp: Option<(String,)> = sqlx::query_as("SELECT name FROM time_employees WHERE id = $1")
        .bind(employee_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let employee_name = emp.map(|r| r.0);

    // 1. Total earned active days (not expired, not revoked)
    let (total_earned,): (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(days_earned), 0.0)::FLOAT8 \
         FROM comp_off_entitlements \
         WHERE employee_id = $1 \
           AND status = 'ACTIVE' \
           AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)",
    )
    .bind(employee_id)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    // 2. Used days (approved requests)
    let (used_days,): (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(days_requested), 0.0)::FLOAT8 \
         FROM comp_off_requests \
         WHERE employee_id = $1 AND status = 'APPROVED'",
    )
    .bind(employee_id)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    // 3. Pending days
    let (pending_days,): (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(days_requested), 0.0)::FLOAT8 \
         FROM comp_off_requests \
         WHERE employee_id = $1 AND status = 'PENDING'",
    )
    .bind(employee_id)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let earned = total_earned.unwrap_or(0.0);
    let used = used_days.unwrap_or(0.0);
    let pending = pending_days.unwrap_or(0.0);
    let available = (earned - used).max(0.0);

    Ok(CompOffBalance {
        employee_id,
        employee_name,
        total_earned_days: earned,
        used_days: used,
        pending_days: pending,
        available_days: available,
    })
}

pub async fn list_entitlements_db(
    pool: &PgPool,
    params: CompOffQuery,
) -> Result<Vec<CompOffEntitlementWithEmployee>, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut sql = String::from(
        "SELECT ce.id, ce.pid::TEXT as pid, ce.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                ce.earned_date::TEXT as earned_date, ce.days_earned::FLOAT8 as days_earned, \
                ce.reason, ce.expiry_date::TEXT as expiry_date, ce.status, \
                to_char(ce.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(ce.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM comp_off_entitlements ce \
         JOIN time_employees e ON ce.employee_id = e.id \
         WHERE 1=1",
    );

    let mut conditions = Vec::new();
    if let Some(emp_id) = params.employee_id {
        conditions.push(format!("ce.employee_id = {emp_id}"));
    }
    if let Some(status) = params.status {
        if !status.is_empty() && status.to_uppercase() != "ALL" {
            let safe_status = status.replace('\'', "''");
            conditions.push(format!("ce.status = '{safe_status}'"));
        }
    }

    for c in conditions {
        sql.push_str(" AND ");
        sql.push_str(&c);
    }

    sql.push_str(" ORDER BY ce.earned_date DESC, ce.id DESC");

    let rows: Vec<CompOffEntitlementWithEmployee> = sqlx::query_as(sqlx::AssertSqlSafe(&*sql))
        .fetch_all(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(rows)
}

pub async fn grant_entitlement_db(
    pool: &PgPool,
    payload: GrantCompOffPayload,
) -> Result<CompOffEntitlementWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    // 1. Validate employee
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

    // 2. Validate days
    if payload.days_earned <= 0.0 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "days_earned must be greater than 0.0",
        ));
    }

    let earned_date =
        NaiveDate::parse_from_str(&payload.earned_date, "%Y-%m-%d").map_err(|_| {
            err_resp(
                StatusCode::BAD_REQUEST,
                "Invalid earned_date format (expected YYYY-MM-DD)",
            )
        })?;

    let expiry_date = match payload.expiry_date {
        Some(d) if !d.trim().is_empty() => {
            let exp = NaiveDate::parse_from_str(&d, "%Y-%m-%d")
                .map_err(|_| err_resp(StatusCode::BAD_REQUEST, "Invalid expiry_date format"))?;
            if exp < earned_date {
                return Err(err_resp(
                    StatusCode::BAD_REQUEST,
                    "expiry_date cannot be earlier than earned_date",
                ));
            }
            Some(exp)
        }
        _ => None,
    };

    if payload.reason.trim().is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Reason for granting comp-off is required",
        ));
    }

    let inserted: (i64,) = sqlx::query_as(
        "INSERT INTO comp_off_entitlements (employee_id, earned_date, days_earned, reason, expiry_date, status) \
         VALUES ($1, $2::DATE, $3, $4, $5, 'ACTIVE') \
         RETURNING id"
    )
    .bind(payload.employee_id)
    .bind(earned_date)
    .bind(payload.days_earned)
    .bind(payload.reason.trim())
    .bind(expiry_date)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let row: CompOffEntitlementWithEmployee = sqlx::query_as(
        "SELECT ce.id, ce.pid::TEXT as pid, ce.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                ce.earned_date::TEXT as earned_date, ce.days_earned::FLOAT8 as days_earned, \
                ce.reason, ce.expiry_date::TEXT as expiry_date, ce.status, \
                to_char(ce.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(ce.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM comp_off_entitlements ce \
         JOIN time_employees e ON ce.employee_id = e.id \
         WHERE ce.id = $1",
    )
    .bind(inserted.0)
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(row)
}

pub async fn list_comp_off_requests_db(
    pool: &PgPool,
    params: CompOffQuery,
) -> Result<Vec<CompOffRequestWithEmployee>, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut sql = String::from(
        "SELECT cr.id, cr.pid::TEXT as pid, cr.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                cr.requested_date::TEXT as requested_date, cr.days_requested::FLOAT8 as days_requested, \
                cr.reason, cr.status, cr.reviewer_name, cr.rejection_reason, \
                to_char(cr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(cr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(cr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM comp_off_requests cr \
         JOIN time_employees e ON cr.employee_id = e.id \
         WHERE 1=1"
    );

    let mut conditions = Vec::new();
    if let Some(emp_id) = params.employee_id {
        conditions.push(format!("cr.employee_id = {emp_id}"));
    }
    if let Some(status) = params.status {
        if !status.is_empty() && status.to_uppercase() != "ALL" {
            let safe_status = status.replace('\'', "''");
            conditions.push(format!("cr.status = '{safe_status}'"));
        }
    }

    for c in conditions {
        sql.push_str(" AND ");
        sql.push_str(&c);
    }

    sql.push_str(" ORDER BY cr.created_at DESC, cr.id DESC");

    let rows: Vec<CompOffRequestWithEmployee> = sqlx::query_as(sqlx::AssertSqlSafe(&*sql))
        .fetch_all(pool)
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(rows)
}

pub async fn get_comp_off_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<CompOffRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let row: Option<CompOffRequestWithEmployee> = sqlx::query_as(
        "SELECT cr.id, cr.pid::TEXT as pid, cr.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                cr.requested_date::TEXT as requested_date, cr.days_requested::FLOAT8 as days_requested, \
                cr.reason, cr.status, cr.reviewer_name, cr.rejection_reason, \
                to_char(cr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(cr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(cr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM comp_off_requests cr \
         JOIN time_employees e ON cr.employee_id = e.id \
         WHERE cr.id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    match row {
        Some(r) => Ok(r),
        None => Err(err_resp(
            StatusCode::NOT_FOUND,
            &format!("Comp-off request #{id} not found"),
        )),
    }
}

pub async fn create_comp_off_request_db(
    pool: &PgPool,
    payload: CreateCompOffRequestPayload,
) -> Result<CompOffRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let days = payload.days_requested.unwrap_or(1.0);
    if days <= 0.0 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "days_requested must be greater than 0.0",
        ));
    }

    let req_date =
        NaiveDate::parse_from_str(&payload.requested_date, "%Y-%m-%d").map_err(|_| {
            err_resp(
                StatusCode::BAD_REQUEST,
                "Invalid requested_date format (expected YYYY-MM-DD)",
            )
        })?;

    if payload.reason.trim().is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Reason for comp-off usage is required",
        ));
    }

    // Check available balance
    let balance = get_comp_off_balance_db(pool, payload.employee_id).await?;
    let usable_balance = balance.available_days - balance.pending_days;
    if usable_balance < days {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "Insufficient comp-off balance: available = {:.1}, pending = {:.1}, usable = {:.1}, requested = {:.1}",
                balance.available_days, balance.pending_days, usable_balance, days
            ),
        ));
    }

    let inserted: (i64,) = sqlx::query_as(
        "INSERT INTO comp_off_requests (employee_id, requested_date, days_requested, reason, status) \
         VALUES ($1, $2::DATE, $3, $4, 'PENDING') \
         RETURNING id"
    )
    .bind(payload.employee_id)
    .bind(req_date)
    .bind(days)
    .bind(payload.reason.trim())
    .fetch_one(pool)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    get_comp_off_request_db(pool, inserted.0).await
}

pub async fn approve_comp_off_request_db(
    pool: &PgPool,
    id: i64,
    payload: ApproveCompOffRequestPayload,
) -> Result<CompOffRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    // 1. Fetch request with row lock
    let req: Option<(i64, f64, String)> = sqlx::query_as(
        "SELECT employee_id, days_requested::FLOAT8, status \
         FROM comp_off_requests \
         WHERE id = $1 FOR UPDATE",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let (employee_id, days_requested, current_status) = match req {
        Some(r) => r,
        None => {
            return Err(err_resp(
                StatusCode::NOT_FOUND,
                &format!("Comp-off request #{id} not found"),
            ))
        }
    };

    if current_status != "PENDING" {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!("Cannot approve comp-off request with status '{current_status}'"),
        ));
    }

    // 2. Re-verify available balance within the transaction
    let (total_earned,): (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(days_earned), 0.0)::FLOAT8 \
         FROM comp_off_entitlements \
         WHERE employee_id = $1 AND status = 'ACTIVE' AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)"
    )
    .bind(employee_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let (used_days,): (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(days_requested), 0.0)::FLOAT8 \
         FROM comp_off_requests \
         WHERE employee_id = $1 AND status = 'APPROVED'",
    )
    .bind(employee_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    let available = total_earned.unwrap_or(0.0) - used_days.unwrap_or(0.0);
    if available < days_requested {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "Cannot approve: remaining available balance ({available:.1}) is insufficient for requested {days_requested:.1} days"
            ),
        ));
    }

    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "HR Admin".to_string());

    sqlx::query(
        "UPDATE comp_off_requests \
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

    get_comp_off_request_db(pool, id).await
}

pub async fn reject_comp_off_request_db(
    pool: &PgPool,
    id: i64,
    payload: RejectCompOffRequestPayload,
) -> Result<CompOffRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
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
        "UPDATE comp_off_requests \
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
        Some(_) => get_comp_off_request_db(pool, id).await,
        None => {
            let exists = get_comp_off_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot reject request with status '{}'", exists.status),
            ))
        }
    }
}

pub async fn cancel_comp_off_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<CompOffRequestWithEmployee, (StatusCode, axum::Json<ErrorResponse>)> {
    let updated: Option<(i64,)> = sqlx::query_as(
        "UPDATE comp_off_requests \
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
        Some(_) => get_comp_off_request_db(pool, id).await,
        None => {
            let exists = get_comp_off_request_db(pool, id).await?;
            Err(err_resp(
                StatusCode::BAD_REQUEST,
                &format!("Cannot cancel request with status '{}'; only PENDING requests may be cancelled", exists.status),
            ))
        }
    }
}

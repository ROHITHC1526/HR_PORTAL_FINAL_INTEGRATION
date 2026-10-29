use axum::{http::StatusCode, response::Json};
use chrono::{Datelike, NaiveDate, Utc};
use sqlx::{PgPool, QueryBuilder};

use super::leave_calc::{count_leave_days_service, CountLeaveDaysRequest};
use super::models::{
    ApproveLeaveRequestPayload, CreateLeaveRequestPayload, ErrorResponse, LeaveBalanceItem,
    LeaveBalanceResponse, LeaveRequest, LeaveRequestQuery, RejectLeaveRequestPayload,
};

fn err_resp(status: StatusCode, msg: &str) -> (StatusCode, Json<ErrorResponse>) {
    (
        status,
        Json(ErrorResponse {
            error: msg.to_string(),
        }),
    )
}

// =========================================================================
// 1. Submit a Leave Request
// =========================================================================

pub async fn create_leave_request_db(
    pool: &PgPool,
    payload: CreateLeaveRequestPayload,
) -> Result<LeaveRequest, (StatusCode, Json<ErrorResponse>)> {
    // Validate reason
    let clean_reason = payload.reason.trim();
    if clean_reason.is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Reason for leave request is required.",
        ));
    }
    if clean_reason.len() < 5 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Reason must be at least 5 characters long.",
        ));
    }

    // Validate dates
    let start_str = payload.start_date.trim();
    let end_str = payload.end_date.trim();

    let start_date = NaiveDate::parse_from_str(start_str, "%Y-%m-%d").map_err(|_| {
        err_resp(
            StatusCode::BAD_REQUEST,
            "Invalid start date format. Expected YYYY-MM-DD.",
        )
    })?;
    let end_date = NaiveDate::parse_from_str(end_str, "%Y-%m-%d").map_err(|_| {
        err_resp(
            StatusCode::BAD_REQUEST,
            "Invalid end date format. Expected YYYY-MM-DD.",
        )
    })?;

    if end_date < start_date {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "End date ({}) cannot be earlier than start date ({}).",
                end_str, start_str
            ),
        ));
    }

    let is_half_day = payload.is_half_day.unwrap_or(false);
    if is_half_day && start_date != end_date {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Half-day leave can only be requested for a single date.",
        ));
    }

    // Validate employee exists
    let emp: Option<(i64, String, Option<String>)> =
        sqlx::query_as("SELECT id, name, department FROM time_employees WHERE id = $1")
            .bind(payload.employee_id)
            .fetch_optional(pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error checking employee: {}", e);
                err_resp(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "A database error occurred while validating employee.",
                )
            })?;

    let (_emp_id, _emp_name, _emp_dept) = match emp {
        Some(e) => e,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Employee not found.")),
    };

    // Validate leave type exists and is active
    let lt: Option<(i64, String, String, bool, bool)> =
        sqlx::query_as("SELECT id, name, code, is_paid, is_active FROM leave_types WHERE id = $1")
            .bind(payload.leave_type_id)
            .fetch_optional(pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error checking leave type: {}", e);
                err_resp(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "A database error occurred while validating leave type.",
                )
            })?;

    let (_lt_id, lt_name, lt_code, is_paid, is_active) = match lt {
        Some(t) => t,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Leave type not found.")),
    };

    if !is_active {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!("Leave type '{}' is currently inactive.", lt_name),
        ));
    }

    // Compute chargeable leave days using existing leave_calc engine
    let calc_req = CountLeaveDaysRequest {
        start_date: start_str.to_string(),
        end_date: end_str.to_string(),
        employee_id: Some(payload.employee_id),
        leave_type_id: Some(payload.leave_type_id),
        leave_type_code: Some(lt_code.clone()),
        is_half_day: Some(is_half_day),
        count_calendar_days: None,
        exclude_weekends: None,
        exclude_holidays: None,
        applicable_location: None,
    };

    let calc_res = count_leave_days_service(pool, &calc_req)
        .await
        .map_err(|e| err_resp(StatusCode::BAD_REQUEST, &e.to_string()))?;

    let chargeable_days = calc_res.chargeable_days;
    if chargeable_days <= 0.0 {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "The requested date range contains 0 chargeable leave days (e.g., only weekends or holidays). Leave cannot be submitted.",
        ));
    }

    // If paid leave, check available quota balance for this year
    let leave_year = start_date.year();
    if is_paid {
        let balances =
            get_employee_leave_balances_db(pool, payload.employee_id, Some(leave_year)).await?;
        let matching_balance = balances
            .balances
            .into_iter()
            .find(|b| b.leave_type_id == payload.leave_type_id);

        if let Some(bal) = matching_balance {
            if bal.remaining_days < chargeable_days {
                return Err(err_resp(
                    StatusCode::BAD_REQUEST,
                    &format!(
                        "Insufficient leave balance. You have {:.1} days remaining for {}, but requested {:.1} days.",
                        bal.remaining_days, lt_name, chargeable_days
                    ),
                ));
            }
        }
    }

    // Check for overlapping active or pending leave requests
    let overlap: Option<(i64,)> = sqlx::query_as(
        "SELECT id FROM leave_requests \
         WHERE employee_id = $1 \
           AND status IN ('PENDING', 'APPROVED') \
           AND start_date <= $2::DATE AND end_date >= $3::DATE \
         LIMIT 1",
    )
    .bind(payload.employee_id)
    .bind(end_str)
    .bind(start_str)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error checking overlapping leave: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "A database error occurred while checking overlapping leaves.",
        )
    })?;

    if overlap.is_some() {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "An overlapping leave request already exists for this date range.",
        ));
    }

    // Insert new leave request with PENDING status
    let req: LeaveRequest = sqlx::query_as(
        "WITH ins AS ( \
             INSERT INTO leave_requests ( \
                 employee_id, leave_type_id, start_date, end_date, \
                 is_half_day, reason, total_days, status \
             ) \
             VALUES ($1, $2, $3::DATE, $4::DATE, $5, $6, $7, 'PENDING') \
             RETURNING * \
         ) \
         SELECT lr.id, lr.pid::TEXT as pid, lr.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                lr.leave_type_id, lt.name as leave_type_name, lt.code as leave_type_code, \
                lt.is_paid, \
                to_char(lr.start_date, 'YYYY-MM-DD') as start_date, \
                to_char(lr.end_date, 'YYYY-MM-DD') as end_date, \
                lr.is_half_day, lr.reason, \
                lr.total_days::FLOAT8 as total_days, \
                lr.status, lr.reviewer_name, lr.rejection_reason, \
                to_char(lr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(lr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(lr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM ins lr \
         JOIN time_employees e ON lr.employee_id = e.id \
         JOIN leave_types lt ON lr.leave_type_id = lt.id",
    )
    .bind(payload.employee_id)
    .bind(payload.leave_type_id)
    .bind(start_str)
    .bind(end_str)
    .bind(is_half_day)
    .bind(clean_reason)
    .bind(chargeable_days)
    .fetch_one(pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error inserting leave request: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "A database error occurred while submitting the leave request.",
        )
    })?;

    Ok(req)
}

// =========================================================================
// 2. List Leave Requests (with Filters)
// =========================================================================

pub async fn list_leave_requests_db(
    pool: &PgPool,
    params: LeaveRequestQuery,
) -> Result<Vec<LeaveRequest>, (StatusCode, Json<ErrorResponse>)> {
    let mut builder = QueryBuilder::<sqlx::Postgres>::new(
        "SELECT lr.id, lr.pid::TEXT as pid, lr.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                lr.leave_type_id, lt.name as leave_type_name, lt.code as leave_type_code, \
                lt.is_paid, \
                to_char(lr.start_date, 'YYYY-MM-DD') as start_date, \
                to_char(lr.end_date, 'YYYY-MM-DD') as end_date, \
                lr.is_half_day, lr.reason, \
                lr.total_days::FLOAT8 as total_days, \
                lr.status, lr.reviewer_name, lr.rejection_reason, \
                to_char(lr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(lr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(lr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM leave_requests lr \
         JOIN time_employees e ON lr.employee_id = e.id \
         JOIN leave_types lt ON lr.leave_type_id = lt.id \
         WHERE 1=1",
    );

    if let Some(emp_id) = params.employee_id {
        if emp_id <= 0 {
            return Err(err_resp(
                StatusCode::BAD_REQUEST,
                "Invalid employee_id filter. Must be a positive integer.",
            ));
        }
        builder.push(" AND lr.employee_id = ");
        builder.push_bind(emp_id);
    }

    if let Some(ref st) = params.status {
        let clean = st.trim().to_uppercase();
        if !clean.is_empty() && clean != "ALL" {
            if clean != "PENDING"
                && clean != "APPROVED"
                && clean != "REJECTED"
                && clean != "CANCELLED"
            {
                return Err(err_resp(
                    StatusCode::BAD_REQUEST,
                    "Invalid status filter. Allowed: ALL, PENDING, APPROVED, REJECTED, CANCELLED.",
                ));
            }
            builder.push(" AND lr.status = ");
            builder.push_bind(clean);
        }
    }

    if let Some(year) = params.year {
        if !(2000..=2100).contains(&year) {
            return Err(err_resp(
                StatusCode::BAD_REQUEST,
                "Invalid year filter. Must be between 2000 and 2100.",
            ));
        }
        builder.push(" AND EXTRACT(YEAR FROM lr.start_date) = ");
        builder.push_bind(year);
    }

    builder.push(" ORDER BY lr.created_at DESC, lr.id DESC");

    let records: Vec<LeaveRequest> = builder
        .build_query_as::<LeaveRequest>()
        .fetch_all(pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error listing leave requests: {}", e);
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to list leave requests.",
            )
        })?;

    Ok(records)
}

// =========================================================================
// 3. Get Single Leave Request
// =========================================================================

pub async fn get_leave_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<LeaveRequest, (StatusCode, Json<ErrorResponse>)> {
    let req: Option<LeaveRequest> = sqlx::query_as(
        "SELECT lr.id, lr.pid::TEXT as pid, lr.employee_id, \
                e.name as employee_name, e.email as employee_email, \
                e.department as employee_department, e.avatar_color, \
                lr.leave_type_id, lt.name as leave_type_name, lt.code as leave_type_code, \
                lt.is_paid, \
                to_char(lr.start_date, 'YYYY-MM-DD') as start_date, \
                to_char(lr.end_date, 'YYYY-MM-DD') as end_date, \
                lr.is_half_day, lr.reason, \
                lr.total_days::FLOAT8 as total_days, \
                lr.status, lr.reviewer_name, lr.rejection_reason, \
                to_char(lr.reviewed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as reviewed_at, \
                to_char(lr.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, \
                to_char(lr.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at \
         FROM leave_requests lr \
         JOIN time_employees e ON lr.employee_id = e.id \
         JOIN leave_types lt ON lr.leave_type_id = lt.id \
         WHERE lr.id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error retrieving leave request: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to retrieve leave request.",
        )
    })?;

    match req {
        Some(r) => Ok(r),
        None => Err(err_resp(StatusCode::NOT_FOUND, "Leave request not found.")),
    }
}

// =========================================================================
// 4. Retrieve Leave Balances by Employee and Year
// =========================================================================

pub async fn get_employee_leave_balances_db(
    pool: &PgPool,
    employee_id: i64,
    year_opt: Option<i32>,
) -> Result<LeaveBalanceResponse, (StatusCode, Json<ErrorResponse>)> {
    let target_year = year_opt.unwrap_or_else(|| Utc::now().year());

    // 1. Fetch employee
    let emp: Option<(i64, String, String, String)> =
        sqlx::query_as("SELECT id, name, email, department FROM time_employees WHERE id = $1")
            .bind(employee_id)
            .fetch_optional(pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error fetching employee for balance: {}", e);
                err_resp(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to retrieve employee information.",
                )
            })?;

    let (emp_id, emp_name, emp_email, emp_dept) = match emp {
        Some(e) => e,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Employee not found.")),
    };

    // 2. Fetch all active leave types
    let types: Vec<(i64, String, String, bool)> = sqlx::query_as(
        "SELECT id, name, code, is_paid FROM leave_types WHERE is_active = true ORDER BY id ASC",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching leave types for balance: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to retrieve leave types.",
        )
    })?;

    let mut balance_items = Vec::new();

    for (lt_id, lt_name, lt_code, is_paid) in types {
        // Find entitled quota for this year
        // Look up quota matching employee's department/group or fallback to 'ALL'
        let quota_rows: Vec<(f64, String)> = sqlx::query_as(
            "SELECT entitled_days::FLOAT8, applicable_group \
             FROM leave_quotas \
             WHERE leave_type_id = $1 AND year = $2",
        )
        .bind(lt_id)
        .bind(target_year)
        .fetch_all(pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error fetching leave quotas: {}", e);
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to retrieve leave quotas.",
            )
        })?;

        let entitled_days = quota_rows
            .iter()
            .find(|(_, grp)| grp.eq_ignore_ascii_case(&emp_dept))
            .or_else(|| {
                quota_rows
                    .iter()
                    .find(|(_, grp)| grp.eq_ignore_ascii_case("ALL"))
            })
            .map(|(days, _)| *days)
            .unwrap_or(0.0);

        // Sum consumed (APPROVED) days for this employee, leave type, and year
        let (consumed_days,): (f64,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total_days), 0.0)::FLOAT8 \
             FROM leave_requests \
             WHERE employee_id = $1 AND leave_type_id = $2 \
               AND status = 'APPROVED' \
               AND EXTRACT(YEAR FROM start_date) = $3",
        )
        .bind(emp_id)
        .bind(lt_id)
        .bind(target_year)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error computing consumed leave: {}", e);
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to calculate consumed leave days.",
            )
        })?;

        // Sum pending (PENDING) days
        let (pending_days,): (f64,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total_days), 0.0)::FLOAT8 \
             FROM leave_requests \
             WHERE employee_id = $1 AND leave_type_id = $2 \
               AND status = 'PENDING' \
               AND EXTRACT(YEAR FROM start_date) = $3",
        )
        .bind(emp_id)
        .bind(lt_id)
        .bind(target_year)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error computing pending leave: {}", e);
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to calculate pending leave days.",
            )
        })?;

        let remaining_days = if is_paid {
            (entitled_days - consumed_days).max(0.0)
        } else {
            0.0 // Unpaid leaves don't have a remaining balance limit
        };

        balance_items.push(LeaveBalanceItem {
            leave_type_id: lt_id,
            leave_type_name: lt_name,
            leave_type_code: lt_code,
            is_paid,
            year: target_year,
            entitled_days,
            consumed_days,
            pending_days,
            remaining_days,
        });
    }

    Ok(LeaveBalanceResponse {
        employee_id: emp_id,
        employee_name: emp_name,
        employee_email: emp_email,
        employee_department: emp_dept,
        year: target_year,
        balances: balance_items,
    })
}

// =========================================================================
// 5. Approve Leave Request (Transactional)
// =========================================================================

pub async fn approve_leave_request_db(
    pool: &PgPool,
    id: i64,
    payload: ApproveLeaveRequestPayload,
) -> Result<LeaveRequest, (StatusCode, Json<ErrorResponse>)> {
    // 1. Begin PostgreSQL Transaction FIRST
    let mut tx = pool.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction for leave approval: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to begin database transaction.",
        )
    })?;

    // 2. Fetch and lock the leave request using SELECT ... FOR UPDATE
    let cur_req: Option<(i64, i64, i64, f64, String, NaiveDate, bool)> = sqlx::query_as(
        "SELECT lr.id, lr.employee_id, lr.leave_type_id, lr.total_days::FLOAT8, \
                lr.status, lr.start_date, lt.is_paid \
         FROM leave_requests lr \
         JOIN leave_types lt ON lr.leave_type_id = lt.id \
         WHERE lr.id = $1 \
         FOR UPDATE OF lr",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Database error locking leave request: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to retrieve leave request under lock.",
        )
    })?;

    let (_req_id, emp_id, lt_id, total_days, status, start_date, is_paid) = match cur_req {
        Some(r) => r,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Leave request not found.")),
    };

    if status == "APPROVED" {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Leave request has already been approved.",
        ));
    }
    if status == "REJECTED" {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Leave request has already been rejected.",
        ));
    }
    if status != "PENDING" {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!("Cannot approve leave request with status '{}'. Only pending requests can be approved.", status),
        ));
    }

    // 3. Re-verify balance availability inside the transaction for paid leave
    if is_paid {
        let leave_year = start_date.year();

        // Check entitled quota
        let quota_rows: Vec<(f64, String)> = sqlx::query_as(
            "SELECT lq.entitled_days::FLOAT8, lq.applicable_group \
             FROM leave_quotas lq \
             JOIN time_employees e ON e.id = $1 \
             WHERE lq.leave_type_id = $2 AND lq.year = $3",
        )
        .bind(emp_id)
        .bind(lt_id)
        .bind(leave_year)
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Database error checking quota in transaction: {}", e);
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to check leave quota.",
            )
        })?;

        let entitled_days = quota_rows.first().map(|(days, _)| *days).unwrap_or(0.0);

        // Sum currently approved days
        let (consumed_days,): (f64,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total_days), 0.0)::FLOAT8 \
             FROM leave_requests \
             WHERE employee_id = $1 AND leave_type_id = $2 \
               AND status = 'APPROVED' \
               AND EXTRACT(YEAR FROM start_date) = $3",
        )
        .bind(emp_id)
        .bind(lt_id)
        .bind(leave_year)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!(
                "Database error checking consumed leave in transaction: {}",
                e
            );
            err_resp(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to verify consumed leave.",
            )
        })?;

        if (entitled_days - consumed_days) < total_days {
            return Err(err_resp(
                StatusCode::CONFLICT,
                "Cannot approve leave request: insufficient remaining leave balance.",
            ));
        }
    }

    // 4. Update request status to APPROVED
    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "Ananya Rao (HR Ops)".to_string());

    let upd_res = sqlx::query(
        "UPDATE leave_requests \
         SET status = 'APPROVED', \
             reviewer_name = $1, \
             reviewed_at = CURRENT_TIMESTAMP, \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $2 AND status = 'PENDING'",
    )
    .bind(&reviewer)
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Failed to update leave request status: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to finalize leave request approval.",
        )
    })?;

    if upd_res.rows_affected() == 0 {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Leave request status was modified concurrently.",
        ));
    }

    // 5. Commit transaction atomically
    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit leave approval transaction: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to commit database transaction.",
        )
    })?;

    // Return updated record
    get_leave_request_db(pool, id).await
}

// =========================================================================
// 6. Reject Leave Request (Transactional)
// =========================================================================

pub async fn reject_leave_request_db(
    pool: &PgPool,
    id: i64,
    payload: RejectLeaveRequestPayload,
) -> Result<LeaveRequest, (StatusCode, Json<ErrorResponse>)> {
    let clean_reason = payload.rejection_reason.trim();
    if clean_reason.is_empty() {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            "Rejection reason is required when rejecting a leave request.",
        ));
    }

    // Begin transaction
    let mut tx = pool.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction for rejection: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to begin transaction.",
        )
    })?;

    // Lock request
    let cur_status: Option<(String,)> =
        sqlx::query_as("SELECT status FROM leave_requests WHERE id = $1 FOR UPDATE")
            .bind(id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| {
                tracing::error!("Database error fetching leave request under lock: {}", e);
                err_resp(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to retrieve leave request.",
                )
            })?;

    let (status,) = match cur_status {
        Some(s) => s,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Leave request not found.")),
    };

    if status == "APPROVED" {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Cannot reject leave request: request has already been approved.",
        ));
    }
    if status == "REJECTED" {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Cannot reject leave request: request has already been rejected.",
        ));
    }
    if status != "PENDING" {
        return Err(err_resp(
            StatusCode::CONFLICT,
            &format!(
                "Cannot reject leave request: request is already {}.",
                status
            ),
        ));
    }

    let reviewer = payload
        .reviewer_name
        .unwrap_or_else(|| "Ananya Rao (HR Ops)".to_string());

    let res = sqlx::query(
        "UPDATE leave_requests \
         SET status = 'REJECTED', \
             reviewer_name = $1, \
             rejection_reason = $2, \
             reviewed_at = CURRENT_TIMESTAMP, \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $3 AND status = 'PENDING'",
    )
    .bind(&reviewer)
    .bind(clean_reason)
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Database error rejecting leave request: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to reject leave request.",
        )
    })?;

    if res.rows_affected() == 0 {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Leave request status was modified concurrently.",
        ));
    }

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit rejection transaction: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to commit database transaction.",
        )
    })?;

    get_leave_request_db(pool, id).await
}

// =========================================================================
// 7. Cancel Pending Leave Request (Employee Action)
// =========================================================================

pub async fn cancel_leave_request_db(
    pool: &PgPool,
    id: i64,
) -> Result<LeaveRequest, (StatusCode, Json<ErrorResponse>)> {
    let mut tx = pool.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction for cancellation: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to begin transaction.",
        )
    })?;

    let cur_status: Option<(String,)> =
        sqlx::query_as("SELECT status FROM leave_requests WHERE id = $1 FOR UPDATE")
            .bind(id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| {
                tracing::error!("Database error fetching leave request: {}", e);
                err_resp(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to retrieve leave request.",
                )
            })?;

    let (status,) = match cur_status {
        Some(s) => s,
        None => return Err(err_resp(StatusCode::NOT_FOUND, "Leave request not found.")),
    };

    if status != "PENDING" {
        return Err(err_resp(
            StatusCode::BAD_REQUEST,
            &format!(
                "Only pending requests can be cancelled. Current status is '{}'.",
                status
            ),
        ));
    }

    let res = sqlx::query(
        "UPDATE leave_requests \
         SET status = 'CANCELLED', \
             updated_at = CURRENT_TIMESTAMP \
         WHERE id = $1 AND status = 'PENDING'",
    )
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Database error cancelling leave request: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to cancel leave request.",
        )
    })?;

    if res.rows_affected() == 0 {
        return Err(err_resp(
            StatusCode::CONFLICT,
            "Leave request was modified concurrently.",
        ));
    }

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit cancellation transaction: {}", e);
        err_resp(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to commit database transaction.",
        )
    })?;

    get_leave_request_db(pool, id).await
}

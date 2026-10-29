use sqlx::PgPool;

/// Safe, repeatable seed operations for default application data.
///
/// Safety guarantees:
/// - Explicitly decoupled from schema synchronization.
/// - Does not drop, truncate, or overwrite existing records.
/// - Uses `ON CONFLICT DO NOTHING` to guarantee idempotency.
pub async fn seed_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    seed_shifts_if_empty(pool).await?;
    seed_holidays_if_empty(pool).await?;
    seed_leave_types_if_empty(pool).await?;
    seed_leave_quotas_if_empty(pool).await?;
    seed_employees_if_empty(pool).await?;
    seed_swap_requests_if_empty(pool).await?;
    seed_wfh_if_empty(pool).await?;
    seed_comp_off_if_empty(pool).await?;
    Ok(())
}

/// Seeds standard corporate shifts if none exist.
pub async fn seed_shifts_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (shift_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM shifts")
        .fetch_one(pool)
        .await?;

    if shift_count == 0 {
        sqlx::query(
            "INSERT INTO shifts (name, code, start_time, end_time, break_duration_minutes, grace_period_minutes, is_overnight, is_active)
             VALUES
             ('General Day Shift', 'GEN-01', '09:00:00'::TIME, '18:00:00'::TIME, 60, 15, false, true),
             ('Early Morning Shift', 'MOR-01', '06:00:00'::TIME, '14:30:00'::TIME, 45, 10, false, true),
             ('Night Support Shift', 'NGT-01', '21:00:00'::TIME, '06:00:00'::TIME, 60, 15, true, true),
             ('Weekend Standby Shift', 'WKD-01', '10:00:00'::TIME, '16:00:00'::TIME, 30, 20, false, false)
             ON CONFLICT (code) DO NOTHING"
        )
        .execute(pool)
        .await?;
    }

    // Ensure USP and USC shifts exist
    sqlx::query(
        "INSERT INTO shifts (name, code, start_time, end_time, break_duration_minutes, grace_period_minutes, is_overnight, is_active)
         VALUES
         ('US Pacific Shift', 'USP', '18:30:00'::TIME, '03:30:00'::TIME, 60, 15, true, true),
         ('US Central Shift', 'USC', '19:30:00'::TIME, '04:30:00'::TIME, 60, 15, true, true)
         ON CONFLICT (code) DO NOTHING"
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Seeds standard public holidays if none exist.
pub async fn seed_holidays_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (holiday_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM holidays")
        .fetch_one(pool)
        .await?;

    if holiday_count == 0 {
        sqlx::query(
            "INSERT INTO holidays (name, holiday_date, description, applicable_location, is_recurring)
             VALUES
             ('Republic Day', '2026-01-26'::DATE, 'National holiday commemorating the Constitution', NULL, true),
             ('Independence Day', '2026-08-15'::DATE, 'National Independence celebration', NULL, true),
             ('Diwali', '2026-11-08'::DATE, 'Festival of Lights holiday', NULL, false),
             ('Telangana Formation Day', '2026-06-02'::DATE, 'State holiday for Hyderabad branch office', 'Hyderabad', true),
             ('Karnataka Rajyotsava', '2026-11-01'::DATE, 'State holiday for Bengaluru technology centre', 'Bengaluru', true)
             ON CONFLICT DO NOTHING"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds default company leave types if none exist.
pub async fn seed_leave_types_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (leave_type_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM leave_types")
        .fetch_one(pool)
        .await?;

    if leave_type_count == 0 {
        sqlx::query(
            "INSERT INTO leave_types (name, code, description, is_paid, is_active)
             VALUES
             ('Casual Leave', 'CL', 'For personal errands, family obligations, and unplanned short absences.', true, true),
             ('Sick Leave', 'SL', 'For recovery from personal illnesses, medical appointments, and healthcare needs.', true, true),
             ('Earned Leave / Annual Vacation', 'EL', 'Planned vacation days accumulated monthly throughout the active service year.', true, true),
             ('Maternity Leave', 'ML', 'Statutory paid leave for expectant mothers and post-delivery care.', true, true),
             ('Loss of Pay', 'LOP', 'Unpaid leaves taken after exhaust of eligible paid quotas.', false, true)
             ON CONFLICT (code) DO NOTHING"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds standard leave quotas for default leave types if none exist.
pub async fn seed_leave_quotas_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (quota_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM leave_quotas")
        .fetch_one(pool)
        .await?;

    if quota_count == 0 {
        sqlx::query(
            "INSERT INTO leave_quotas (leave_type_id, year, entitled_days, applicable_group)
             SELECT id, 2026, 12.0, 'ALL' FROM leave_types WHERE code = 'CL'
             UNION ALL
             SELECT id, 2026, 10.5, 'ALL' FROM leave_types WHERE code = 'SL'
             UNION ALL
             SELECT id, 2026, 18.0, 'ALL' FROM leave_types WHERE code = 'EL'
             UNION ALL
             SELECT id, 2026, 90.0, 'FEMALE_EMPLOYEES' FROM leave_types WHERE code = 'ML'
             ON CONFLICT (leave_type_id, year, applicable_group) DO NOTHING",
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds baseline employee roster if none exist.
pub async fn seed_employees_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (emp_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM time_employees")
        .fetch_one(pool)
        .await?;

    if emp_count == 0 {
        sqlx::query(
            "INSERT INTO time_employees (name, email, role, department, default_shift_id, avatar_color)
             VALUES
             ('Naresh Vemparala', 'naresh.v@brightcone.com', 'Senior Engineer', 'Platform', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'purple'),
             ('Ananya Rao', 'ananya.rao@brightcone.com', 'People Ops Lead', 'Human Resources', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'purple'),
             ('Karthik Reddy', 'karthik.r@brightcone.com', 'Full Stack Developer', 'Engineering', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'teal'),
             ('Priya Menon', 'priya.m@brightcone.com', 'UI/UX Designer', 'Product', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'purple'),
             ('Daniel Brooks', 'daniel.b@brightcone.com', 'Support Specialist', 'Customer Success', (SELECT id FROM shifts WHERE code = 'USP' LIMIT 1), 'pink'),
             ('Vikram Seth', 'vikram.s@brightcone.com', 'DevOps Lead', 'Infrastructure', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'blue'),
             ('Aisha Khan', 'aisha.k@brightcone.com', 'QA Engineer', 'Quality', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'indigo'),
             ('Rahul Sharma', 'rahul.s@brightcone.com', 'Backend Developer', 'Engineering', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'emerald'),
             ('Sneha Patel', 'sneha.p@brightcone.com', 'Product Manager', 'Product', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'amber'),
             ('David Miller', 'david.m@brightcone.com', 'Cloud Architect', 'Infrastructure', (SELECT id FROM shifts WHERE code = 'USP' LIMIT 1), 'rose'),
             ('Samantha Reed', 'samantha.r@brightcone.com', 'Technical Writer', 'Documentation', (SELECT id FROM shifts WHERE code = 'USC' LIMIT 1), 'cyan'),
             ('Tanvi Joshi', 'tanvi.j@brightcone.com', 'Security Analyst', 'Security', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'violet'),
             ('Arjun Kapoor', 'arjun.k@brightcone.com', 'Operations Engineer', 'Operations', (SELECT id FROM shifts WHERE code LIKE 'NGT%' LIMIT 1), 'fuchsia'),
             ('Elena Rostova', 'elena.r@brightcone.com', 'Frontend Engineer', 'Web Team', (SELECT id FROM shifts WHERE code LIKE 'GEN%' LIMIT 1), 'teal')
             ON CONFLICT (email) DO NOTHING"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds initial shift swap requests if empty.
pub async fn seed_swap_requests_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (swap_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM swap_requests")
        .fetch_one(pool)
        .await?;

    if swap_count == 0 {
        sqlx::query(
            "INSERT INTO swap_requests (requester_id, target_employee_id, request_date, status, reason)
             SELECT e1.id, e2.id, '2026-10-15'::DATE, 'PENDING', 'Need morning shift due to doctor appointment'
             FROM time_employees e1, time_employees e2
             WHERE e1.name = 'Naresh Vemparala' AND e2.name = 'Karthik Reddy'
             LIMIT 1"
        )
        .execute(pool)
        .await?;

        sqlx::query(
            "INSERT INTO swap_requests (requester_id, target_employee_id, request_date, status, reason)
             SELECT e1.id, e2.id, '2026-10-16'::DATE, 'PENDING', 'Family event on Friday afternoon'
             FROM time_employees e1, time_employees e2
             WHERE e1.name = 'Daniel Brooks' AND e2.name = 'David Miller'
             LIMIT 1"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds initial Work From Home requests if empty.
pub async fn seed_wfh_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (wfh_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM work_from_home_requests")
        .fetch_one(pool)
        .await?;

    if wfh_count == 0 {
        sqlx::query(
            "INSERT INTO work_from_home_requests (employee_id, start_date, end_date, reason, status, reviewer_name, reviewed_at)
             SELECT id, '2026-10-20'::DATE, '2026-10-21'::DATE, 'Home broadband installation and maintenance', 'APPROVED', 'HR Admin', CURRENT_TIMESTAMP
             FROM time_employees
             WHERE email = 'ananya.rao@brightcone.io'
             LIMIT 1"
        )
        .execute(pool)
        .await?;

        sqlx::query(
            "INSERT INTO work_from_home_requests (employee_id, start_date, end_date, reason, status)
             SELECT id, '2026-10-28'::DATE, '2026-10-29'::DATE, 'Severe monsoon weather commute advisory', 'PENDING'
             FROM time_employees
             WHERE email = 'karthik.reddy@brightcone.io'
             LIMIT 1"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

/// Seeds initial Comp-Off entitlements and requests if empty.
pub async fn seed_comp_off_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let (entitlement_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM comp_off_entitlements")
        .fetch_one(pool)
        .await?;

    if entitlement_count == 0 {
        sqlx::query(
            "INSERT INTO comp_off_entitlements (employee_id, earned_date, days_earned, reason, expiry_date, status)
             SELECT id, '2026-10-04'::DATE, 2.0, 'Weekend critical release deployment support', ('2026-10-04'::DATE + INTERVAL '90 days')::DATE, 'ACTIVE'
             FROM time_employees
             WHERE email = 'ananya.rao@brightcone.io'
             LIMIT 1"
        )
        .execute(pool)
        .await?;

        sqlx::query(
            "INSERT INTO comp_off_entitlements (employee_id, earned_date, days_earned, reason, expiry_date, status)
             SELECT id, '2026-10-11'::DATE, 1.0, 'Sunday client disaster recovery drill coverage', ('2026-10-11'::DATE + INTERVAL '90 days')::DATE, 'ACTIVE'
             FROM time_employees
             WHERE email = 'karthik.reddy@brightcone.io'
             LIMIT 1"
        )
        .execute(pool)
        .await?;
    }

    let (request_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM comp_off_requests")
        .fetch_one(pool)
        .await?;

    if request_count == 0 {
        sqlx::query(
            "INSERT INTO comp_off_requests (employee_id, requested_date, days_requested, reason, status, reviewer_name, reviewed_at)
             SELECT id, '2026-10-14'::DATE, 1.0, 'Availing comp-off earned from weekend release', 'APPROVED', 'HR Admin', CURRENT_TIMESTAMP
             FROM time_employees
             WHERE email = 'ananya.rao@brightcone.io'
             LIMIT 1"
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

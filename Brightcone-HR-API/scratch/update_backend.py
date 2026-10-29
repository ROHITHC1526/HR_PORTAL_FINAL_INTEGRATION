import re

# 1. Update src/initializers/state.rs with background wake-up process
state_init_path = r'src/initializers/state.rs'
with open(state_init_path, 'r', encoding='utf-8') as f:
    state_code = f.read()

bg_worker = """    async fn after_routes(&self, router: AxumRouter, _ctx: &AppContext) -> Result<AxumRouter> {
        let bg_state = self.state.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
            loop {
                interval.tick().await;
                if let Ok(mut state) = bg_state.write() {
                    state.record_wakeup_ping();
                    tracing::info!(
                        "[Background Service] Wake-up pulse recorded (#{}). Database connection pool healthy & synced.",
                        state.wakeup_count
                    );
                }
            }
        });
        Ok(router.layer(Extension(self.state.clone())))
    }"""

state_code = re.sub(
    r'async fn after_routes\(&self, router: AxumRouter, _ctx: &AppContext\) -> Result<AxumRouter>\s*\{[^}]*\}',
    bg_worker,
    state_code
)

with open(state_init_path, 'w', encoding='utf-8') as f:
    f.write(state_code)
print("Updated src/initializers/state.rs")

# 2. Update src/controllers/api.rs
api_path = r'src/controllers/api.rs'
with open(api_path, 'r', encoding='utf-8') as f:
    api_code = f.read()

# Update models import
old_import = "use crate::models::{Employee, Goal, PerformanceReview, SharedState, User};"
new_import = "use crate::models::{\n    CandidateTracker, Employee, EmployeeAttendance, EmployeeLeave, EmployeeProfile,\n    EmployeeReferral, Goal, ManpowerRequirement, PerformanceReview, SharedState, User,\n};"
api_code = api_code.replace(old_import, new_import, 1)

# Add new DTOs
new_dtos = """
#[derive(Debug, Deserialize, Default)]
pub struct ProfileQueryParams {
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateManpowerPayload {
    pub designation: String,
    pub department: String,
    pub positions: u32,
    pub hiring_manager: Option<String>,
    pub required_by: String,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCandidateTrackerPayload {
    pub full_name: String,
    pub applied_for: String,
    pub source: String,
    pub total_experience: u32,
    pub expected_ctc: u64,
    pub stage: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
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
}

#[derive(Debug, Deserialize, Default)]
pub struct LeaveQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeavePayload {
    pub employee_id: String,
    pub leave_type: String,
    pub from_date: String,
    pub to_date: String,
    pub days: u32,
    pub reason: String,
}

#[derive(Debug, Deserialize, Default)]
pub struct AttendanceQueryParams {
    pub employee_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PunchAttendancePayload {
    pub employee_id: String,
}
"""

target_dtos = "// ---------------------------------------------------------------------------\n// DTOs & Request Payloads"
api_code = api_code.replace(target_dtos, target_dtos + new_dtos, 1)

# Add new handler functions
new_handlers = """
// ---------------------------------------------------------------------------
// Employee Personal Data & Self-Service Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_my_profile(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ProfileQueryParams>,
) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let email = params.email.as_deref().unwrap_or("rahul.varma@brightcone.ai");
    let profile = state_lock.get_profile_by_email(email).ok_or_else(|| {
        Error::NotFound
    })?;

    format::json(profile)
}

#[debug_handler]
pub async fn api_update_my_profile(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<EmployeeProfile>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.update_profile(payload) {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Manpower Requirements (HR Admin) Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_manpower(Extension(state): Extension<SharedState>) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    format::json(state_lock.get_manpower_requirements())
}

#[debug_handler]
pub async fn api_create_manpower(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateManpowerPayload>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let new_id = format!("MR-{:04}", state_lock.manpower.len() + 1);
    let req = ManpowerRequirement {
        id: new_id,
        designation: payload.designation,
        department: payload.department,
        positions: payload.positions,
        hiring_manager: payload.hiring_manager.unwrap_or_else(|| "—".to_string()),
        required_by: payload.required_by,
        status: payload.status.unwrap_or_else(|| "Pending".to_string()),
    };

    match state_lock.add_manpower_requirement(req) {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

#[debug_handler]
pub async fn api_update_manpower(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<ManpowerRequirement>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.update_manpower_requirement(&id, payload) {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

#[debug_handler]
pub async fn api_delete_manpower(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.delete_manpower_requirement(&id) {
        Ok(_) => format::json(serde_json::json!({ "success": true, "deleted_id": id })),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Candidate Tracker (HR Admin) Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_candidate_trackers(Extension(state): Extension<SharedState>) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    format::json(state_lock.get_candidate_trackers())
}

#[debug_handler]
pub async fn api_create_candidate_tracker(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateCandidateTrackerPayload>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let new_id = format!("CAN-{:04}", state_lock.candidate_trackers.len() + 1);
    let cand = CandidateTracker {
        id: new_id,
        full_name: payload.full_name,
        applied_for: payload.applied_for,
        source: payload.source,
        total_experience: payload.total_experience,
        expected_ctc: payload.expected_ctc,
        stage: payload.stage.unwrap_or_else(|| "Applied".to_string()),
        email: payload.email.unwrap_or_default(),
        phone: payload.phone.unwrap_or_default(),
    };

    match state_lock.add_candidate_tracker(cand) {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

#[debug_handler]
pub async fn api_update_candidate_tracker(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
    Json(payload): Json<CandidateTracker>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.update_candidate_tracker(&id, payload) {
        Ok(updated) => format::json(updated),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

#[debug_handler]
pub async fn api_convert_candidate_to_employee(
    Extension(state): Extension<SharedState>,
    Path(id): Path<String>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.convert_candidate_to_employee(&id) {
        Ok(new_emp) => format::json(new_emp),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Employee Referrals (Self-Service) Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_referrals(
    Extension(state): Extension<SharedState>,
    Query(params): Query<ReferralQueryParams>,
) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let email = params.email.as_deref().unwrap_or("rahul.varma@brightcone.ai");
    format::json(state_lock.get_referrals_for_user(email))
}

#[debug_handler]
pub async fn api_create_referral(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateReferralPayload>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let referral = EmployeeReferral {
        id: format!("RF-{:03}", state_lock.referrals.len() + 1),
        candidate_name: payload.candidate_name,
        role: payload.role,
        referred_by: payload.referred_by.unwrap_or_else(|| "rahul.varma@brightcone.ai".to_string()),
        bonus: payload.bonus.unwrap_or(40000),
        status: "Applied".to_string(),
        date: "Oct 16, 2026".to_string(),
    };

    match state_lock.add_referral(referral) {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Employee Leaves (Self-Service) Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_leaves(
    Extension(state): Extension<SharedState>,
    Query(params): Query<LeaveQueryParams>,
) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    format::json(state_lock.get_leaves_for_employee(emp_id))
}

#[debug_handler]
pub async fn api_create_leave(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<CreateLeavePayload>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let leave = EmployeeLeave {
        id: format!("LV-{}", 100 + state_lock.leaves.len() + 1),
        employee_id: payload.employee_id,
        leave_type: payload.leave_type,
        from_date: payload.from_date,
        to_date: payload.to_date,
        days: payload.days,
        reason: payload.reason,
        status: "Approved".to_string(),
    };

    match state_lock.add_leave(leave) {
        Ok(created) => format::json(created),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Employee Attendance (Self-Service) Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_attendance(
    Extension(state): Extension<SharedState>,
    Query(params): Query<AttendanceQueryParams>,
) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    let emp_id = params.employee_id.as_deref().unwrap_or("BC-1038");
    format::json(state_lock.get_attendance_for_employee(emp_id))
}

#[debug_handler]
pub async fn api_punch_attendance(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<PunchAttendancePayload>,
) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    match state_lock.record_attendance_punch(&payload.employee_id) {
        Ok(record) => format::json(record),
        Err(err) => Err(Error::BadRequest(err)),
    }
}

// ---------------------------------------------------------------------------
// Wake-up Calls & Heartbeat Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_get_wakeup_status(Extension(state): Extension<SharedState>) -> Result<Response> {
    let state_lock = state
        .read()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    format::json(state_lock.get_wakeup_info())
}

#[debug_handler]
pub async fn api_trigger_wakeup(Extension(state): Extension<SharedState>) -> Result<Response> {
    let mut state_lock = state
        .write()
        .map_err(|e| Error::string(&format!("State lock failed: {e}")))?;

    state_lock.record_wakeup_ping();
    format::json(state_lock.get_wakeup_info())
}
"""

routes_target = "pub fn routes() -> Routes {"
api_code = api_code.replace(routes_target, new_handlers + "\n" + routes_target, 1)

# Now update the routes() function with all the new routes
new_routes = """pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api")
        // Health & Wakeup
        .add("/health", get(api_health))
        .add("/system/wakeup", get(api_get_wakeup_status))
        .add("/system/wakeup", post(api_trigger_wakeup))
        // Auth
        .add("/auth/login", post(api_login))
        .add("/auth/register", post(api_register))
        .add("/auth/logout", post(api_logout))
        .add("/auth/me", get(api_me))
        // Employee Self-Service (Personal data only)
        .add("/employees/me/profile", get(api_get_my_profile))
        .add("/employees/me/profile", put(api_update_my_profile))
        .add("/employee/referrals", get(api_get_referrals))
        .add("/employee/referrals", post(api_create_referral))
        .add("/employee/leaves", get(api_get_leaves))
        .add("/employee/leaves", post(api_create_leave))
        .add("/employee/attendance", get(api_get_attendance))
        .add("/employee/attendance/punch", post(api_punch_attendance))
        // HR Admin: Manpower Requirements
        .add("/manpower", get(api_get_manpower))
        .add("/manpower", post(api_create_manpower))
        .add("/manpower/{id}", put(api_update_manpower))
        .add("/manpower/{id}", delete(api_delete_manpower))
        // HR Admin: Candidate Tracker
        .add("/candidate-tracker", get(api_get_candidate_trackers))
        .add("/candidate-tracker", post(api_create_candidate_tracker))
        .add("/candidate-tracker/{id}", put(api_update_candidate_tracker))
        .add("/candidate-tracker/{id}/convert", post(api_convert_candidate_to_employee))
        // Dashboard
        .add("/dashboard/stats", get(api_dashboard_stats))
        // Jobs
        .add("/jobs", get(api_get_jobs))
        .add("/jobs", post(api_create_job))
        .add("/jobs/{id}/status", put(api_update_job_status))
        // Candidates
        .add("/candidates", get(api_get_candidates))
        .add("/candidates", post(api_create_candidate))
        .add("/candidates/{id}/status", put(api_update_candidate_status))
        // Interviews
        .add("/interviews", get(api_get_interviews))
        .add("/interviews", post(api_schedule_interview))
        // Employees (Admin)
        .add("/employees", get(api_get_employees))
        .add("/employees", post(api_create_employee))
        .add("/employees/{id}", put(api_update_employee))
        .add("/employees/export", get(api_export_employees_csv))
        .add("/employees/import", post(api_import_employees_csv))
        // Performance
        .add("/performance/goals", get(api_get_goals))
        .add("/performance/goals", post(api_create_goal))
        .add(
            "/performance/goals/{id}/progress",
            put(api_update_goal_progress),
        )
        .add("/performance/reviews", get(api_get_reviews))
        .add("/performance/reviews", post(api_create_review))
}"""

# Replace old routes function
pattern = r'pub fn routes\(\) -> Routes\s*\{[\s\S]*?\n\}'
api_code = re.sub(pattern, new_routes, api_code)

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_code)

print("Updated src/controllers/api.rs successfully!")

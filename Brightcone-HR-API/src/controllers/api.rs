use axum::routing::patch;
use loco_rs::prelude::*;

// ---------------------------------------------------------------------------
// Re-export handlers and DTOs from modular role-based controllers
// ---------------------------------------------------------------------------

pub use crate::controllers::common::auth::*;
pub use crate::controllers::common::system::*;
pub use crate::controllers::employee::attendance::*;
pub use crate::controllers::employee::documents::*;
pub use crate::controllers::employee::leave_management::*;
pub use crate::controllers::employee::performance::*;
pub use crate::controllers::employee::profile::*;
pub use crate::controllers::hr_admin::candidates::*;
pub use crate::controllers::hr_admin::dashboard::*;
pub use crate::controllers::hr_admin::employees::*;
pub use crate::controllers::hr_admin::internships::*;
pub use crate::controllers::hr_admin::interviews::*;
pub use crate::controllers::hr_admin::jobs::*;
pub use crate::controllers::hr_admin::leave_management::*;
pub use crate::controllers::hr_admin::offers::*;
pub use crate::controllers::hr_admin::onboarding::*;

// ---------------------------------------------------------------------------
// Main API Router Assembly
// ---------------------------------------------------------------------------

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api")
        // ===================================================================
        // Common: Health, Wakeup & Authentication
        // ===================================================================
        .add("/health", get(api_health))
        .add("/system/wakeup", get(api_get_wakeup_status))
        .add("/system/wakeup", post(api_trigger_wakeup))
        // /auth/* routes are managed by controllers::auth::routes(ctx)
        // ===================================================================
        // Employee Role Handlers (Self-Service)
        // ===================================================================
        // Profile, Referrals, Dependents & Helpdesk Requests
        .add("/employees/me/profile", get(api_get_my_profile))
        .add("/employees/me/profile", put(api_update_my_profile))
        .add("/employee/referrals", get(api_get_referrals))
        .add("/employee/referrals", post(api_create_referral))
        .add("/employee/dependents", get(api_get_dependents))
        .add("/employee/dependents", post(api_create_dependent))
        .add("/employee/dependents/{id}", delete(api_delete_dependent))
        .add("/employee/requests", get(api_get_service_requests))
        .add("/employee/requests", post(api_create_service_request))
        // Leaves (Self-Service)
        .add("/employee/leaves", get(api_get_leaves))
        .add("/employee/leaves", post(api_create_leave))
        // Attendance & Clocking (Self-Service)
        .add("/employee/attendance", get(api_get_attendance))
        .add("/employee/attendance/punch", post(api_punch_attendance))
        .add(
            "/employee/attendance/summary",
            get(api_get_attendance_summary),
        )
        .add("/employee/attendance/clock", post(api_punch_clock))
        .add(
            "/employee/attendance/regularisations",
            get(api_get_regularisations),
        )
        .add(
            "/employee/attendance/regularisations",
            post(api_create_regularisation),
        )
        // Performance, Goals & Reviews (Self-Service)
        .add("/performance/goals", get(api_get_goals))
        .add("/performance/goals", post(api_create_goal))
        .add(
            "/performance/goals/{id}/progress",
            put(api_update_goal_progress),
        )
        .add("/performance/reviews", get(api_get_reviews))
        .add("/performance/reviews", post(api_create_review))
        .add("/performance/feedbacks", get(api_get_feedbacks))
        .add("/performance/feedbacks", post(api_create_feedback))
        .add("/performance/review-status", get(api_get_review_status))
        .add("/performance/self-review", post(api_submit_self_review))
        // Documents & Letters (Self-Service)
        .add("/documents/policies", get(api_get_company_policies))
        .add(
            "/documents/policies/{id}/acknowledge",
            post(api_acknowledge_policy),
        )
        .add("/documents/my-documents", get(api_get_my_documents))
        .add("/documents/upload", post(api_upload_document))
        .add("/documents/letters", get(api_get_letter_requests))
        .add("/documents/letters", post(api_create_letter_request))
        // ===================================================================
        // HR Admin Role Handlers (Administration)
        // ===================================================================
        // Dashboard
        .add("/dashboard/stats", get(api_dashboard_stats))
        // Employees Administration
        .add("/employees", get(api_get_employees))
        .add("/employees", post(api_create_employee))
        .add("/employees/{id}", put(api_update_employee))
        .add("/employees/export", get(api_export_employees_csv))
        .add("/employees/import", post(api_import_employees_csv))
        // Leave Review (Admin Approval / Rejection)
        .add("/employee/leaves/{id}/status", put(api_update_leave_status))
        // Manpower Requirements
        .add("/manpower", get(api_get_manpower))
        .add("/manpower", post(api_create_manpower))
        .add("/manpower/{id}", put(api_update_manpower))
        .add("/manpower/{id}", delete(api_delete_manpower))
        // Jobs
        .add("/jobs", get(api_get_jobs))
        .add("/jobs", post(api_create_job))
        .add("/jobs/{id}/status", put(api_update_job_status))
        // Candidates
        .add("/candidates", get(api_get_candidates))
        .add("/candidates", post(api_create_candidate))
        .add("/candidates/{id}/status", put(api_update_candidate_status))
        // Candidate Tracker
        .add("/candidate-tracker", get(api_get_candidate_trackers))
        .add("/candidate-tracker", post(api_create_candidate_tracker))
        .add("/candidate-tracker/{id}", put(api_update_candidate_tracker))
        .add(
            "/candidate-tracker/{id}",
            delete(api_delete_candidate_tracker),
        )
        .add(
            "/candidate-tracker/{id}/convert",
            post(api_convert_candidate_to_employee),
        )
        // Interviews
        .add("/interviews", get(api_get_interviews))
        .add("/interviews", post(api_schedule_interview))
        .add("/interviews/{id}", put(api_update_interview))
        .add("/interviews/{id}", delete(api_delete_interview))
        // Offers
        .add("/offers", get(api_get_offers))
        .add("/offers", post(api_create_offer))
        .add("/offers/{id}", put(api_update_offer))
        .add("/offers/{id}", delete(api_delete_offer))
        // Joining Formalities
        .add("/joining-formalities", get(api_get_joining_formalities))
        .add("/joining-formalities", post(api_create_joining_formality))
        .add("/joining-formalities/{id}", get(api_get_joining_formality))
        .add(
            "/joining-formalities/{id}",
            put(api_update_joining_formality),
        )
        .add(
            "/joining-formalities/{id}",
            delete(api_delete_joining_formality),
        )
        .add(
            "/joining-formalities/{id}/status",
            patch(api_update_joining_status),
        )
        .add(
            "/joining-formalities/{id}/status",
            put(api_update_joining_status),
        )
        .add(
            "/joining-formalities/{id}/documents",
            patch(api_update_joining_documents),
        )
        .add(
            "/joining-formalities/{id}/documents",
            put(api_update_joining_documents),
        )
        .add(
            "/joining-formalities/{id}/complete",
            post(api_complete_joining_formality),
        )
        // Onboarding Checklists
        .add("/onboarding-checklists", get(api_get_onboarding_checklists))
        .add(
            "/onboarding-checklists",
            post(api_create_onboarding_checklist),
        )
        .add(
            "/onboarding-checklists/{id}",
            get(api_get_onboarding_checklist),
        )
        .add(
            "/onboarding-checklists/{id}",
            put(api_update_onboarding_checklist),
        )
        .add(
            "/onboarding-checklists/{id}",
            delete(api_delete_onboarding_checklist),
        )
        .add(
            "/onboarding-checklists/{id}/items",
            post(api_add_checklist_item),
        )
        .add(
            "/onboarding-checklists/{id}/items/{itemId}",
            patch(api_update_checklist_item),
        )
        .add(
            "/onboarding-checklists/{id}/items/{itemId}",
            put(api_update_checklist_item),
        )
        .add(
            "/onboarding-checklists/{id}/items/{itemId}",
            delete(api_delete_checklist_item),
        )
        .add(
            "/onboarding-checklists/{id}/items/{itemId}/status",
            patch(api_update_checklist_item_status),
        )
        .add(
            "/onboarding-checklists/{id}/items/{itemId}/status",
            put(api_update_checklist_item_status),
        )
        // Onboarding Tasks (Direct task & standard checklist API matching UI)
        .add("/onboarding-tasks", get(api_get_onboarding_tasks))
        .add("/onboarding-tasks", post(api_create_onboarding_task))
        .add(
            "/onboarding-tasks/standard",
            post(api_create_standard_checklist),
        )
        .add("/onboarding-tasks/{id}", get(api_get_onboarding_task))
        .add("/onboarding-tasks/{id}", put(api_update_onboarding_task))
        .add("/onboarding-tasks/{id}", patch(api_update_onboarding_task))
        .add(
            "/onboarding-tasks/{id}/status",
            patch(api_update_onboarding_task_status),
        )
        .add(
            "/onboarding-tasks/{id}/status",
            put(api_update_onboarding_task_status),
        )
        .add(
            "/onboarding-tasks/{id}/archive",
            patch(api_archive_onboarding_task),
        )
        .add(
            "/onboarding-tasks/{id}/archive",
            put(api_archive_onboarding_task),
        )
        .add("/onboarding-tasks/{id}", delete(api_delete_onboarding_task))
        // Internships
        .add("/internships", get(api_get_internships))
        .add("/internships", post(api_create_internship))
        .add("/internships/{id}", get(api_get_internship))
        .add("/internships/{id}", put(api_update_internship))
        .add("/internships/{id}", delete(api_delete_internship))
        .add(
            "/internships/{id}/status",
            patch(api_update_internship_status),
        )
        .add(
            "/internships/{id}/status",
            put(api_update_internship_status),
        )
        .add("/internships/{id}/archive", patch(api_archive_internship))
        .add("/internships/{id}/archive", put(api_archive_internship))
        .add("/internships/{id}/convert", post(api_convert_internship))
}

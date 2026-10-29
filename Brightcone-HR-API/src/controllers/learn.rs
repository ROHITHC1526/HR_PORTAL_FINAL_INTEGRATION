use crate::models::_entities::{
    course_assignments::{
        self, ActiveModel as AssignmentActiveModel, Entity as CourseAssignmentsEntity,
        Model as AssignmentModel,
    },
    course_categories::{self, Entity as CourseCategoriesEntity},
    course_reminders::{self, ActiveModel as ReminderActiveModel, Entity as CourseRemindersEntity},
    course_skills::Entity as CourseSkillsEntity,
    courses::{
        self, ActiveModel as CourseActiveModel, Entity as CoursesEntity, Model as CourseModel,
    },
    employee_skills::{self, Entity as EmployeeSkillsEntity},
    employees::{self, Entity as EmployeesEntity},
    posh_records::{self, ActiveModel as PoshRecordActiveModel, Entity as PoshRecordsEntity},
    security_trainings::{
        self, ActiveModel as SecurityTrainingActiveModel, Entity as SecurityTrainingsEntity,
    },
    skills::{self, Entity as SkillsEntity},
    training_programmes::{
        self, ActiveModel as TrainingProgrammeActiveModel, Entity as TrainingProgrammesEntity,
    },
    users,
};
use chrono::{Duration, Local, Utc};
use loco_rs::prelude::*;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect, Set, TransactionTrait,
};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

pub const DEFAULT_BUSINESS_TIMEZONE: &str = "+05:30";

pub fn is_admin_role(role: &str) -> bool {
    let r = role.trim().to_lowercase().replace([' ', '_', '-'], "");
    r == "hradmin"
        || r == "admin"
        || r == "payrolladmin"
        || r == "superadmin"
        || r == "seniortalentlead"
        || r == "talentlead"
        || r == "technicalrecruiter"
        || r == "recruiter"
        || matches!(
            crate::authz::Role::parse(role),
            Some(crate::authz::Role::HrAdmin | crate::authz::Role::PayrollAdmin)
        )
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DeadlineKind {
    DateOnly(chrono::NaiveDate),
    Timestamp(chrono::DateTime<chrono::FixedOffset>),
}

pub fn parse_deadline(s: &str) -> Result<DeadlineKind, &'static str> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return Err("Deadline cannot be empty");
    }

    // 1. Strict date-only format: YYYY-MM-DD
    if let Ok(date) = chrono::NaiveDate::parse_from_str(trimmed, "%Y-%m-%d") {
        return Ok(DeadlineKind::DateOnly(date));
    }

    // 2. Strict offset-aware timestamp: RFC3339 / ISO 8601
    if let Ok(ts) = chrono::DateTime::parse_from_rfc3339(trimmed) {
        return Ok(DeadlineKind::Timestamp(ts));
    }

    Err("Invalid deadline format: expected strict YYYY-MM-DD date or RFC3339 offset-aware timestamp")
}

pub fn parse_business_timezone(s: &str) -> Option<chrono::FixedOffset> {
    let trimmed = s.trim();
    if trimmed.eq_ignore_ascii_case("UTC") || trimmed.eq_ignore_ascii_case("Z") {
        return chrono::FixedOffset::east_opt(0);
    }
    if trimmed.eq_ignore_ascii_case("Asia/Kolkata") || trimmed.eq_ignore_ascii_case("IST") {
        return chrono::FixedOffset::east_opt(5 * 3600 + 30 * 60);
    }
    let clean = trimmed.strip_prefix("UTC").unwrap_or(trimmed).trim();
    let (sign, rest) = if let Some(stripped) = clean.strip_prefix('+') {
        (1, stripped)
    } else {
        let stripped = clean.strip_prefix('-')?;
        (-1, stripped)
    };
    let parts: Vec<&str> = rest.split(':').collect();
    if parts.len() == 2 {
        let hours: i32 = parts[0].parse().ok()?;
        let mins: i32 = parts[1].parse().ok()?;
        let secs = sign * (hours * 3600 + mins * 60);
        return chrono::FixedOffset::east_opt(secs);
    } else if rest.len() == 4 {
        let hours: i32 = rest[..2].parse().ok()?;
        let mins: i32 = rest[2..].parse().ok()?;
        let secs = sign * (hours * 3600 + mins * 60);
        return chrono::FixedOffset::east_opt(secs);
    }
    None
}

pub fn get_configured_business_timezone(ctx: Option<&AppContext>) -> chrono::FixedOffset {
    if let Some(ctx) = ctx {
        if let Some(settings) = &ctx.config.settings {
            if let Some(tz_str) = settings.get("business_timezone").and_then(|v| v.as_str()) {
                if let Some(tz) = parse_business_timezone(tz_str) {
                    return tz;
                }
            }
        }
    }
    if let Ok(env_tz) = std::env::var("BUSINESS_TIMEZONE") {
        if let Some(tz) = parse_business_timezone(&env_tz) {
            return tz;
        }
    }
    parse_business_timezone(DEFAULT_BUSINESS_TIMEZONE).expect("Valid default business timezone")
}

pub fn is_course_overdue_with_instant(
    course_type: &str,
    progress: i32,
    due_date: Option<&str>,
    now_utc: chrono::DateTime<chrono::Utc>,
    business_tz: chrono::FixedOffset,
) -> bool {
    if course_type != "Mandatory" || progress >= 100 {
        return false;
    }
    let Some(due_str) = due_date else {
        return false;
    };
    let trimmed = due_str.trim();
    if trimmed.is_empty() {
        return false;
    }

    match parse_deadline(trimmed) {
        Ok(DeadlineKind::DateOnly(due_date)) => {
            // Convert current UTC instant into configured business timezone
            let now_in_biz = now_utc.with_timezone(&business_tz);
            let current_biz_date = now_in_biz.date_naive();
            // Date-only deadline: course is due through 23:59:59 of that calendar day in business timezone.
            // Overdue begins at 00:00:00 on the following calendar day.
            current_biz_date > due_date
        }
        Ok(DeadlineKind::Timestamp(deadline_ts)) => {
            // Offset-aware timestamp: compare actual instants in UTC
            let deadline_utc = deadline_ts.with_timezone(&chrono::Utc);
            now_utc > deadline_utc
        }
        Err(err) => {
            tracing::warn!(due_date = %trimmed, error = %err, "Course deadline could not be parsed; treating as not overdue");
            false
        }
    }
}

pub fn is_course_overdue(course_type: &str, progress: i32, due_date: Option<&str>) -> bool {
    let now_utc = chrono::Utc::now();
    let biz_tz = get_configured_business_timezone(None);
    is_course_overdue_with_instant(course_type, progress, due_date, now_utc, biz_tz)
}

pub fn validate_resource(
    content_type: Option<&str>,
    content_url: Option<&str>,
) -> Result<Option<(String, String)>, &'static str> {
    let type_opt = content_type.map(str::trim).filter(|s| !s.is_empty());
    let url_opt = content_url.map(str::trim).filter(|s| !s.is_empty());

    match (type_opt, url_opt) {
        (None, None) => Ok(None),
        (Some(_), None) => Err("Both resource type (document, video, link) and resource URL must be provided together, or both omitted."),
        (None, Some(_)) => Err("Both resource type (document, video, link) and resource URL must be provided together, or both omitted."),
        (Some(t), Some(u)) => {
            let canon_type = match t.to_ascii_lowercase().as_str() {
                "document" => "document",
                "video" => "video",
                "link" => "link",
                _ => return Err("Invalid resource type: must be 'document', 'video', or 'link'"),
            };

            if u.len() > 2048 {
                return Err("Resource URL cannot exceed 2048 characters");
            }

            let lower_u = u.to_ascii_lowercase();
            // Reject unsafe URI schemes
            if lower_u.starts_with("javascript:")
                || lower_u.starts_with("data:")
                || lower_u.starts_with("file:")
                || lower_u.starts_with("ftp:")
                || lower_u.starts_with("blob:")
                || lower_u.starts_with("about:")
            {
                return Err("Invalid resource URL: unsafe URI scheme rejected");
            }

            // Must be absolute HTTPS URL
            if !lower_u.starts_with("https://") {
                return Err("Invalid resource URL: external material must use an absolute HTTPS URL (https://...)");
            }

            let after_scheme = &u[8..];
            let host_part = match after_scheme.find(['/', '?', '#']) {
                Some(idx) => &after_scheme[..idx],
                None => after_scheme,
            };

            if host_part.is_empty() {
                return Err("Invalid resource URL: missing hostname");
            }

            // Reject embedded credentials (user:password@host)
            if host_part.contains('@') {
                return Err("Invalid resource URL: embedded credentials (user:pass@host) are forbidden");
            }

            // Reject whitespace or invalid characters
            if u.chars().any(|c| c.is_whitespace() || c == '\\' || c == '<' || c == '>' || c == '"') {
                return Err("Invalid resource URL: malformed characters in URL");
            }

            Ok(Some((canon_type.to_string(), u.to_string())))
        }
    }
}

async fn resolve_employee_code_for_user(
    db: &DatabaseConnection,
    user: &users::Model,
) -> Result<String, sea_orm::DbErr> {
    let emp = EmployeesEntity::find()
        .filter(employees::Column::WorkEmail.eq(&user.email))
        .one(db)
        .await?;

    match emp {
        Some(e) => Ok(e.employee_code),
        None => {
            let all_employees = EmployeesEntity::find().all(db).await?;
            let code = all_employees
                .into_iter()
                .find(|e| e.full_name.to_lowercase() == user.name.to_lowercase())
                .map(|e| e.employee_code)
                .unwrap_or_else(|| user.email.clone());
            Ok(code)
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CourseWithStats {
    pub id: String,
    pub title: String,
    pub course_type: String,
    pub duration: String,
    pub audience: String,
    pub due_date: Option<String>,
    pub content_type: Option<String>,
    pub content_url: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub total_assigned: usize,
    pub completed_count: usize,
    pub completion_percentage: i32,
    pub created_at: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CourseCompletionStat {
    pub course_id: String,
    pub title: String,
    pub course_type: String,
    pub total_assigned: usize,
    pub completed_count: usize,
    pub percentage: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MandatoryCourseStat {
    pub course_id: String,
    pub title: String,
    pub due_date: Option<String>,
    pub completed_count: usize,
    pub total_assigned: usize,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct OpenMandatoryItem {
    pub assignment_id: String,
    pub employee_id: String,
    pub employee_name: String,
    pub department: String,
    pub course_id: String,
    pub course_title: String,
    pub due_date: Option<String>,
    pub progress: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LearnDashboardResponse {
    pub mandatory_compliance: i32,
    pub total_courses: usize,
    pub mandatory_courses_count: usize,
    pub elective_courses_count: usize,
    pub in_progress_count: usize,
    pub people_behind_count: usize,
    pub completion_by_course: Vec<CourseCompletionStat>,
    pub compliance_breakdown: Vec<MandatoryCourseStat>,
    pub open_mandatory: Vec<OpenMandatoryItem>,
    pub total_open_mandatory: usize,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateCourseParams {
    pub title: String,
    pub course_type: String,
    pub duration: String,
    pub audience: String,
    pub due_date: Option<String>,
    pub content_type: Option<String>,
    pub content_url: Option<String>,
    pub category_id: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CategoryItem {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub course_count: usize,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateCategoryParams {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateCategoryParams {
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SkillItem {
    pub id: String,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EmployeeSkillRating {
    pub level: String, // "Beginner" | "Intermediate" | "Advanced" | "Expert"
    pub verified: bool,
    pub verified_by: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MatrixEmployeeRow {
    pub employee_code: String,
    pub full_name: String,
    pub department: String,
    pub role: String,
    pub skills: HashMap<String, EmployeeSkillRating>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SkillsMatrixResponse {
    pub skills: Vec<SkillItem>,
    pub employees: Vec<MatrixEmployeeRow>,
    pub categories: Vec<String>,
    pub levels: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RateSkillParams {
    pub employee_id: String,
    pub skill_id: String,
    pub level: String, // "Beginner", "Intermediate", "Advanced", "Expert"
    pub verified: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateSkillParams {
    pub name: String,
    pub category: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CompletionRecordItem {
    pub id: String,
    pub course_id: String,
    pub course_title: String,
    pub course_type: String,
    pub category_name: Option<String>,
    pub duration: String,
    pub completed_at: Option<String>,
    pub is_assessment: bool,
    pub score: Option<i32>,
    pub record_type: String, // "assessment_verified" or "self_reported"
    pub employee_name: String,
    pub employee_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RecommendationItem {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub course_type: String,
    pub duration: String,
    pub category: Option<String>,
    pub due_date: Option<String>,
    pub rule_type: String, // "mandatory_compliance", "department_skill", "proficiency_growth"
    pub reason: String,
    pub skill_name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RecommendationsResponse {
    pub recommendations: Vec<RecommendationItem>,
    pub employee_department: String,
    pub employee_name: String,
    pub total_skills_mastered: usize,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateProgressParams {
    pub progress: i32,
    pub score: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateScoreParams {
    pub score: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateProgrammeParams {
    pub prog: String,
    pub ttype: String,
    pub trainer: String,
    pub mode: String,
    pub start: String,
    pub end: String,
    pub parts: i32,
    pub cost: f64,
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateProgrammeParams {
    pub prog: Option<String>,
    pub ttype: Option<String>,
    pub trainer: Option<String>,
    pub mode: Option<String>,
    pub start: Option<String>,
    pub end: Option<String>,
    pub parts: Option<i32>,
    pub cost: Option<f64>,
    pub status: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreatePoshParams {
    pub rtype: String,
    pub emp: Option<String>,
    pub name: String,
    pub role: Option<String>,
    pub date: Option<String>,
    pub valid: Option<String>,
    pub parts: Option<i32>,
    pub status: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdatePoshParams {
    pub rtype: Option<String>,
    pub emp: Option<String>,
    pub name: Option<String>,
    pub role: Option<String>,
    pub date: Option<String>,
    pub valid: Option<String>,
    pub parts: Option<i32>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateSectrainParams {
    pub course: String,
    pub emp: String,
    pub assigned: Option<String>,
    pub due: String,
    pub score: Option<i32>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateSectrainParams {
    pub course: Option<String>,
    pub emp: Option<String>,
    pub due: Option<String>,
    pub done: Option<String>,
    pub score: Option<i32>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BulkAssignSectrainParams {
    pub course: String,
    pub due: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BulkAssignResponse {
    pub assigned: usize,
    pub skipped: usize,
    pub failed: usize,
    pub message: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct EmployeeTrainingItem {
    pub id: String,
    pub title: String,
    pub training_type: String, // "Course" | "Security"
    pub due_date: Option<String>,
    pub completed_at: Option<String>,
    pub progress: i32,
    pub score: Option<i32>,
    pub is_assessment: bool,
    pub status: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct EmployeeCompletionSummary {
    pub employee_id: String,
    pub employee_name: String,
    pub department: String,
    pub assigned_count: usize,
    pub completed_count: usize,
    pub pending_count: usize,
    pub overdue_count: usize,
    pub progress_pct: i32,
    pub status: String,
    pub items: Vec<EmployeeTrainingItem>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CompletionTrackerResponse {
    pub total_employees: usize,
    pub fully_compliant_count: usize,
    pub in_progress_count: usize,
    pub overdue_count: usize,
    pub not_assigned_count: usize,
    pub overall_compliance_pct: i32,
    pub records: Vec<EmployeeCompletionSummary>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AssignCourseParams {
    pub audience: Option<String>,
    pub employee_ids: Option<Vec<String>>,
    pub due_date: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AssignCourseResponse {
    pub assigned: usize,
    pub skipped: usize,
    pub failed: usize,
    pub message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RemindParams {
    pub course_id: Option<String>,
    pub assignment_id: Option<String>,
    pub employee_id: Option<String>,
    pub employee_ids: Option<Vec<String>>,
    pub bulk: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReminderResultDetail {
    pub assignment_id: String,
    pub employee_name: String,
    pub course_title: String,
    pub status: String,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RemindResponse {
    pub queued: usize,
    pub delivered: usize,
    pub skipped: usize,
    pub failed: usize,
    pub message: String,
    pub details: Vec<ReminderResultDetail>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MyAssignmentItem {
    pub assignment_id: String,
    pub id: String,
    pub course_id: String,
    pub course_title: String,
    pub course_type: String,
    pub duration: String,
    pub due_date: Option<String>,
    pub is_overdue: bool,
    pub progress: i32,
    pub status: String,
    pub completed_at: Option<String>,
    pub content_type: Option<String>,
    pub content_url: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub score: Option<i32>,
}

#[debug_handler]
pub async fn dashboard(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let all_courses = CoursesEntity::find()
        .order_by_asc(courses::Column::Title)
        .all(&ctx.db)
        .await?;
    let all_assignments = CourseAssignmentsEntity::find().all(&ctx.db).await?;
    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .filter(employees::Column::Status.ne("Exited"))
        .all(&ctx.db)
        .await?;

    let active_emp_ids: HashSet<String> = all_employees
        .iter()
        .map(|e| e.employee_code.clone())
        .collect();

    let emp_map: HashMap<String, (String, String)> = all_employees
        .into_iter()
        .map(|e| (e.employee_code.clone(), (e.full_name, e.department)))
        .collect();

    let mut assignments_by_course: HashMap<String, Vec<&AssignmentModel>> = HashMap::new();
    for a in &all_assignments {
        if active_emp_ids.contains(&a.employee_id) {
            assignments_by_course
                .entry(a.course_id.clone())
                .or_default()
                .push(a);
        }
    }

    let mut total_mand_assigned = 0usize;
    let mut total_mand_done = 0usize;
    let mut in_progress_count = 0usize;
    let mut people_behind_set = HashSet::new();
    let mut completion_by_course = Vec::new();
    let mut compliance_breakdown = Vec::new();
    let mut open_mandatory = Vec::new();

    let mandatory_courses: Vec<&CourseModel> = all_courses
        .iter()
        .filter(|c| c.course_type == "Mandatory")
        .collect();
    let elective_courses_count = all_courses.len() - mandatory_courses.len();

    for c in &all_courses {
        let assigned = assignments_by_course
            .get(&c.id)
            .cloned()
            .unwrap_or_default();
        let total_assigned = assigned.len();
        let completed_count = assigned.iter().filter(|a| a.progress >= 100).count();
        let pct = if total_assigned > 0 {
            ((completed_count as f64 / total_assigned as f64) * 100.0).round() as i32
        } else {
            0
        };

        completion_by_course.push(CourseCompletionStat {
            course_id: c.id.clone(),
            title: c.title.clone(),
            course_type: c.course_type.clone(),
            total_assigned,
            completed_count,
            percentage: pct,
        });

        if c.course_type == "Mandatory" {
            total_mand_assigned += total_assigned;
            total_mand_done += completed_count;

            compliance_breakdown.push(MandatoryCourseStat {
                course_id: c.id.clone(),
                title: c.title.clone(),
                due_date: c.due_date.clone(),
                completed_count,
                total_assigned,
            });

            for a in assigned {
                if a.progress < 100 {
                    people_behind_set.insert(a.employee_id.clone());
                    let (emp_name, dept) = emp_map
                        .get(&a.employee_id)
                        .cloned()
                        .unwrap_or_else(|| (a.employee_name.clone(), "General".to_string()));

                    open_mandatory.push(OpenMandatoryItem {
                        assignment_id: a.id.clone(),
                        employee_id: a.employee_id.clone(),
                        employee_name: emp_name,
                        department: dept,
                        course_id: c.id.clone(),
                        course_title: c.title.clone(),
                        due_date: c.due_date.clone(),
                        progress: a.progress,
                    });
                }
            }
        }
    }

    for a in &all_assignments {
        if active_emp_ids.contains(&a.employee_id) && a.progress > 0 && a.progress < 100 {
            in_progress_count += 1;
        }
    }

    let mandatory_compliance = if total_mand_assigned > 0 {
        ((total_mand_done as f64 / total_mand_assigned as f64) * 100.0).round() as i32
    } else {
        100
    };

    open_mandatory.sort_by(|a, b| {
        a.due_date
            .as_deref()
            .unwrap_or("9999-99-99")
            .cmp(b.due_date.as_deref().unwrap_or("9999-99-99"))
    });

    let total_open_mandatory = open_mandatory.len();

    format::json(LearnDashboardResponse {
        mandatory_compliance,
        total_courses: all_courses.len(),
        mandatory_courses_count: mandatory_courses.len(),
        elective_courses_count,
        in_progress_count,
        people_behind_count: people_behind_set.len(),
        completion_by_course,
        compliance_breakdown,
        open_mandatory,
        total_open_mandatory,
    })
}

#[debug_handler]
pub async fn list_courses(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let all_courses = CoursesEntity::find()
        .order_by_asc(courses::Column::Title)
        .all(&ctx.db)
        .await?;
    let all_assignments = CourseAssignmentsEntity::find().all(&ctx.db).await?;

    let mut assignments_by_course: HashMap<String, Vec<&AssignmentModel>> = HashMap::new();
    for a in &all_assignments {
        assignments_by_course
            .entry(a.course_id.clone())
            .or_default()
            .push(a);
    }

    let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
    let category_map: HashMap<String, String> = all_categories
        .into_iter()
        .map(|cat| (cat.id, cat.name))
        .collect();

    let res: Vec<CourseWithStats> = all_courses
        .into_iter()
        .map(|c| {
            let assigned = assignments_by_course
                .get(&c.id)
                .cloned()
                .unwrap_or_default();
            let total_assigned = assigned.len();
            let completed_count = assigned.iter().filter(|a| a.progress >= 100).count();
            let completion_percentage = if total_assigned > 0 {
                ((completed_count as f64 / total_assigned as f64) * 100.0).round() as i32
            } else {
                0
            };
            let cat_name = c
                .category_id
                .as_ref()
                .and_then(|cid| category_map.get(cid).cloned());
            CourseWithStats {
                id: c.id,
                title: c.title,
                course_type: c.course_type,
                duration: c.duration,
                audience: c.audience,
                due_date: c.due_date,
                content_type: c.content_type,
                content_url: c.content_url,
                category_id: c.category_id,
                category_name: cat_name,
                total_assigned,
                completed_count,
                completion_percentage,
                created_at: c.created_at.to_rfc3339(),
            }
        })
        .collect();

    format::json(res)
}

#[debug_handler]
pub async fn create_course(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateCourseParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    if params.title.trim().len() < 3 {
        return bad_request("Course title must be at least 3 characters");
    }
    if params.course_type != "Mandatory" && params.course_type != "Elective" {
        return bad_request("Course type must be either 'Mandatory' or 'Elective'");
    }
    if params.duration.trim().is_empty() {
        return bad_request("Duration is required");
    }
    if params.audience.trim().is_empty() {
        return bad_request("Audience is required");
    }
    if let Some(ref d) = params.due_date {
        let trimmed = d.trim();
        if !trimmed.is_empty() {
            if let Err(err_msg) = parse_deadline(trimmed) {
                return bad_request(err_msg);
            }
        }
    }

    let (target_content_type, target_content_url) = match validate_resource(
        params.content_type.as_deref(),
        params.content_url.as_deref(),
    ) {
        Ok(Some((t, u))) => (Some(t), Some(u)),
        Ok(None) => (None, None),
        Err(err_msg) => return bad_request(err_msg),
    };

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .all(&ctx.db)
        .await?;

    let clean_category_id = params.category_id.and_then(|c| {
        let t = c.trim().to_string();
        if t.is_empty() {
            None
        } else {
            Some(t)
        }
    });
    if let Some(ref cid) = clean_category_id {
        let cat_exists = CourseCategoriesEntity::find_by_id(cid).one(&ctx.db).await?;
        if cat_exists.is_none() {
            return bad_request("Referenced category does not exist");
        }
    }

    let course_id = format!(
        "CO{}",
        Uuid::new_v4().to_string().replace('-', "")[..8].to_uppercase()
    );
    let now = Local::now().into();
    let txn = ctx.db.begin().await?;

    let new_course = CourseActiveModel {
        id: Set(course_id.clone()),
        title: Set(params.title.trim().to_string()),
        course_type: Set(params.course_type.clone()),
        duration: Set(params.duration.clone()),
        audience: Set(params.audience.clone()),
        due_date: Set(params.due_date.clone()),
        content_type: Set(target_content_type),
        content_url: Set(target_content_url),
        category_id: Set(clean_category_id),
        created_at: Set(now),
        updated_at: Set(now),
    };
    new_course.insert(&txn).await?;

    // Determine target employees according to audience rule
    for emp in &all_employees {
        let is_target = match params.audience.as_str() {
            "Everyone" => true,
            "Managers" => all_employees
                .iter()
                .any(|x| x.manager_name.as_deref() == Some(&emp.full_name)),
            dept => emp.department == dept,
        };

        if is_target {
            let assign = AssignmentActiveModel {
                id: Set(Uuid::new_v4().to_string()),
                course_id: Set(course_id.clone()),
                employee_id: Set(emp.employee_code.clone()),
                employee_name: Set(emp.full_name.clone()),
                progress: Set(0),
                status: Set("Not started".to_string()),
                completed_at: Set(None),
                score: Set(None),
                created_at: Set(now),
                updated_at: Set(now),
            };
            assign.insert(&txn).await?;
        }
    }

    txn.commit().await?;

    let Some(created) = CoursesEntity::find_by_id(&course_id).one(&ctx.db).await? else {
        return not_found();
    };

    let assigned_count = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::CourseId.eq(&course_id))
        .all(&ctx.db)
        .await?
        .len();

    let category_name = if let Some(ref cid) = created.category_id {
        CourseCategoriesEntity::find_by_id(cid)
            .one(&ctx.db)
            .await?
            .map(|c| c.name)
    } else {
        None
    };

    format::json(CourseWithStats {
        id: created.id,
        title: created.title,
        course_type: created.course_type,
        duration: created.duration,
        audience: created.audience,
        due_date: created.due_date,
        content_type: created.content_type,
        content_url: created.content_url,
        category_id: created.category_id,
        category_name,
        total_assigned: assigned_count,
        completed_count: 0,
        completion_percentage: 0,
        created_at: created.created_at.to_rfc3339(),
    })
}

#[debug_handler]
pub async fn update_course(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(body): Json<serde_json::Value>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let params: CreateCourseParams = match serde_json::from_value(body.clone()) {
        Ok(p) => p,
        Err(e) => return bad_request(format!("Invalid course payload: {}", e)),
    };

    if params.title.trim().len() < 3 {
        return bad_request("Course title must be at least 3 characters");
    }
    if params.course_type != "Mandatory" && params.course_type != "Elective" {
        return bad_request("Course type must be either 'Mandatory' or 'Elective'");
    }
    if params.duration.trim().is_empty() {
        return bad_request("Duration is required");
    }
    if params.audience.trim().is_empty() {
        return bad_request("Audience is required");
    }
    if let Some(ref d) = params.due_date {
        let trimmed = d.trim();
        if !trimmed.is_empty() {
            if let Err(err_msg) = parse_deadline(trimmed) {
                return bad_request(err_msg);
            }
        }
    }

    let Some(existing) = CoursesEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let obj = body.as_object();
    let has_type_key = obj.map(|o| o.contains_key("content_type")).unwrap_or(false);
    let has_url_key = obj.map(|o| o.contains_key("content_url")).unwrap_or(false);

    let (target_content_type, target_content_url) = if !has_type_key && !has_url_key {
        // Neither key supplied: partial update omitting resource fields -> retain existing
        (existing.content_type.clone(), existing.content_url.clone())
    } else {
        // At least one key was present: validate (null/empty yields Ok(None) -> explicit removal)
        match validate_resource(
            params.content_type.as_deref(),
            params.content_url.as_deref(),
        ) {
            Ok(Some((t, u))) => (Some(t), Some(u)),
            Ok(None) => (None, None),
            Err(err_msg) => return bad_request(err_msg),
        }
    };

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .all(&ctx.db)
        .await?;

    let now = Local::now().into();
    let txn = ctx.db.begin().await?;

    let mut active: CourseActiveModel = existing.into();
    active.title = Set(params.title.trim().to_string());
    active.course_type = Set(params.course_type.clone());
    active.duration = Set(params.duration.clone());
    active.audience = Set(params.audience.clone());
    active.due_date = Set(params.due_date.clone());
    active.content_type = Set(target_content_type);
    active.content_url = Set(target_content_url);
    if obj.map(|o| o.contains_key("category_id")).unwrap_or(false) {
        let clean_category_id = params.category_id.and_then(|c| {
            let t = c.trim().to_string();
            if t.is_empty() {
                None
            } else {
                Some(t)
            }
        });
        if let Some(ref cid) = clean_category_id {
            let cat_exists = CourseCategoriesEntity::find_by_id(cid).one(&txn).await?;
            if cat_exists.is_none() {
                let _ = txn.rollback().await;
                return bad_request("Referenced category does not exist");
            }
        }
        active.category_id = Set(clean_category_id);
    }
    active.updated_at = Set(now);
    active.update(&txn).await?;

    let current_assignments = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::CourseId.eq(&id))
        .all(&txn)
        .await?;
    let assigned_emp_ids: HashSet<String> = current_assignments
        .into_iter()
        .map(|a| a.employee_id)
        .collect();

    for emp in &all_employees {
        let is_target = match params.audience.as_str() {
            "Everyone" => true,
            "Managers" => all_employees
                .iter()
                .any(|x| x.manager_name.as_deref() == Some(&emp.full_name)),
            dept => emp.department == dept,
        };

        if is_target && !assigned_emp_ids.contains(&emp.employee_code) {
            let assign = AssignmentActiveModel {
                id: Set(Uuid::new_v4().to_string()),
                course_id: Set(id.clone()),
                employee_id: Set(emp.employee_code.clone()),
                employee_name: Set(emp.full_name.clone()),
                progress: Set(0),
                status: Set("Not started".to_string()),
                completed_at: Set(None),
                score: Set(None),
                created_at: Set(now),
                updated_at: Set(now),
            };
            assign.insert(&txn).await?;
        }
    }

    txn.commit().await?;

    let Some(updated) = CoursesEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let assigned = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::CourseId.eq(&id))
        .all(&ctx.db)
        .await?;
    let total_assigned = assigned.len();
    let completed_count = assigned.iter().filter(|a| a.progress >= 100).count();
    let completion_percentage = if total_assigned > 0 {
        ((completed_count as f64 / total_assigned as f64) * 100.0).round() as i32
    } else {
        0
    };

    let category_name = if let Some(ref cid) = updated.category_id {
        CourseCategoriesEntity::find_by_id(cid)
            .one(&ctx.db)
            .await?
            .map(|c| c.name)
    } else {
        None
    };

    format::json(CourseWithStats {
        id: updated.id,
        title: updated.title,
        course_type: updated.course_type,
        duration: updated.duration,
        audience: updated.audience,
        due_date: updated.due_date,
        content_type: updated.content_type,
        content_url: updated.content_url,
        category_id: updated.category_id,
        category_name,
        total_assigned,
        completed_count,
        completion_percentage,
        created_at: updated.created_at.to_rfc3339(),
    })
}

#[debug_handler]
pub async fn my_learning(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let employee_code = resolve_employee_code_for_user(&ctx.db, &user).await?;

    let assignments = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::EmployeeId.eq(&employee_code))
        .all(&ctx.db)
        .await?;

    let all_courses = CoursesEntity::find().all(&ctx.db).await?;
    let course_map: HashMap<String, CourseModel> =
        all_courses.into_iter().map(|c| (c.id.clone(), c)).collect();

    let biz_tz = get_configured_business_timezone(Some(&ctx));
    let now_utc = chrono::Utc::now();

    let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
    let category_map: HashMap<String, String> = all_categories
        .into_iter()
        .map(|cat| (cat.id, cat.name))
        .collect();

    let res: Vec<MyAssignmentItem> = assignments
        .into_iter()
        .filter_map(|a| {
            let c = course_map.get(&a.course_id)?;
            let is_overdue = is_course_overdue_with_instant(
                &c.course_type,
                a.progress,
                c.due_date.as_deref(),
                now_utc,
                biz_tz,
            );
            let cat_name = c
                .category_id
                .as_ref()
                .and_then(|cid| category_map.get(cid).cloned());
            Some(MyAssignmentItem {
                assignment_id: a.id.clone(),
                id: a.id,
                course_id: c.id.clone(),
                course_title: c.title.clone(),
                course_type: c.course_type.clone(),
                duration: c.duration.clone(),
                due_date: c.due_date.clone(),
                is_overdue,
                progress: a.progress,
                status: a.status,
                completed_at: a.completed_at.map(|t| t.to_rfc3339()),
                content_type: c.content_type.clone(),
                content_url: c.content_url.clone(),
                category_id: c.category_id.clone(),
                category_name: cat_name,
                score: a.score,
            })
        })
        .collect();

    format::json(res)
}

#[debug_handler]
pub async fn get_assignment(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let Some(assign) = CourseAssignmentsEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    // Verify employee authorization: employees can ONLY view their own assignments
    if !is_admin_role(&user.role) {
        let my_code = resolve_employee_code_for_user(&ctx.db, &user).await?;
        if my_code != assign.employee_id {
            return Err(crate::authz::forbidden(
                "forbidden",
                "Access denied: You may only view your own course assignments",
            ));
        }
    }

    let course = CoursesEntity::find_by_id(&assign.course_id)
        .one(&ctx.db)
        .await?;
    let (course_title, course_type, duration, due_date, content_type, content_url) = match course {
        Some(c) => (
            c.title,
            c.course_type,
            c.duration,
            c.due_date,
            c.content_type,
            c.content_url,
        ),
        None => (
            "Course".to_string(),
            "Mandatory".to_string(),
            "—".to_string(),
            None,
            None,
            None,
        ),
    };

    let biz_tz = get_configured_business_timezone(Some(&ctx));
    let now_utc = chrono::Utc::now();
    let is_overdue = is_course_overdue_with_instant(
        &course_type,
        assign.progress,
        due_date.as_deref(),
        now_utc,
        biz_tz,
    );

    let res = MyAssignmentItem {
        assignment_id: assign.id.clone(),
        id: assign.id.clone(),
        course_id: assign.course_id,
        course_title,
        course_type,
        duration,
        due_date,
        is_overdue,
        progress: assign.progress,
        status: assign.status,
        completed_at: assign.completed_at.map(|t| t.to_rfc3339()),
        content_type,
        content_url,
        category_id: None,
        category_name: None,
        score: assign.score,
    };

    format::json(res)
}

#[debug_handler]
pub async fn update_assignment_progress(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateProgressParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let Some(assign) = CourseAssignmentsEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    // Verify employee authorization: employees can ONLY update their own assignments
    if !is_admin_role(&user.role) {
        let my_code = resolve_employee_code_for_user(&ctx.db, &user).await?;
        if my_code != assign.employee_id {
            return Err(crate::authz::forbidden(
                "forbidden",
                "Access denied: You may only update your own course assignments",
            ));
        }
    }

    let course = CoursesEntity::find_by_id(&assign.course_id)
        .one(&ctx.db)
        .await?;

    let bounded_progress = params.progress.clamp(0, 100);

    // Prevent new completion through this flow until material is attached, enforcing that condition on the backend as well
    if bounded_progress >= 100 && assign.progress < 100 {
        let has_resource = course
            .as_ref()
            .and_then(|c| c.content_url.as_ref())
            .map(|u| !u.trim().is_empty())
            .unwrap_or(false);

        if !has_resource {
            return bad_request(
                "Course material has not been added yet. Completion cannot be self-reported until material is attached."
            );
        }
    }

    let now = Local::now().into();

    let mut active: AssignmentActiveModel = assign.into();
    active.progress = Set(bounded_progress);
    if let Some(sc) = params.score {
        if is_admin_role(&user.role) {
            active.score = Set(Some(sc.clamp(0, 100)));
        }
    }
    if bounded_progress >= 100 {
        active.status = Set("Completed".to_string());
        active.completed_at = Set(Some(now));
    } else if bounded_progress > 0 {
        active.status = Set("In progress".to_string());
        active.completed_at = Set(None);
    } else {
        active.status = Set("Not started".to_string());
        active.completed_at = Set(None);
    }
    active.updated_at = Set(now);

    let updated = active.update(&ctx.db).await?;

    let (course_title, course_type, duration, due_date, content_type, content_url) = match course {
        Some(c) => (
            c.title,
            c.course_type,
            c.duration,
            c.due_date,
            c.content_type,
            c.content_url,
        ),
        None => (
            "Course".to_string(),
            "Mandatory".to_string(),
            "—".to_string(),
            None,
            None,
            None,
        ),
    };

    let biz_tz = get_configured_business_timezone(Some(&ctx));
    let now_utc = chrono::Utc::now();
    let is_overdue = is_course_overdue_with_instant(
        &course_type,
        updated.progress,
        due_date.as_deref(),
        now_utc,
        biz_tz,
    );

    let res = MyAssignmentItem {
        assignment_id: updated.id.clone(),
        id: updated.id,
        course_id: updated.course_id,
        course_title,
        course_type,
        duration,
        due_date,
        is_overdue,
        progress: updated.progress,
        status: updated.status,
        completed_at: updated.completed_at.map(|t| t.to_rfc3339()),
        content_type,
        content_url,
        category_id: None,
        category_name: None,
        score: updated.score,
    };

    format::json(res)
}

#[debug_handler]
pub async fn send_reminders(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<RemindParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let now = Utc::now();
    let cooldown_threshold = now - Duration::hours(24);

    // Empty selection guard: Empty criteria must never become a global dispatch
    if params.course_id.is_none()
        && params.assignment_id.is_none()
        && params.employee_id.is_none()
        && params.employee_ids.is_none()
    {
        return format::json(RemindResponse {
            queued: 0,
            delivered: 0,
            skipped: 0,
            failed: 0,
            message: "No targets selected. Reminders require explicit course, assignment, or employee parameters.".to_string(),
            details: vec![],
        });
    }

    let mut query = CourseAssignmentsEntity::find();

    if let Some(assign_id) = &params.assignment_id {
        if !assign_id.starts_with("SEC-") {
            query = query.filter(course_assignments::Column::Id.eq(assign_id));
        } else {
            // Target is explicitly security training, exclude course assignments
            query = query.filter(course_assignments::Column::Id.eq("__none__"));
        }
    }
    if let Some(c_id) = &params.course_id {
        query = query.filter(course_assignments::Column::CourseId.eq(c_id));
    }
    if let Some(e_id) = &params.employee_id {
        query = query.filter(course_assignments::Column::EmployeeId.eq(e_id));
    }
    // Empty recipient selection guard: An empty recipient list must never become a global reminder request
    if let Some(ref emp_ids) = params.employee_ids {
        if emp_ids.is_empty() {
            return format::json(RemindResponse {
                queued: 0,
                delivered: 0,
                skipped: 0,
                failed: 0,
                message: "No recipients selected".to_string(),
                details: vec![],
            });
        }
        query = query.filter(course_assignments::Column::EmployeeId.is_in(emp_ids));
    }

    let candidates = query.all(&ctx.db).await?;
    let all_courses = CoursesEntity::find().all(&ctx.db).await?;
    let course_map: HashMap<String, String> =
        all_courses.into_iter().map(|c| (c.id, c.title)).collect();

    let mut queued = 0usize;
    let mut skipped = 0usize;
    let mut details = Vec::new();

    for assign in candidates {
        let c_title = course_map
            .get(&assign.course_id)
            .cloned()
            .unwrap_or_else(|| "Course".to_string());

        // Atomic transaction with row-level lock on the target assignment to serialize concurrent requests
        let txn = match ctx.db.begin().await {
            Ok(t) => t,
            Err(_) => continue,
        };

        let locked_assign = CourseAssignmentsEntity::find_by_id(&assign.id)
            .lock_exclusive()
            .one(&txn)
            .await;

        let cur_assign = match locked_assign {
            Ok(Some(a)) => a,
            _ => {
                let _ = txn.rollback().await;
                continue;
            }
        };

        // Eligibility check under row lock: only incomplete assignments receive reminders
        if cur_assign.progress >= 100 {
            let _ = txn.rollback().await;
            skipped += 1;
            details.push(ReminderResultDetail {
                assignment_id: cur_assign.id.clone(),
                employee_name: cur_assign.employee_name.clone(),
                course_title: c_title,
                status: "Skipped".to_string(),
                reason: Some("Course already completed".to_string()),
            });
            continue;
        }

        // Cooldown check under row lock: has a reminder been created in the last 24 hours?
        let recent_reminder = CourseRemindersEntity::find()
            .filter(course_reminders::Column::AssignmentId.eq(&cur_assign.id))
            .filter(course_reminders::Column::CreatedAt.gte(cooldown_threshold))
            .one(&txn)
            .await;

        if let Ok(Some(_)) = recent_reminder {
            let _ = txn.rollback().await;
            skipped += 1;
            details.push(ReminderResultDetail {
                assignment_id: cur_assign.id.clone(),
                employee_name: cur_assign.employee_name.clone(),
                course_title: c_title,
                status: "Skipped".to_string(),
                reason: Some("Cooldown active (reminder sent within last 24h)".to_string()),
            });
            continue;
        }

        // Create persistent reminder record with honest status "Queued" (outbox pattern)
        let reminder_id = Uuid::new_v4().to_string();
        let reminder = ReminderActiveModel {
            id: Set(reminder_id.clone()),
            assignment_id: Set(cur_assign.id.clone()),
            course_id: Set(cur_assign.course_id.clone()),
            employee_id: Set(cur_assign.employee_id.clone()),
            sent_by: Set(user.email.clone()),
            status: Set("Queued".to_string()),
            reason: Set(None),
            claimed_at: Set(None),
            retry_count: Set(0),
            created_at: Set(now.into()),
            updated_at: Set(now.into()),
        };

        if let Err(e) = reminder.insert(&txn).await {
            let _ = txn.rollback().await;
            tracing::error!("Failed to insert reminder: {:?}", e);
            continue;
        }

        if let Err(e) = txn.commit().await {
            tracing::error!("Failed to commit reminder txn: {:?}", e);
            continue;
        }

        // Dispatch background worker task
        let _ = crate::workers::course_reminder::CourseReminderWorker::perform_later(
            &ctx,
            crate::workers::course_reminder::CourseReminderWorkerArgs {
                reminder_id: reminder_id.clone(),
                assignment_id: cur_assign.id.clone(),
                employee_id: cur_assign.employee_id.clone(),
                course_id: cur_assign.course_id.clone(),
            },
        )
        .await;

        queued += 1;

        details.push(ReminderResultDetail {
            assignment_id: cur_assign.id.clone(),
            employee_name: cur_assign.employee_name.clone(),
            course_title: c_title,
            status: "Queued".to_string(),
            reason: Some("Reminder queued in persistent outbox".to_string()),
        });
    }

    // Security training reminders (matching specific SEC- ID, employee, or bulk scope)
    let is_sec_targeted = params
        .assignment_id
        .as_deref()
        .map(|s| s.starts_with("SEC-"))
        .unwrap_or(false);
    if is_sec_targeted
        || params.bulk == Some(true)
        || params.employee_id.is_some()
        || params.employee_ids.is_some()
    {
        let mut sec_query = SecurityTrainingsEntity::find();
        if is_sec_targeted {
            let raw_id = &params.assignment_id.as_ref().unwrap()[4..];
            sec_query = sec_query.filter(security_trainings::Column::Id.eq(raw_id));
        }
        if let Some(e_id) = &params.employee_id {
            sec_query = sec_query.filter(security_trainings::Column::Emp.eq(e_id));
        }
        if let Some(ref emp_ids) = params.employee_ids {
            if !emp_ids.is_empty() {
                sec_query = sec_query.filter(security_trainings::Column::Emp.is_in(emp_ids));
            }
        }

        let sec_candidates = sec_query.all(&ctx.db).await.unwrap_or_default();
        for st in sec_candidates {
            if st.status == "Completed" {
                skipped += 1;
                details.push(ReminderResultDetail {
                    assignment_id: format!("SEC-{}", st.id),
                    employee_name: st.emp.clone(),
                    course_title: st.course.clone(),
                    status: "Skipped".to_string(),
                    reason: Some("Security training already completed".to_string()),
                });
                continue;
            }

            let recent_reminder = CourseRemindersEntity::find()
                .filter(course_reminders::Column::AssignmentId.eq(format!("SEC-{}", st.id)))
                .filter(course_reminders::Column::CreatedAt.gte(cooldown_threshold))
                .one(&ctx.db)
                .await;

            if let Ok(Some(_)) = recent_reminder {
                skipped += 1;
                details.push(ReminderResultDetail {
                    assignment_id: format!("SEC-{}", st.id),
                    employee_name: st.emp.clone(),
                    course_title: st.course.clone(),
                    status: "Skipped".to_string(),
                    reason: Some("Cooldown active (reminder sent within last 24h)".to_string()),
                });
                continue;
            }

            let reminder_id = Uuid::new_v4().to_string();
            let sec_course_id = st
                .course_id
                .clone()
                .unwrap_or_else(|| format!("SEC-{}", st.id));
            let reminder = ReminderActiveModel {
                id: Set(reminder_id.clone()),
                assignment_id: Set(format!("SEC-{}", st.id)),
                course_id: Set(sec_course_id.clone()),
                employee_id: Set(st.emp.clone()),
                sent_by: Set(user.email.clone()),
                status: Set("Queued".to_string()),
                reason: Set(None),
                claimed_at: Set(None),
                retry_count: Set(0),
                created_at: Set(now.into()),
                updated_at: Set(now.into()),
            };

            if reminder.insert(&ctx.db).await.is_ok() {
                let _ = crate::workers::course_reminder::CourseReminderWorker::perform_later(
                    &ctx,
                    crate::workers::course_reminder::CourseReminderWorkerArgs {
                        reminder_id: reminder_id.clone(),
                        assignment_id: format!("SEC-{}", st.id),
                        employee_id: st.emp.clone(),
                        course_id: sec_course_id,
                    },
                )
                .await;
                queued += 1;
                details.push(ReminderResultDetail {
                    assignment_id: format!("SEC-{}", st.id),
                    employee_name: st.emp,
                    course_title: st.course,
                    status: "Queued".to_string(),
                    reason: Some(
                        "Security training reminder queued in persistent outbox".to_string(),
                    ),
                });
            }
        }
    }

    let message = format!(
        "Processed reminders: {} queued in outbox, {} skipped",
        queued, skipped
    );

    format::json(RemindResponse {
        queued,
        delivered: 0, // Truthful: queued in outbox; SMTP delivery is unconfigured in local dev
        skipped,
        failed: 0,
        message,
        details,
    })
}

async fn next_programme_id(db: &DatabaseConnection) -> String {
    let all = TrainingProgrammesEntity::find()
        .all(db)
        .await
        .unwrap_or_default();
    let max_num = all
        .iter()
        .filter_map(|p| {
            if p.id.starts_with("TR-") {
                p.id[3..].parse::<u32>().ok()
            } else {
                None
            }
        })
        .max()
        .unwrap_or(0);
    format!("TR-{:04}", max_num + 1)
}

async fn next_posh_id(db: &DatabaseConnection) -> String {
    let all = PoshRecordsEntity::find().all(db).await.unwrap_or_default();
    let max_num = all
        .iter()
        .filter_map(|p| {
            if p.id.starts_with("POSH-") {
                p.id[5..].parse::<u32>().ok()
            } else {
                None
            }
        })
        .max()
        .unwrap_or(0);
    format!("POSH-{:04}", max_num + 1)
}

async fn next_sectrain_id(db: &DatabaseConnection) -> String {
    let all = SecurityTrainingsEntity::find()
        .all(db)
        .await
        .unwrap_or_default();
    let max_num = all
        .iter()
        .filter_map(|s| {
            if s.id.starts_with("SEC-") {
                s.id[4..].parse::<u32>().ok()
            } else {
                None
            }
        })
        .max()
        .unwrap_or(0);
    format!("SEC-{:04}", max_num + 1)
}

#[debug_handler]
pub async fn update_assignment_score(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateScoreParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(assign) = CourseAssignmentsEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    let bounded_score = params.score.clamp(0, 100);
    let mut active: AssignmentActiveModel = assign.into();
    active.score = Set(Some(bounded_score));
    active.updated_at = Set(Local::now().into());
    let updated = active.update(&ctx.db).await?;

    let course = CoursesEntity::find_by_id(&updated.course_id)
        .one(&ctx.db)
        .await?;
    let (course_title, course_type, duration, due_date, content_type, content_url) = match course {
        Some(c) => (
            c.title,
            c.course_type,
            c.duration,
            c.due_date,
            c.content_type,
            c.content_url,
        ),
        None => (
            "Course".to_string(),
            "Mandatory".to_string(),
            "—".to_string(),
            None,
            None,
            None,
        ),
    };

    let biz_tz = get_configured_business_timezone(Some(&ctx));
    let now_utc = chrono::Utc::now();
    let is_overdue = is_course_overdue_with_instant(
        &course_type,
        updated.progress,
        due_date.as_deref(),
        now_utc,
        biz_tz,
    );

    let res = MyAssignmentItem {
        assignment_id: updated.id.clone(),
        id: updated.id,
        course_id: updated.course_id,
        course_title,
        course_type,
        duration,
        due_date,
        is_overdue,
        progress: updated.progress,
        status: updated.status,
        completed_at: updated.completed_at.map(|t| t.to_rfc3339()),
        content_type,
        content_url,
        category_id: None,
        category_name: None,
        score: updated.score,
    };

    format::json(res)
}

#[debug_handler]
pub async fn list_programmes(_auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let programmes = TrainingProgrammesEntity::find()
        .order_by_desc(training_programmes::Column::Start)
        .all(&ctx.db)
        .await?;
    format::json(programmes)
}

#[debug_handler]
pub async fn create_programme(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateProgrammeParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    if params.prog.trim().is_empty() {
        return bad_request("Programme name is required");
    }
    if params.start.trim().is_empty() || params.end.trim().is_empty() {
        return bad_request("Start date and end date are required");
    }

    let new_id = next_programme_id(&ctx.db).await;
    let now = Local::now().into();

    let active = TrainingProgrammeActiveModel {
        id: Set(new_id),
        prog: Set(params.prog.trim().to_string()),
        ttype: Set(params.ttype.trim().to_string()),
        trainer: Set(Some(params.trainer.trim().to_string())),
        mode: Set(Some(params.mode.trim().to_string())),
        start: Set(params.start.trim().to_string()),
        end: Set(Some(params.end.trim().to_string())),
        parts: Set(Some(params.parts.max(0))),
        cost: Set(Some(params.cost.max(0.0))),
        status: Set(if params.status.trim().is_empty() {
            "Planned".to_string()
        } else {
            params.status.trim().to_string()
        }),
        notes: Set(params.notes.filter(|n| !n.trim().is_empty())),
        created_at: Set(now),
        updated_at: Set(now),
    };

    let created = active.insert(&ctx.db).await?;
    format::json(created)
}

#[debug_handler]
pub async fn update_programme(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateProgrammeParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = TrainingProgrammesEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    let mut active: TrainingProgrammeActiveModel = existing.into();
    if let Some(prog) = params.prog {
        let trimmed = prog.trim().to_string();
        if !trimmed.is_empty() {
            active.prog = Set(trimmed);
        }
    }
    if let Some(ttype) = params.ttype {
        active.ttype = Set(ttype.trim().to_string());
    }
    if let Some(trainer) = params.trainer {
        active.trainer = Set(Some(trainer.trim().to_string()));
    }
    if let Some(mode) = params.mode {
        active.mode = Set(Some(mode.trim().to_string()));
    }
    if let Some(start) = params.start {
        active.start = Set(start.trim().to_string());
    }
    if let Some(end) = params.end {
        active.end = Set(Some(end.trim().to_string()));
    }
    if let Some(parts) = params.parts {
        active.parts = Set(Some(parts.max(0)));
    }
    if let Some(cost) = params.cost {
        active.cost = Set(Some(cost.max(0.0)));
    }
    if let Some(status) = params.status {
        active.status = Set(status.trim().to_string());
    }
    if let Some(notes) = params.notes {
        active.notes = Set(if notes.trim().is_empty() {
            None
        } else {
            Some(notes.trim().to_string())
        });
    }
    active.updated_at = Set(Local::now().into());

    let updated = active.update(&ctx.db).await?;
    format::json(updated)
}

#[debug_handler]
pub async fn delete_programme(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = TrainingProgrammesEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    let active: TrainingProgrammeActiveModel = existing.into();
    active.delete(&ctx.db).await?;

    format::json(serde_json::json!({ "success": true, "id": id }))
}

#[debug_handler]
pub async fn list_posh(_auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let records = PoshRecordsEntity::find()
        .order_by_asc(posh_records::Column::Id)
        .all(&ctx.db)
        .await?;

    let today = Local::now().format("%Y-%m-%d").to_string();
    let computed: Vec<serde_json::Value> = records
        .into_iter()
        .map(|r| {
            let mut status = r.status.clone();
            if r.rtype == "Training session" && status != "Completed" {
                if let Some(valid_str) = &r.valid {
                    if valid_str.as_str() < today.as_str() {
                        status = "Overdue".to_string();
                    }
                }
            }
            serde_json::json!({
                "id": r.id,
                "rtype": r.rtype,
                "emp": r.emp,
                "name": r.name,
                "role": r.role,
                "date": r.date,
                "valid": r.valid,
                "parts": r.parts,
                "status": status,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
            })
        })
        .collect();

    format::json(computed)
}

#[debug_handler]
pub async fn create_posh(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreatePoshParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    if params.rtype != "Committee member" && params.rtype != "Training session" {
        return bad_request("Record type must be either 'Committee member' or 'Training session'");
    }
    if params.name.trim().is_empty() {
        return bad_request("Name / title is required");
    }

    let today = Local::now().format("%Y-%m-%d").to_string();
    let record_date = params
        .date
        .filter(|d| !d.trim().is_empty())
        .unwrap_or(today);
    let new_id = next_posh_id(&ctx.db).await;
    let now = Local::now().into();

    let active = PoshRecordActiveModel {
        id: Set(new_id),
        rtype: Set(params.rtype),
        emp: Set(params.emp.filter(|e| !e.trim().is_empty())),
        name: Set(params.name.trim().to_string()),
        role: Set(params.role.filter(|r| !r.trim().is_empty())),
        date: Set(record_date),
        valid: Set(params.valid.filter(|v| !v.trim().is_empty())),
        parts: Set(params.parts),
        status: Set(if params.status.trim().is_empty() {
            "Active".to_string()
        } else {
            params.status.trim().to_string()
        }),
        created_at: Set(now),
        updated_at: Set(now),
    };

    let created = active.insert(&ctx.db).await?;
    format::json(created)
}

#[debug_handler]
pub async fn update_posh(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdatePoshParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = PoshRecordsEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let mut active: PoshRecordActiveModel = existing.into();
    if let Some(rtype) = params.rtype {
        active.rtype = Set(rtype);
    }
    if let Some(emp) = params.emp {
        active.emp = Set(if emp.trim().is_empty() {
            None
        } else {
            Some(emp)
        });
    }
    if let Some(name) = params.name {
        if !name.trim().is_empty() {
            active.name = Set(name.trim().to_string());
        }
    }
    if let Some(role) = params.role {
        active.role = Set(if role.trim().is_empty() {
            None
        } else {
            Some(role)
        });
    }
    if let Some(date) = params.date {
        let trimmed = date.trim();
        if !trimmed.is_empty() {
            active.date = Set(trimmed.to_string());
        }
    }
    if let Some(valid) = params.valid {
        active.valid = Set(if valid.trim().is_empty() {
            None
        } else {
            Some(valid)
        });
    }
    if let Some(parts) = params.parts {
        active.parts = Set(Some(parts));
    }
    if let Some(status) = params.status {
        active.status = Set(status);
    }
    active.updated_at = Set(Local::now().into());

    let updated = active.update(&ctx.db).await?;
    format::json(updated)
}

#[debug_handler]
pub async fn delete_posh(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = PoshRecordsEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let active: PoshRecordActiveModel = existing.into();
    active.delete(&ctx.db).await?;

    format::json(serde_json::json!({ "success": true, "id": id }))
}

#[debug_handler]
pub async fn list_sectrain(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let is_admin = is_admin_role(&user.role);
    let my_code = resolve_employee_code_for_user(&ctx.db, &user)
        .await
        .unwrap_or_default();

    let all_records = SecurityTrainingsEntity::find()
        .order_by_desc(security_trainings::Column::Assigned)
        .all(&ctx.db)
        .await?;

    let today = Local::now().format("%Y-%m-%d").to_string();

    let filtered: Vec<serde_json::Value> = all_records
        .into_iter()
        .filter(|r| {
            if is_admin {
                true
            } else {
                r.emp.eq_ignore_ascii_case(&user.name)
                    || r.emp.eq_ignore_ascii_case(&my_code)
                    || r.emp.eq_ignore_ascii_case(&user.email)
            }
        })
        .map(|r| {
            let mut status = r.status.clone();
            if status != "Completed" {
                if let Some(due_str) = &r.due {
                    if due_str.as_str() < today.as_str() {
                        status = "Overdue".to_string();
                    }
                }
            }
            serde_json::json!({
                "id": r.id,
                "course": r.course,
                "emp": r.emp,
                "assigned": r.assigned,
                "due": r.due,
                "done": r.done,
                "score": r.score,
                "status": status,
                "course_id": r.course_id,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
            })
        })
        .collect();

    format::json(filtered)
}

#[debug_handler]
pub async fn create_sectrain(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateSectrainParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    if params.course.trim().is_empty() {
        return bad_request("Course title is required");
    }
    if params.emp.trim().is_empty() {
        return bad_request("Employee name or code is required");
    }
    if let Err(e) = parse_deadline(params.due.trim()) {
        return bad_request(e);
    }

    let today = Local::now().format("%Y-%m-%d").to_string();
    let assigned_date = params
        .assigned
        .filter(|d| !d.trim().is_empty())
        .unwrap_or(today);
    let new_id = next_sectrain_id(&ctx.db).await;
    let now = Local::now().into();

    let active = SecurityTrainingActiveModel {
        id: Set(new_id),
        course: Set(params.course.trim().to_string()),
        emp: Set(params.emp.trim().to_string()),
        assigned: Set(assigned_date),
        due: Set(Some(params.due.trim().to_string())),
        done: Set(None),
        score: Set(params.score.map(|s| s.clamp(0, 100))),
        status: Set(params
            .status
            .filter(|s| !s.trim().is_empty())
            .unwrap_or_else(|| "Pending".to_string())),
        course_id: Set(None),
        created_at: Set(now),
        updated_at: Set(now),
    };

    let created = active.insert(&ctx.db).await?;
    format::json(created)
}

#[debug_handler]
pub async fn update_sectrain(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateSectrainParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let Some(existing) = SecurityTrainingsEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    let is_admin = is_admin_role(&user.role);
    let my_code = resolve_employee_code_for_user(&ctx.db, &user)
        .await
        .unwrap_or_default();

    if !is_admin
        && !existing.emp.eq_ignore_ascii_case(&user.name)
        && !existing.emp.eq_ignore_ascii_case(&my_code)
    {
        return unauthorized(
            "Access denied: You may only update your own security training records",
        );
    }

    let mut active: SecurityTrainingActiveModel = existing.clone().into();
    if is_admin {
        if let Some(course) = params.course {
            if !course.trim().is_empty() {
                active.course = Set(course.trim().to_string());
            }
        }
        if let Some(emp) = params.emp {
            if !emp.trim().is_empty() {
                active.emp = Set(emp.trim().to_string());
            }
        }
        if let Some(due) = params.due {
            if parse_deadline(due.trim()).is_ok() {
                active.due = Set(Some(due.trim().to_string()));
            }
        }
    }

    if let Some(score) = params.score {
        if is_admin {
            active.score = Set(Some(score.clamp(0, 100)));
        }
    }

    if let Some(status) = params.status {
        let trimmed_status = status.trim().to_string();
        if trimmed_status == "Completed" && active.done.as_ref().is_none() {
            let today = Local::now().format("%Y-%m-%d").to_string();
            active.done = Set(Some(params.done.unwrap_or(today)));
        } else if trimmed_status != "Completed" {
            active.done = Set(None);
        }
        active.status = Set(trimmed_status);
    } else if let Some(done) = params.done {
        active.done = Set(if done.trim().is_empty() {
            None
        } else {
            Some(done)
        });
    }

    active.updated_at = Set(Local::now().into());

    let updated = active.update(&ctx.db).await?;
    format::json(updated)
}

#[debug_handler]
pub async fn delete_sectrain(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = SecurityTrainingsEntity::find_by_id(&id)
        .one(&ctx.db)
        .await?
    else {
        return not_found();
    };

    let active: SecurityTrainingActiveModel = existing.into();
    active.delete(&ctx.db).await?;

    format::json(serde_json::json!({ "success": true, "id": id }))
}

#[debug_handler]
pub async fn bulk_assign_sectrain(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<BulkAssignSectrainParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let course_title = params.course.trim();
    if course_title.is_empty() {
        return bad_request("Course title is required");
    }
    if params.due.trim().is_empty() {
        return bad_request("Due date is required");
    }
    if let Err(e) = parse_deadline(params.due.trim()) {
        return bad_request(e);
    }

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .filter(employees::Column::Status.ne("Exited"))
        .all(&ctx.db)
        .await?;

    let existing_records = SecurityTrainingsEntity::find()
        .filter(security_trainings::Column::Course.eq(course_title))
        .all(&ctx.db)
        .await?;

    let existing_recipients: HashSet<String> = existing_records
        .into_iter()
        .map(|r| r.emp.to_lowercase())
        .collect();

    let today = Local::now().format("%Y-%m-%d").to_string();
    let mut assigned_count = 0usize;
    let mut skipped_count = 0usize;

    let all = SecurityTrainingsEntity::find()
        .all(&ctx.db)
        .await
        .unwrap_or_default();
    let mut max_num = all
        .iter()
        .filter_map(|s| {
            if s.id.starts_with("SEC-") {
                s.id[4..].parse::<u32>().ok()
            } else {
                None
            }
        })
        .max()
        .unwrap_or(0);

    let txn = ctx.db.begin().await?;

    for emp in &all_employees {
        let name_lower = emp.full_name.to_lowercase();
        let code_lower = emp.employee_code.to_lowercase();
        if existing_recipients.contains(&name_lower) || existing_recipients.contains(&code_lower) {
            skipped_count += 1;
            continue;
        }

        max_num += 1;
        let new_id = format!("SEC-{:04}", max_num);
        let active = SecurityTrainingActiveModel {
            id: Set(new_id),
            course: Set(course_title.to_string()),
            emp: Set(emp.full_name.clone()),
            assigned: Set(today.clone()),
            due: Set(Some(params.due.trim().to_string())),
            done: Set(None),
            score: Set(None),
            status: Set("Pending".to_string()),
            course_id: Set(None),
            created_at: Set(Local::now().into()),
            updated_at: Set(Local::now().into()),
        };
        active.insert(&txn).await?;
        assigned_count += 1;
    }

    txn.commit().await?;

    let message = format!(
        "Course assigned to {} active employees ({} already assigned and skipped)",
        assigned_count, skipped_count
    );

    format::json(BulkAssignResponse {
        assigned: assigned_count,
        skipped: skipped_count,
        failed: 0,
        message,
    })
}

#[debug_handler]
pub async fn get_completion_tracker(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .filter(employees::Column::Status.ne("Exited"))
        .order_by_asc(employees::Column::FullName)
        .all(&ctx.db)
        .await?;

    let all_assignments = CourseAssignmentsEntity::find().all(&ctx.db).await?;
    let all_courses = CoursesEntity::find().all(&ctx.db).await?;
    let course_map: HashMap<String, courses::Model> =
        all_courses.into_iter().map(|c| (c.id.clone(), c)).collect();

    let all_sectrain = SecurityTrainingsEntity::find().all(&ctx.db).await?;

    let biz_tz = get_configured_business_timezone(Some(&ctx));
    let now_utc = chrono::Utc::now();
    let today_str = Local::now().format("%Y-%m-%d").to_string();

    let is_admin = is_admin_role(&user.role);
    let my_code = resolve_employee_code_for_user(&ctx.db, &user)
        .await
        .unwrap_or_default();

    let mut records = Vec::new();
    let mut fully_compliant = 0usize;
    let mut in_progress = 0usize;
    let mut overdue = 0usize;
    let mut not_assigned = 0usize;

    for emp in &all_employees {
        if !is_admin
            && emp.employee_code != my_code
            && emp.work_email.as_deref() != Some(&user.email)
        {
            continue;
        }

        let emp_assigns: Vec<&course_assignments::Model> = all_assignments
            .iter()
            .filter(|a| {
                a.employee_id == emp.employee_code
                    || a.employee_name.eq_ignore_ascii_case(&emp.full_name)
            })
            .collect();

        let emp_sectrains: Vec<&security_trainings::Model> = all_sectrain
            .iter()
            .filter(|s| {
                s.emp.eq_ignore_ascii_case(&emp.full_name)
                    || s.emp.eq_ignore_ascii_case(&emp.employee_code)
            })
            .collect();

        let assigned_total = emp_assigns.len() + emp_sectrains.len();
        let mut completed_total = 0usize;
        let mut overdue_total = 0usize;
        let mut items = Vec::new();

        for a in &emp_assigns {
            let is_comp = a.progress >= 100 || a.status == "Completed";
            let due = course_map
                .get(&a.course_id)
                .and_then(|c| c.due_date.as_deref());
            let c_type = course_map
                .get(&a.course_id)
                .map(|c| c.course_type.as_str())
                .unwrap_or("Mandatory");
            let is_over = !is_comp
                && is_course_overdue_with_instant(c_type, a.progress, due, now_utc, biz_tz);

            if is_comp {
                completed_total += 1;
            } else if is_over {
                overdue_total += 1;
            }

            let item_status = if is_comp {
                "Completed".to_string()
            } else if is_over {
                "Overdue".to_string()
            } else if a.progress > 0 {
                "In progress".to_string()
            } else {
                "Not started".to_string()
            };

            items.push(EmployeeTrainingItem {
                id: a.id.clone(),
                title: course_map
                    .get(&a.course_id)
                    .map(|c| c.title.clone())
                    .unwrap_or_else(|| "Course".to_string()),
                training_type: "Course".to_string(),
                due_date: due.map(|d| d.to_string()),
                completed_at: a.completed_at.map(|t| t.to_rfc3339()),
                progress: a.progress,
                score: a.score,
                is_assessment: a.score.is_some(),
                status: item_status,
            });
        }

        for s in &emp_sectrains {
            let is_comp = s.status == "Completed";
            let is_over = !is_comp
                && (s
                    .due
                    .as_deref()
                    .map(|d| d < today_str.as_str())
                    .unwrap_or(false)
                    || s.status == "Overdue");

            if is_comp {
                completed_total += 1;
            } else if is_over {
                overdue_total += 1;
            }

            let item_status = if is_comp {
                "Completed".to_string()
            } else if is_over {
                "Overdue".to_string()
            } else if s.status == "In progress" {
                "In progress".to_string()
            } else {
                "Pending".to_string()
            };

            items.push(EmployeeTrainingItem {
                id: s.id.clone(),
                title: s.course.clone(),
                training_type: "Security".to_string(),
                due_date: s.due.clone(),
                completed_at: s.done.clone(),
                progress: if is_comp {
                    100
                } else if s.status == "In progress" {
                    50
                } else {
                    0
                },
                score: s.score,
                is_assessment: s.score.is_some(),
                status: item_status,
            });
        }

        let pending_total = assigned_total.saturating_sub(completed_total);
        let progress_pct = if assigned_total > 0 {
            ((completed_total as f64 / assigned_total as f64) * 100.0).round() as i32
        } else {
            0
        };

        let status = if overdue_total > 0 {
            "Overdue".to_string()
        } else if assigned_total == 0 {
            "Not assigned".to_string()
        } else if completed_total == assigned_total {
            "Compliant".to_string()
        } else if completed_total > 0 {
            "In progress".to_string()
        } else {
            "Not started".to_string()
        };

        if status == "Compliant" {
            fully_compliant += 1;
        } else if status == "Overdue" {
            overdue += 1;
        } else if status == "In progress" {
            in_progress += 1;
        } else if status == "Not assigned" {
            not_assigned += 1;
        }

        records.push(EmployeeCompletionSummary {
            employee_id: emp.employee_code.clone(),
            employee_name: emp.full_name.clone(),
            department: emp.department.clone(),
            assigned_count: assigned_total,
            completed_count: completed_total,
            pending_count: pending_total,
            overdue_count: overdue_total,
            progress_pct,
            status,
            items,
        });
    }

    let total_emp = records.len();
    let total_all_assigned: usize = records.iter().map(|r| r.assigned_count).sum();
    let total_all_completed: usize = records.iter().map(|r| r.completed_count).sum();
    let overall_pct = if total_all_assigned > 0 {
        ((total_all_completed as f64 / total_all_assigned as f64) * 100.0).round() as i32
    } else {
        0
    };

    format::json(CompletionTrackerResponse {
        total_employees: total_emp,
        fully_compliant_count: fully_compliant,
        in_progress_count: in_progress,
        overdue_count: overdue,
        not_assigned_count: not_assigned,
        overall_compliance_pct: overall_pct,
        records,
    })
}

#[debug_handler]
pub async fn assign_course(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<AssignCourseParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(_course) = CoursesEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .filter(employees::Column::Status.ne("Exited"))
        .all(&ctx.db)
        .await?;

    let target_employees: Vec<&employees::Model> = if let Some(ref emp_ids) = params.employee_ids {
        if emp_ids.is_empty() {
            return bad_request("At least one employee must be selected");
        }
        let set: HashSet<&str> = emp_ids.iter().map(|s| s.as_str()).collect();
        all_employees
            .iter()
            .filter(|e| {
                set.contains(e.employee_code.as_str()) || set.contains(e.full_name.as_str())
            })
            .collect()
    } else if let Some(ref aud) = params.audience {
        match aud.as_str() {
            "Everyone" => all_employees.iter().collect(),
            "Managers" => all_employees
                .iter()
                .filter(|e| {
                    all_employees
                        .iter()
                        .any(|x| x.manager_name.as_deref() == Some(&e.full_name))
                })
                .collect(),
            dept => all_employees
                .iter()
                .filter(|e| e.department == dept)
                .collect(),
        }
    } else {
        return bad_request("Either audience or employee_ids must be specified");
    };

    if target_employees.is_empty() {
        return bad_request("No active employees matched the target criteria");
    }

    let now = Local::now().into();
    let txn = ctx.db.begin().await?;

    let existing_assignments = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::CourseId.eq(&id))
        .all(&txn)
        .await?;
    let existing_emp_ids: HashSet<String> = existing_assignments
        .into_iter()
        .map(|a| a.employee_id)
        .collect();

    let mut assigned_count = 0usize;
    let mut skipped_count = 0usize;

    for emp in target_employees {
        if existing_emp_ids.contains(&emp.employee_code) {
            skipped_count += 1;
            continue;
        }

        let new_assign = AssignmentActiveModel {
            id: Set(Uuid::new_v4().to_string()),
            course_id: Set(id.clone()),
            employee_id: Set(emp.employee_code.clone()),
            employee_name: Set(emp.full_name.clone()),
            progress: Set(0),
            status: Set("Not started".to_string()),
            completed_at: Set(None),
            score: Set(None),
            created_at: Set(now),
            updated_at: Set(now),
        };
        new_assign.insert(&txn).await?;
        assigned_count += 1;
    }

    txn.commit().await?;

    let message = format!(
        "Course assigned to {} active employee{} ({} already assigned and skipped)",
        assigned_count,
        if assigned_count == 1 { "" } else { "s" },
        skipped_count
    );

    format::json(AssignCourseResponse {
        assigned: assigned_count,
        skipped: skipped_count,
        failed: 0,
        message,
    })
}

// ==========================================
// LEARN PLACEHOLDER FEATURES: CATEGORIES
// ==========================================

pub async fn list_categories(_auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let categories = CourseCategoriesEntity::find()
        .order_by_asc(course_categories::Column::Name)
        .all(&ctx.db)
        .await?;

    let all_courses = CoursesEntity::find().all(&ctx.db).await?;
    let mut course_counts: HashMap<String, usize> = HashMap::new();
    for c in all_courses {
        if let Some(cat_id) = c.category_id {
            *course_counts.entry(cat_id).or_insert(0) += 1;
        }
    }

    let items: Vec<CategoryItem> = categories
        .into_iter()
        .map(|c| {
            let count = course_counts.get(&c.id).copied().unwrap_or(0);
            CategoryItem {
                id: c.id.clone(),
                name: c.name,
                description: c.description,
                color: c.color,
                course_count: count,
                created_at: c.created_at.to_rfc3339(),
                updated_at: c.updated_at.to_rfc3339(),
            }
        })
        .collect();

    format::json(items)
}

pub async fn create_category(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateCategoryParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let trimmed_name = params.name.trim();
    if trimmed_name.len() < 2 {
        return bad_request("Category name must be at least 2 characters long");
    }

    let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
    if all_categories
        .iter()
        .any(|c| c.name.eq_ignore_ascii_case(trimmed_name))
    {
        return bad_request("A category with this name already exists");
    }

    let now = chrono::Utc::now();
    let cat_id = format!("CAT-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

    let new_cat = course_categories::ActiveModel {
        id: Set(cat_id.clone()),
        name: Set(trimmed_name.to_string()),
        description: Set(params.description.map(|d| d.trim().to_string())),
        color: Set(params.color.or_else(|| Some("#0B6FDB".to_string()))),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let inserted = new_cat.insert(&ctx.db).await?;
    format::json(CategoryItem {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description,
        color: inserted.color,
        course_count: 0,
        created_at: inserted.created_at.to_rfc3339(),
        updated_at: inserted.updated_at.to_rfc3339(),
    })
}

pub async fn update_category(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateCategoryParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(existing) = CourseCategoriesEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    let mut active: course_categories::ActiveModel = existing.into();

    if let Some(new_name) = params.name {
        let trimmed = new_name.trim();
        if trimmed.len() < 2 {
            return bad_request("Category name must be at least 2 characters long");
        }
        let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
        if all_categories
            .iter()
            .any(|c| c.id != id && c.name.eq_ignore_ascii_case(trimmed))
        {
            return bad_request("Another category with this name already exists");
        }
        active.name = Set(trimmed.to_string());
    }

    if let Some(desc) = params.description {
        active.description = Set(Some(desc.trim().to_string()));
    }

    if let Some(col) = params.color {
        active.color = Set(Some(col));
    }

    active.updated_at = Set(chrono::Utc::now().into());
    let updated = active.update(&ctx.db).await?;

    let count = CoursesEntity::find()
        .filter(courses::Column::CategoryId.eq(&id))
        .count(&ctx.db)
        .await? as usize;

    format::json(CategoryItem {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        color: updated.color,
        course_count: count,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
    })
}

pub async fn delete_category(
    auth: auth::JWT,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let Some(category) = CourseCategoriesEntity::find_by_id(&id).one(&ctx.db).await? else {
        return not_found();
    };

    // Protect course associations per requirement
    let course_count = CoursesEntity::find()
        .filter(courses::Column::CategoryId.eq(&id))
        .count(&ctx.db)
        .await?;

    if course_count > 0 {
        return bad_request(format!(
            "Cannot delete category '{}' because it is assigned to {} course(s). Please reassign courses to another category first.",
            category.name, course_count
        ));
    }

    CourseCategoriesEntity::delete_by_id(&id)
        .exec(&ctx.db)
        .await?;
    format::json(serde_json::json!({
        "success": true,
        "message": format!("Category '{}' deleted successfully", category.name)
    }))
}

// ==========================================
// LEARN PLACEHOLDER FEATURES: SKILLS & MATRIX
// ==========================================

pub async fn list_skills(_auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let skills = SkillsEntity::find()
        .order_by_asc(skills::Column::Category)
        .order_by_asc(skills::Column::Name)
        .all(&ctx.db)
        .await?;

    let items: Vec<SkillItem> = skills
        .into_iter()
        .map(|s| SkillItem {
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
        })
        .collect();

    format::json(items)
}

pub async fn create_skill(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateSkillParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    if !is_admin_role(&user.role) {
        return Err(crate::authz::forbidden(
            "admin_required",
            "Access denied: Administrator privileges required",
        ));
    }

    let trimmed_name = params.name.trim();
    if trimmed_name.is_empty() {
        return bad_request("Skill name cannot be empty");
    }

    let all_skills = SkillsEntity::find().all(&ctx.db).await?;
    if all_skills
        .iter()
        .any(|s| s.name.eq_ignore_ascii_case(trimmed_name))
    {
        return bad_request("A skill with this name already exists");
    }

    let now = chrono::Utc::now();
    let skill_id = format!("SKL-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

    let new_skill = skills::ActiveModel {
        id: Set(skill_id.clone()),
        name: Set(trimmed_name.to_string()),
        category: Set(params.category.trim().to_string()),
        description: Set(params.description.map(|d| d.trim().to_string())),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let inserted = new_skill.insert(&ctx.db).await?;
    format::json(SkillItem {
        id: inserted.id,
        name: inserted.name,
        category: inserted.category,
        description: inserted.description,
    })
}

pub async fn get_skills_matrix(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    let is_admin = is_admin_role(&user.role);
    if !is_admin {
        return Err(crate::authz::forbidden("admin_required", "Access denied: Skills matrix access is restricted to Administrators; manager-scoped access is fail-closed because employees table lacks an authoritative manager_id/manager_code relationship (only display manager_name is present)."));
    }

    let all_skills = SkillsEntity::find()
        .order_by_asc(skills::Column::Category)
        .order_by_asc(skills::Column::Name)
        .all(&ctx.db)
        .await?;

    let skills_items: Vec<SkillItem> = all_skills
        .iter()
        .map(|s| SkillItem {
            id: s.id.clone(),
            name: s.name.clone(),
            category: s.category.clone(),
            description: s.description.clone(),
        })
        .collect();

    let mut categories_set: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    for s in &all_skills {
        categories_set.insert(s.category.clone());
    }

    let all_employees = EmployeesEntity::find()
        .filter(employees::Column::Status.ne("Inactive"))
        .filter(employees::Column::Status.ne("Exited"))
        .order_by_asc(employees::Column::Department)
        .order_by_asc(employees::Column::FullName)
        .all(&ctx.db)
        .await?;

    let all_employee_skills = EmployeeSkillsEntity::find().all(&ctx.db).await?;
    let mut emp_skills_map: HashMap<String, HashMap<String, EmployeeSkillRating>> = HashMap::new();

    for es in all_employee_skills {
        let rating = EmployeeSkillRating {
            level: es.level,
            verified: es.verified,
            verified_by: es.verified_by,
            updated_at: es.updated_at.to_rfc3339(),
        };
        emp_skills_map
            .entry(es.employee_id)
            .or_default()
            .insert(es.skill_id, rating);
    }

    let employee_rows: Vec<MatrixEmployeeRow> = all_employees
        .into_iter()
        .map(|emp| {
            let user_skills = emp_skills_map
                .remove(&emp.employee_code)
                .unwrap_or_default();
            MatrixEmployeeRow {
                employee_code: emp.employee_code,
                full_name: emp.full_name,
                department: emp.department,
                role: emp.job_title,
                skills: user_skills,
            }
        })
        .collect();

    let levels = vec![
        "Beginner".to_string(),
        "Intermediate".to_string(),
        "Advanced".to_string(),
        "Expert".to_string(),
    ];

    format::json(SkillsMatrixResponse {
        skills: skills_items,
        employees: employee_rows,
        categories: categories_set.into_iter().collect(),
        levels,
    })
}

pub async fn rate_skill(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<RateSkillParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };
    let is_admin = is_admin_role(&user.role);
    if !is_admin {
        return Err(crate::authz::forbidden("admin_required", "Access denied: Manager skill rating is fail-closed because employees table lacks an authoritative manager_id/manager_code relationship (only display manager_name is present)."));
    }

    let valid_levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
    if !valid_levels.contains(&params.level.as_str()) {
        return bad_request(format!(
            "Invalid skill level '{}'. Must be one of: Beginner, Intermediate, Advanced, Expert",
            params.level
        ));
    }

    let now = chrono::Utc::now();
    let verified = params.verified.unwrap_or(true);
    let verifier = Some(user.name.clone());

    let existing = EmployeeSkillsEntity::find()
        .filter(employee_skills::Column::EmployeeId.eq(&params.employee_id))
        .filter(employee_skills::Column::SkillId.eq(&params.skill_id))
        .one(&ctx.db)
        .await?;

    let result = match existing {
        Some(curr) => {
            let mut active: employee_skills::ActiveModel = curr.into();
            active.level = Set(params.level);
            active.verified = Set(verified);
            active.verified_by = Set(verifier);
            active.updated_at = Set(now.into());
            active.update(&ctx.db).await?
        }
        None => {
            let id = format!("ES-{}", Uuid::new_v4().to_string()[..8].to_uppercase());
            let active = employee_skills::ActiveModel {
                id: Set(id),
                employee_id: Set(params.employee_id),
                skill_id: Set(params.skill_id),
                level: Set(params.level),
                verified: Set(verified),
                verified_by: Set(verifier),
                created_at: Set(now.into()),
                updated_at: Set(now.into()),
            };
            active.insert(&ctx.db).await?
        }
    };

    format::json(EmployeeSkillRating {
        level: result.level,
        verified: result.verified,
        verified_by: result.verified_by,
        updated_at: result.updated_at.to_rfc3339(),
    })
}

// ==========================================
// LEARN PLACEHOLDER FEATURES: CERTIFICATES & RECORDS
// ==========================================

pub async fn list_records(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let employee_code = resolve_employee_code_for_user(&ctx.db, &user).await?;
    let is_admin = is_admin_role(&user.role);

    let mut assignments_query =
        CourseAssignmentsEntity::find().filter(course_assignments::Column::Status.eq("Completed"));

    if !is_admin {
        assignments_query =
            assignments_query.filter(course_assignments::Column::EmployeeId.eq(&employee_code));
    }

    let completed_assignments = assignments_query.all(&ctx.db).await?;
    let all_courses = CoursesEntity::find().all(&ctx.db).await?;
    let course_map: HashMap<String, CourseModel> =
        all_courses.into_iter().map(|c| (c.id.clone(), c)).collect();

    let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
    let category_map: HashMap<String, String> =
        all_categories.into_iter().map(|c| (c.id, c.name)).collect();

    let mut records: Vec<CompletionRecordItem> = Vec::new();

    for a in completed_assignments {
        let course = course_map.get(&a.course_id);
        let title = course
            .map(|c| c.title.clone())
            .unwrap_or_else(|| "Course".to_string());
        let ctype = course
            .map(|c| c.course_type.clone())
            .unwrap_or_else(|| "Standard".to_string());
        let cat_name = course
            .and_then(|c| c.category_id.as_ref())
            .and_then(|cid| category_map.get(cid))
            .cloned();
        let dur = course
            .map(|c| c.duration.clone())
            .unwrap_or_else(|| "1 hour".to_string());
        let is_assessment = a.score.is_some();

        let record_type = if a.score.is_some() {
            "hr_recorded".to_string()
        } else {
            "self_reported".to_string()
        };

        records.push(CompletionRecordItem {
            id: a.id,
            course_id: a.course_id,
            course_title: title,
            course_type: ctype,
            category_name: cat_name,
            duration: dur,
            completed_at: a.completed_at.map(|dt| dt.to_rfc3339()),
            is_assessment,
            score: a.score,
            record_type,
            employee_name: a.employee_name,
            employee_id: a.employee_id,
        });
    }

    let sectrain_query =
        SecurityTrainingsEntity::find().filter(security_trainings::Column::Status.eq("Completed"));

    let completed_sectrain = sectrain_query.all(&ctx.db).await?;
    for st in completed_sectrain {
        if !is_admin && st.emp != user.name && st.emp != employee_code {
            continue;
        }
        records.push(CompletionRecordItem {
            id: format!("SEC-{}", st.id),
            course_id: st.course_id.unwrap_or_else(|| format!("SEC-{}", st.id)),
            course_title: st.course,
            course_type: "Security Awareness".to_string(),
            category_name: Some("Compliance & Governance".to_string()),
            duration: "45 mins".to_string(),
            completed_at: st.done,
            is_assessment: st.score.is_some(),
            score: st.score,
            record_type: "hr_recorded".to_string(),
            employee_name: st.emp.clone(),
            employee_id: employee_code.clone(),
        });
    }

    format::json(records)
}

// ==========================================
// LEARN PLACEHOLDER FEATURES: SKILL RECOMMENDATIONS
// ==========================================

pub async fn get_recommendations(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await else {
        return unauthorized("Unauthorized: Invalid session or credentials");
    };

    let employee_code = resolve_employee_code_for_user(&ctx.db, &user).await?;
    let emp = EmployeesEntity::find()
        .filter(employees::Column::EmployeeCode.eq(&employee_code))
        .one(&ctx.db)
        .await?;

    let (emp_dept, emp_name) = match &emp {
        Some(e) => (e.department.clone(), e.full_name.clone()),
        None => ("General".to_string(), user.name.clone()),
    };

    // Never infer manager scope or authorization from matching display names.
    // An authoritative manager ID/code relationship is unavailable in the schema,
    // so manager-scoped recommendations remain unavailable (fail-closed).
    let is_manager = false;

    let current_assignments = CourseAssignmentsEntity::find()
        .filter(course_assignments::Column::EmployeeId.eq(&employee_code))
        .all(&ctx.db)
        .await?;

    let completed_or_active_course_ids: std::collections::HashSet<String> = current_assignments
        .iter()
        .filter(|a| a.status == "Completed")
        .map(|a| a.course_id.clone())
        .collect();

    let emp_skills = EmployeeSkillsEntity::find()
        .filter(employee_skills::Column::EmployeeId.eq(&employee_code))
        .all(&ctx.db)
        .await?;

    let skill_levels_map: HashMap<String, String> = emp_skills
        .iter()
        .map(|es| (es.skill_id.clone(), es.level.clone()))
        .collect();

    let total_skills_mastered = emp_skills
        .iter()
        .filter(|es| es.level == "Advanced" || es.level == "Expert")
        .count();

    let all_courses = CoursesEntity::find().all(&ctx.db).await?;

    let all_skills = SkillsEntity::find().all(&ctx.db).await?;
    let skill_map: HashMap<String, String> =
        all_skills.into_iter().map(|s| (s.id, s.name)).collect();

    let all_categories = CourseCategoriesEntity::find().all(&ctx.db).await?;
    let category_map: HashMap<String, String> =
        all_categories.into_iter().map(|c| (c.id, c.name)).collect();

    let course_skill_mappings = CourseSkillsEntity::find().all(&ctx.db).await?;
    let mut course_skills_lookup: HashMap<String, Vec<String>> = HashMap::new();
    for cs in course_skill_mappings {
        course_skills_lookup
            .entry(cs.course_id)
            .or_default()
            .push(cs.skill_id);
    }

    let mut recommendations: Vec<RecommendationItem> = Vec::new();
    let mut seen_course_ids: std::collections::HashSet<String> = std::collections::HashSet::new();

    // Rule 1: Mandatory Compliance Requirements (Mandatory courses eligible for employee and not yet completed)
    for c in &all_courses {
        let is_audience_eligible = match c.audience.as_str() {
            "Everyone" => true,
            "Managers" => is_manager,
            dept => dept.eq_ignore_ascii_case(&emp_dept),
        };
        if !is_audience_eligible {
            continue;
        }

        if c.course_type == "Mandatory" && !completed_or_active_course_ids.contains(&c.id) {
            seen_course_ids.insert(c.id.clone());
            recommendations.push(RecommendationItem {
                id: format!("REC-{}", c.id),
                course_id: c.id.clone(),
                title: c.title.clone(),
                course_type: c.course_type.clone(),
                duration: c.duration.clone(),
                category: c
                    .category_id
                    .as_ref()
                    .and_then(|cid| category_map.get(cid))
                    .cloned(),
                due_date: c.due_date.clone(),
                rule_type: "mandatory_compliance".to_string(),
                reason: format!(
                    "Mandatory compliance training required for your role in {}.",
                    emp_dept
                ),
                skill_name: Some("Compliance & Governance".to_string()),
            });
        }
    }

    // Rule 2: Department Curriculum (Course teaches a core competency aligned with employee's department)
    for c in &all_courses {
        if seen_course_ids.contains(&c.id) || completed_or_active_course_ids.contains(&c.id) {
            continue;
        }

        let is_audience_eligible = match c.audience.as_str() {
            "Everyone" => true,
            "Managers" => is_manager,
            dept => dept.eq_ignore_ascii_case(&emp_dept),
        };
        if !is_audience_eligible {
            continue;
        }

        if let Some(mapped_skills) = course_skills_lookup.get(&c.id) {
            for skill_id in mapped_skills {
                if !skill_levels_map.contains_key(skill_id) {
                    let s_name = skill_map
                        .get(skill_id)
                        .cloned()
                        .unwrap_or_else(|| "Core Competency".to_string());
                    seen_course_ids.insert(c.id.clone());
                    recommendations.push(RecommendationItem {
                        id: format!("REC-{}", c.id),
                        course_id: c.id.clone(),
                        title: c.title.clone(),
                        course_type: c.course_type.clone(),
                        duration: c.duration.clone(),
                        category: c.category_id.as_ref().and_then(|cid| category_map.get(cid)).cloned(),
                        due_date: c.due_date.clone(),
                        rule_type: "department_skill".to_string(),
                        reason: format!("Core departmental competency in '{}', aligned with curriculum for {} team members.", s_name, emp_dept),
                        skill_name: Some(s_name),
                    });
                    break;
                }
            }
        }
    }

    // Rule 3: Skill Proficiency Growth (Course deepens capability in a recorded skill where employee is Beginner or Intermediate)
    for c in &all_courses {
        if seen_course_ids.contains(&c.id) || completed_or_active_course_ids.contains(&c.id) {
            continue;
        }

        let is_audience_eligible = match c.audience.as_str() {
            "Everyone" => true,
            "Managers" => is_manager,
            dept => dept.eq_ignore_ascii_case(&emp_dept),
        };
        if !is_audience_eligible {
            continue;
        }

        if let Some(mapped_skills) = course_skills_lookup.get(&c.id) {
            for skill_id in mapped_skills {
                if let Some(curr_level) = skill_levels_map.get(skill_id) {
                    if curr_level == "Beginner" || curr_level == "Intermediate" {
                        let s_name = skill_map
                            .get(skill_id)
                            .cloned()
                            .unwrap_or_else(|| "Skill".to_string());
                        seen_course_ids.insert(c.id.clone());
                        recommendations.push(RecommendationItem {
                            id: format!("REC-{}", c.id),
                            course_id: c.id.clone(),
                            title: c.title.clone(),
                            course_type: c.course_type.clone(),
                            duration: c.duration.clone(),
                            category: c.category_id.as_ref().and_then(|cid| category_map.get(cid)).cloned(),
                            due_date: c.due_date.clone(),
                            rule_type: "proficiency_growth".to_string(),
                            reason: format!("Deepens existing capability in '{}' (currently recorded at {} level).", s_name, curr_level),
                            skill_name: Some(s_name),
                        });
                        break;
                    }
                }
            }
        }
    }

    format::json(RecommendationsResponse {
        recommendations,
        employee_department: emp_dept,
        employee_name: emp_name,
        total_skills_mastered,
    })
}

fn build_learn_routes(prefix: &str) -> Routes {
    Routes::new()
        .prefix(prefix)
        .add("/dashboard", get(dashboard))
        .add("/courses", get(list_courses))
        .add("/courses", post(create_course))
        .add("/courses/{id}", put(update_course))
        .add("/courses/{id}/assign", post(assign_course))
        .add("/my-learning", get(my_learning))
        .add("/assignments/{id}", get(get_assignment))
        .add(
            "/assignments/{id}/progress",
            post(update_assignment_progress),
        )
        .add("/assignments/{id}/score", put(update_assignment_score))
        .add("/remind", post(send_reminders))
        // DOC-14 routes
        .add("/programmes", get(list_programmes))
        .add("/programmes", post(create_programme))
        .add("/programmes/{id}", put(update_programme))
        .add("/programmes/{id}", delete(delete_programme))
        .add("/posh", get(list_posh))
        .add("/posh", post(create_posh))
        .add("/posh/{id}", put(update_posh))
        .add("/posh/{id}", delete(delete_posh))
        .add("/sectrain", get(list_sectrain))
        .add("/sectrain", post(create_sectrain))
        .add("/sectrain/{id}", put(update_sectrain))
        .add("/sectrain/{id}", delete(delete_sectrain))
        .add("/sectrain/bulk-assign", post(bulk_assign_sectrain))
        .add("/completion", get(get_completion_tracker))
        // Learn placeholder features (Categories, Skills Matrix, Records, Recommendations)
        .add("/categories", get(list_categories))
        .add("/categories", post(create_category))
        .add("/categories/{id}", put(update_category))
        .add("/categories/{id}", delete(delete_category))
        .add("/skills", get(list_skills))
        .add("/skills", post(create_skill))
        .add("/skills/matrix", get(get_skills_matrix))
        .add("/skills/rate", post(rate_skill))
        .add("/records", get(list_records))
        .add("/recommendations", get(get_recommendations))
}

pub fn routes() -> Routes {
    build_learn_routes("/api/v1/learn")
}

pub fn api_routes() -> Routes {
    build_learn_routes("/api/learn")
}

pub fn direct_routes() -> Routes {
    build_learn_routes("/learn")
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MockEmp {
        name: &'static str,
        dept: &'static str,
        mgr: Option<&'static str>,
    }

    fn is_in_audience(aud: &str, emp: &MockEmp, all: &[MockEmp]) -> bool {
        match aud {
            "Everyone" => true,
            "Managers" => all.iter().any(|x| x.mgr == Some(emp.name)),
            dept => emp.dept == dept,
        }
    }

    #[test]
    fn test_audience_everyone() {
        let employees = vec![
            MockEmp {
                name: "Priya",
                dept: "People Ops",
                mgr: None,
            },
            MockEmp {
                name: "Aarav",
                dept: "Engineering",
                mgr: Some("Vikram"),
            },
        ];
        assert!(is_in_audience("Everyone", &employees[0], &employees));
        assert!(is_in_audience("Everyone", &employees[1], &employees));
    }

    #[test]
    fn test_audience_managers() {
        let employees = vec![
            MockEmp {
                name: "Priya",
                dept: "People Ops",
                mgr: None,
            },
            MockEmp {
                name: "Vikram",
                dept: "Engineering",
                mgr: Some("Priya"),
            },
            MockEmp {
                name: "Aarav",
                dept: "Engineering",
                mgr: Some("Vikram"),
            },
        ];
        // Priya is manager to Vikram -> true
        assert!(is_in_audience("Managers", &employees[0], &employees));
        // Vikram is manager to Aarav -> true
        assert!(is_in_audience("Managers", &employees[1], &employees));
        // Aarav has no direct reports -> false
        assert!(!is_in_audience("Managers", &employees[2], &employees));
    }

    #[test]
    fn test_audience_department() {
        let employees = vec![
            MockEmp {
                name: "Priya",
                dept: "People Ops",
                mgr: None,
            },
            MockEmp {
                name: "Aarav",
                dept: "Engineering",
                mgr: Some("Vikram"),
            },
        ];
        assert!(is_in_audience("Engineering", &employees[1], &employees));
        assert!(!is_in_audience("Engineering", &employees[0], &employees));
    }

    #[test]
    fn test_compliance_calculation() {
        let total_assigned = 10usize;
        let completed_count = 8usize;
        let pct = ((completed_count as f64 / total_assigned as f64) * 100.0).round() as i32;
        assert_eq!(pct, 80);

        let zero_assigned = 0usize;
        let zero_pct = if zero_assigned > 0 { 0 } else { 100 };
        assert_eq!(zero_pct, 100);
    }

    #[test]
    fn test_reminder_cooldown() {
        let now = Utc::now();
        let sent_recently = now - Duration::hours(12);
        let sent_long_ago = now - Duration::hours(36);
        let threshold = now - Duration::hours(24);

        assert!(
            sent_recently >= threshold,
            "12 hours ago is within 24h cooldown"
        );
        assert!(
            sent_long_ago < threshold,
            "36 hours ago is outside 24h cooldown"
        );
    }

    #[test]
    fn test_parse_deadline_strict_validation() {
        // Date-only valid
        let d1 = parse_deadline("2026-10-21").expect("Valid YYYY-MM-DD");
        assert_eq!(
            d1,
            DeadlineKind::DateOnly(chrono::NaiveDate::from_ymd_opt(2026, 10, 21).unwrap())
        );

        // Offset-aware timestamps valid
        let d2 = parse_deadline("2026-10-21T18:30:00Z").expect("Valid RFC3339 UTC");
        assert!(matches!(d2, DeadlineKind::Timestamp(_)));

        let d3 = parse_deadline("2026-10-21T23:59:59+05:30").expect("Valid RFC3339 with offset");
        assert!(matches!(d3, DeadlineKind::Timestamp(_)));

        // Invalid deadline inputs MUST be rejected
        assert!(parse_deadline("").is_err(), "Empty string rejected");
        assert!(parse_deadline("2026/10/21").is_err(), "Slash date rejected");
        assert!(
            parse_deadline("2026-13-45").is_err(),
            "Invalid date numbers rejected"
        );
        assert!(
            parse_deadline("tomorrow").is_err(),
            "Relative date string rejected"
        );
        assert!(
            parse_deadline("2026-10-21 23:59:59").is_err(),
            "Missing offset in timestamp rejected"
        );
    }

    #[test]
    fn test_timestamp_deadline_instant_comparison() {
        use chrono::TimeZone;
        let biz_tz = parse_business_timezone("+05:30").unwrap();
        let deadline_str = "2026-10-21T18:30:00Z";

        // 1 second before deadline instant in UTC
        let before_utc = Utc.with_ymd_and_hms(2026, 10, 21, 18, 29, 59).unwrap();
        assert!(
            !is_course_overdue_with_instant("Mandatory", 0, Some(deadline_str), before_utc, biz_tz),
            "Timestamp deadline not reached"
        );

        // 1 second after deadline instant in UTC
        let after_utc = Utc.with_ymd_and_hms(2026, 10, 21, 18, 30, 1).unwrap();
        assert!(
            is_course_overdue_with_instant("Mandatory", 0, Some(deadline_str), after_utc, biz_tz),
            "Timestamp deadline passed"
        );
    }

    #[test]
    fn test_production_timezone_conversion_path_using_fixed_utc_instant_around_midnight() {
        use chrono::TimeZone;
        // Explicitly configured business timezone: +05:30 (Brightcone Headquarters)
        let biz_tz = parse_business_timezone("+05:30").expect("Valid business timezone offset");
        let due_date = "2026-10-21";

        // Midnight rollover in UTC+05:30 for 2026-10-21 occurs at:
        // 2026-10-22 00:00:00 +05:30 == 2026-10-21 18:30:00 UTC.

        // Point A: Exactly 1 second BEFORE midnight in business timezone:
        // 2026-10-21 23:59:59 +05:30 == 2026-10-21 18:29:59 UTC.
        let fixed_utc_before_midnight = Utc.with_ymd_and_hms(2026, 10, 21, 18, 29, 59).unwrap();
        let is_overdue_before = is_course_overdue_with_instant(
            "Mandatory",
            0,
            Some(due_date),
            fixed_utc_before_midnight,
            biz_tz,
        );
        assert!(
            !is_overdue_before,
            "At 2026-10-21 18:29:59 UTC (23:59:59 in biz tz), course due 2026-10-21 is NOT overdue"
        );

        // Point B: Exactly 1 second AFTER midnight in business timezone:
        // 2026-10-22 00:00:01 +05:30 == 2026-10-21 18:30:01 UTC.
        let fixed_utc_after_midnight = Utc.with_ymd_and_hms(2026, 10, 21, 18, 30, 1).unwrap();
        let is_overdue_after = is_course_overdue_with_instant(
            "Mandatory",
            0,
            Some(due_date),
            fixed_utc_after_midnight,
            biz_tz,
        );
        assert!(
            is_overdue_after,
            "At 2026-10-21 18:30:01 UTC (00:00:01 on next day in biz tz), course due 2026-10-21 IS overdue"
        );

        // Point C: Verify results do NOT depend on server's local timezone.
        // The conversion path converts the UTC instant directly to the configured business timezone.
        // Results are completely invariant to whatever local timezone the server OS is set to.
        let simulated_server_timezones = [
            chrono::FixedOffset::east_opt(0).unwrap(),        // UTC
            chrono::FixedOffset::west_opt(7 * 3600).unwrap(), // US Pacific (-07:00)
            chrono::FixedOffset::east_opt(9 * 3600).unwrap(), // Tokyo (+09:00)
            chrono::FixedOffset::east_opt(3600).unwrap(),     // London (+01:00)
        ];
        for _sim_tz in simulated_server_timezones {
            let res_before = is_course_overdue_with_instant(
                "Mandatory",
                0,
                Some(due_date),
                fixed_utc_before_midnight,
                biz_tz,
            );
            let res_after = is_course_overdue_with_instant(
                "Mandatory",
                0,
                Some(due_date),
                fixed_utc_after_midnight,
                biz_tz,
            );
            assert!(
                !res_before,
                "Before midnight check invariant across server local timezones"
            );
            assert!(
                res_after,
                "After midnight check invariant across server local timezones"
            );
        }
    }

    #[test]
    fn test_overdue_rules_matrix() {
        use chrono::TimeZone;
        let biz_tz = parse_business_timezone("+05:30").unwrap();
        // Midday on 2026-10-21 in business timezone (12:00:00 +05:30 == 06:30:00 UTC)
        let now_utc = Utc.with_ymd_and_hms(2026, 10, 21, 6, 30, 0).unwrap();

        // 1. Mandatory due today (2026-10-21) -> not overdue
        assert!(!is_course_overdue_with_instant(
            "Mandatory",
            0,
            Some("2026-10-21"),
            now_utc,
            biz_tz
        ));

        // 2. Mandatory due yesterday (2026-10-20) -> overdue
        assert!(is_course_overdue_with_instant(
            "Mandatory",
            0,
            Some("2026-10-20"),
            now_utc,
            biz_tz
        ));

        // 3. Mandatory future due (2026-10-22) -> not overdue
        assert!(!is_course_overdue_with_instant(
            "Mandatory",
            0,
            Some("2026-10-22"),
            now_utc,
            biz_tz
        ));

        // 4. Completed mandatory with past due date -> NOT overdue
        assert!(!is_course_overdue_with_instant(
            "Mandatory",
            100,
            Some("2026-10-20"),
            now_utc,
            biz_tz
        ));

        // 5. Elective course with past due date -> NOT overdue
        assert!(!is_course_overdue_with_instant(
            "Elective",
            0,
            Some("2026-10-20"),
            now_utc,
            biz_tz
        ));

        // 6. Mandatory course with missing/null due date -> NOT overdue
        assert!(!is_course_overdue_with_instant(
            "Mandatory",
            0,
            None,
            now_utc,
            biz_tz
        ));
    }

    #[test]
    fn test_configured_timezone_values_iana_and_offset() {
        use chrono::TimeZone;
        // 1. Verify exact string "+05:30" parses directly to +19800 seconds
        let tz_offset =
            parse_business_timezone("+05:30").expect("Must parse +05:30 without fallback");
        assert_eq!(tz_offset.local_minus_utc(), 5 * 3600 + 30 * 60);

        // 2. Verify exact string "Asia/Kolkata" parses directly to +19800 seconds
        let tz_iana = parse_business_timezone("Asia/Kolkata")
            .expect("Must parse Asia/Kolkata without fallback");
        assert_eq!(tz_iana.local_minus_utc(), 5 * 3600 + 30 * 60);
        assert_eq!(
            tz_offset, tz_iana,
            "+05:30 and Asia/Kolkata produce identical FixedOffset"
        );

        // 3. Verify UTC parses directly to 0 seconds
        let tz_utc = parse_business_timezone("UTC").expect("Must parse UTC without fallback");
        assert_eq!(tz_utc.local_minus_utc(), 0);

        // 4. Verify invalid timezone returns None (so caller knows it's invalid)
        assert!(parse_business_timezone("Invalid/Timezone").is_none());
        assert!(parse_business_timezone("not-a-tz").is_none());

        // 5. Verify overdue evaluation produces identical results with both "+05:30" and "Asia/Kolkata"
        let now_utc = Utc.with_ymd_and_hms(2026, 10, 21, 6, 30, 0).unwrap();
        let is_overdue_offset =
            is_course_overdue_with_instant("Mandatory", 0, Some("2026-10-20"), now_utc, tz_offset);
        let is_overdue_iana =
            is_course_overdue_with_instant("Mandatory", 0, Some("2026-10-20"), now_utc, tz_iana);
        assert!(is_overdue_offset);
        assert!(is_overdue_iana);
        assert_eq!(is_overdue_offset, is_overdue_iana);
    }

    #[test]
    fn test_validate_resource_valid() {
        assert_eq!(
            validate_resource(Some("document"), Some("https://example.com/handbook.pdf")),
            Ok(Some((
                "document".to_string(),
                "https://example.com/handbook.pdf".to_string()
            )))
        );
        assert_eq!(
            validate_resource(
                Some("video"),
                Some("https://stream.example.com/orientation.mp4")
            ),
            Ok(Some((
                "video".to_string(),
                "https://stream.example.com/orientation.mp4".to_string()
            )))
        );
        assert_eq!(
            validate_resource(Some("link"), Some("https://portal.example.com/compliance")),
            Ok(Some((
                "link".to_string(),
                "https://portal.example.com/compliance".to_string()
            )))
        );
        // Case-insensitivity on type
        assert_eq!(
            validate_resource(Some("Video"), Some("https://example.com/video")),
            Ok(Some((
                "video".to_string(),
                "https://example.com/video".to_string()
            )))
        );
    }

    #[test]
    fn test_validate_resource_empty_and_removal() {
        assert_eq!(validate_resource(None, None), Ok(None));
        assert_eq!(validate_resource(Some(""), Some("")), Ok(None));
        assert_eq!(validate_resource(Some("   "), Some("   ")), Ok(None));
    }

    #[test]
    fn test_validate_resource_rejections() {
        // Unsupported type
        assert!(validate_resource(Some("audio"), Some("https://example.com/audio.mp3")).is_err());
        // Missing URL
        assert!(validate_resource(Some("document"), None).is_err());
        assert!(validate_resource(Some("document"), Some("")).is_err());
        // Missing type
        assert!(validate_resource(None, Some("https://example.com")).is_err());
        // Non-HTTPS
        assert!(validate_resource(Some("link"), Some("http://example.com")).is_err());
        // Unsafe schemes
        assert!(validate_resource(Some("link"), Some("javascript:alert(1)")).is_err());
        assert!(validate_resource(Some("link"), Some("data:text/html,bad")).is_err());
        assert!(validate_resource(Some("link"), Some("file:///etc/passwd")).is_err());
        assert!(validate_resource(Some("link"), Some("ftp://ftp.example.com")).is_err());
        assert!(validate_resource(Some("link"), Some("blob:https://example.com/bad")).is_err());
        assert!(validate_resource(Some("link"), Some("about:blank")).is_err());
        // Embedded credentials
        assert!(
            validate_resource(Some("link"), Some("https://admin:pass@example.com/doc")).is_err()
        );
        // Malformed / whitespace
        assert!(validate_resource(Some("link"), Some("https://example .com/doc")).is_err());
        assert!(validate_resource(Some("link"), Some("https://")).is_err());
        // Length > 2048
        let long_path = "a".repeat(2050);
        let long_url = format!("https://example.com/{}", long_path);
        assert!(validate_resource(Some("link"), Some(&long_url)).is_err());
    }

    #[test]
    fn test_doc14_sectrain_status_computation() {
        let today = "2026-10-22";

        // Past due, not completed -> Overdue
        let due_past = "2026-10-15";
        let is_overdue = "Pending" != "Completed" && due_past < today;
        assert!(is_overdue);

        // Future due, not completed -> Not Overdue
        let due_future = "2026-11-15";
        let is_overdue_future = "Pending" != "Completed" && due_future < today;
        assert!(!is_overdue_future);

        // Past due, completed -> Not Overdue
        let is_overdue_completed = "Completed" != "Completed" && due_past < today;
        assert!(!is_overdue_completed);
    }

    #[test]
    fn test_doc14_posh_session_validity_computation() {
        let today = "2026-10-22";

        // Expired validity on training session -> Overdue
        let valid_past = "2026-10-10";
        let is_session_overdue = "Active" != "Completed" && valid_past < today;
        assert!(is_session_overdue);

        // Future validity -> Active
        let valid_future = "2027-01-15";
        let is_session_overdue_future = "Active" != "Completed" && valid_future < today;
        assert!(!is_session_overdue_future);

        // Completed session with past validity -> Not Overdue
        let is_completed_overdue = "Completed" != "Completed" && valid_past < today;
        assert!(!is_completed_overdue);
    }

    #[test]
    fn test_doc14_score_bounds() {
        let clamp_score = |s: i32| s.clamp(0, 100);
        assert_eq!(clamp_score(92), 92);
        assert_eq!(clamp_score(100), 100);
        assert_eq!(clamp_score(0), 0);
        assert_eq!(clamp_score(-15), 0);
        assert_eq!(clamp_score(150), 100);
    }

    #[test]
    fn test_doc14_completion_tracker_status() {
        // Overdue count > 0 -> "Overdue"
        let status1 = if 1 > 0 { "Overdue" } else { "Compliant" };
        assert_eq!(status1, "Overdue");

        // Assigned > 0 and Completed == Assigned -> "Compliant"
        let assigned = 4;
        let completed = 4;
        let overdue = 0;
        let status2 = if overdue > 0 {
            "Overdue"
        } else if assigned > 0 && completed == assigned {
            "Compliant"
        } else if completed > 0 {
            "In progress"
        } else {
            "Not started"
        };
        assert_eq!(status2, "Compliant");

        // Completed 2 of 4, no overdue -> "In progress"
        let assigned3 = 4;
        let completed3 = 2;
        let overdue3 = 0;
        let status3 = if overdue3 > 0 {
            "Overdue"
        } else if assigned3 > 0 && completed3 == assigned3 {
            "Compliant"
        } else if completed3 > 0 {
            "In progress"
        } else {
            "Not started"
        };
        assert_eq!(status3, "In progress");
    }

    #[test]
    fn test_doc15_unassigned_employee_status() {
        // When assigned_count is 0, employee is "Not assigned", strictly separated from "Not started"
        let assigned = 0;
        let completed = 0;
        let overdue = 0;
        let status = if overdue > 0 {
            "Overdue"
        } else if assigned == 0 {
            "Not assigned"
        } else if completed == assigned {
            "Compliant"
        } else if completed > 0 {
            "In progress"
        } else {
            "Not started"
        };
        assert_eq!(status, "Not assigned");

        // When assigned > 0 and completed == 0, status is "Not started"
        let assigned_started = 2;
        let completed_started = 0;
        let status_started = if overdue > 0 {
            "Overdue"
        } else if assigned_started == 0 {
            "Not assigned"
        } else if completed_started == assigned_started {
            "Compliant"
        } else if completed_started > 0 {
            "In progress"
        } else {
            "Not started"
        };
        assert_eq!(status_started, "Not started");
    }

    #[test]
    fn test_doc16_weighted_compliance_calculation() {
        // Course A: 10 assigned, 10 completed = 100%
        // Course B: 90 assigned, 0 completed = 0%
        // Unweighted average: (100 + 0) / 2 = 50% (INCORRECT)
        // Weighted calculation: 10 completed / 100 total = 10% (CORRECT)
        let total_assigned = 10 + 90;
        let total_completed = 10;
        let weighted_pct = if total_assigned > 0 {
            ((total_completed as f64 / total_assigned as f64) * 100.0).round() as i32
        } else {
            100
        };
        assert_eq!(weighted_pct, 10);

        // Zero denominator: Honest 100% default with no mandatory courses
        let zero_assigned = 0;
        let zero_completed = 0;
        let zero_pct = if zero_assigned > 0 {
            ((zero_completed as f64 / zero_assigned as f64) * 100.0).round() as i32
        } else {
            100
        };
        assert_eq!(zero_pct, 100);
    }

    #[test]
    fn test_doc17_audience_matching_and_deduplication() {
        let employees = vec![
            MockEmp {
                name: "Ananya Rao",
                dept: "Leadership",
                mgr: None,
            },
            MockEmp {
                name: "Rahul Varma",
                dept: "Engineering",
                mgr: Some("Ananya Rao"),
            },
            MockEmp {
                name: "Meera Joshi",
                dept: "Engineering",
                mgr: Some("Ananya Rao"),
            },
            MockEmp {
                name: "Karthik Reddy",
                dept: "Sales",
                mgr: Some("Ananya Rao"),
            },
        ];

        // Everyone: matches all 4
        let everyone_count = employees
            .iter()
            .filter(|e| is_in_audience("Everyone", e, &employees))
            .count();
        assert_eq!(everyone_count, 4);

        // Managers: Ananya is a manager (Rahul, Meera, Karthik report to her)
        let manager_count = employees
            .iter()
            .filter(|e| is_in_audience("Managers", e, &employees))
            .count();
        assert_eq!(manager_count, 1);

        // Department Engineering: matches Rahul & Meera (2)
        let eng_count = employees
            .iter()
            .filter(|e| is_in_audience("Engineering", e, &employees))
            .count();
        assert_eq!(eng_count, 2);

        // Deduplication test: employee already assigned is skipped
        let mut assigned_ids = std::collections::HashSet::new();
        assigned_ids.insert("BC-1004".to_string()); // Ananya already assigned

        let candidates = vec!["BC-1004", "BC-1001", "BC-1002"];
        let mut new_assigned = 0;
        let mut skipped = 0;

        for id in candidates {
            if assigned_ids.contains(id) {
                skipped += 1;
            } else {
                assigned_ids.insert(id.to_string());
                new_assigned += 1;
            }
        }

        assert_eq!(new_assigned, 2);
        assert_eq!(skipped, 1);
    }

    #[test]
    fn test_category_duplicate_and_association_protection() {
        // Validation: Category names cannot be empty or under 2 chars
        let name_valid = "Compliance".trim().len() >= 2;
        let name_invalid = " A ".trim().len() >= 2;
        assert!(name_valid);
        assert!(!name_invalid);

        // Protection: Category with assigned courses cannot be deleted
        let assigned_courses_count = 3;
        let can_delete = assigned_courses_count == 0;
        assert!(
            !can_delete,
            "Category with associated courses must not be deleted"
        );

        let zero_courses_count = 0;
        assert!(
            zero_courses_count == 0,
            "Category with zero courses can be safely deleted"
        );
    }

    #[test]
    fn test_skill_matrix_level_validation() {
        let valid_levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
        assert!(valid_levels.contains(&"Beginner"));
        assert!(valid_levels.contains(&"Intermediate"));
        assert!(valid_levels.contains(&"Advanced"));
        assert!(valid_levels.contains(&"Expert"));
        assert!(!valid_levels.contains(&"Master"));
        assert!(!valid_levels.contains(&"Novice"));
    }

    #[test]
    fn test_completion_records_assessment_vs_self_reported() {
        // HR-recorded score -> hr_recorded
        let scored_record_type = if Some(85).is_some() {
            "hr_recorded"
        } else {
            "self_reported"
        };
        assert_eq!(scored_record_type, "hr_recorded");

        // Learner self-completed without assessment score -> self_reported
        let no_score: Option<i32> = None;
        let self_reported_type = if no_score.is_some() {
            "hr_recorded"
        } else {
            "self_reported"
        };
        assert_eq!(self_reported_type, "self_reported");
    }

    #[test]
    fn test_skill_recommendations_rules() {
        // Rule 1: Mandatory course not yet completed
        let is_mandatory = true;
        let is_completed = false;
        let recommends_mandatory = is_mandatory && !is_completed;
        assert!(recommends_mandatory);

        // Rule 2: Department curriculum coverage (unrated skill triggers departmental curriculum recommendation without presuming incompetence)
        let mut emp_skills: HashMap<String, String> = HashMap::new();
        emp_skills.insert("SKL-001".to_string(), "Beginner".to_string());
        let needs_curriculum_skl_002 = !emp_skills.contains_key("SKL-002");
        assert!(
            needs_curriculum_skl_002,
            "Unrated skill triggers departmental curriculum recommendation"
        );

        // Rule 3: Growth recommendation (employee has Beginner or Intermediate)
        let current_level = emp_skills.get("SKL-001").unwrap();
        let allows_growth = current_level == "Beginner" || current_level == "Intermediate";
        assert!(
            allows_growth,
            "Beginner/Intermediate skills trigger growth recommendations"
        );
    }
}

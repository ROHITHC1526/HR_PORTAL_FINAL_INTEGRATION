use sqlx::{PgPool, Row};
use std::collections::HashSet;
use std::time::Instant;
use tracing::info;

use crate::models::{
    AttendanceRegularisation, AttendanceSummaryResponse, AuditHistoryItem, Candidate,
    CandidateTracker, CompanyPolicy, ConvertInternshipPayload, CreateFeedbackPayload,
    CreateLetterRequestPayload, CreateOnboardingTaskPayload, CreateRegularisationPayload,
    DashboardStats, DayAttendanceCard, Employee, EmployeeAttendance, EmployeeDependent,
    EmployeeDocument, EmployeeLeave, EmployeeProfile, EmployeeReferral, Goal, Internship,
    Interview, Job, JoiningRecord, LetterRequest, ManpowerRequirement, OfferLetter,
    OnboardingChecklist, OnboardingChecklistItem, PeerFeedback, PerformanceReview,
    ReviewCycleStatus, SelfReviewPayload, ServiceRequest, UpdateChecklistItemPayload,
    UpdateJoiningDocumentsPayload, UploadDocumentPayload, User,
};

/// Database-backed repository performing persistent CRUD operations
/// with parameterized queries and SQL transaction isolation.
#[derive(Clone)]
pub struct DatabaseRepository {
    pool: PgPool,
}

impl DatabaseRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    /// Measure real database latency for health endpoints
    pub async fn check_database_health(&self) -> Result<f64, sqlx::Error> {
        let start = Instant::now();
        sqlx::query("SELECT 1;").execute(&self.pool).await?;
        let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
        Ok(elapsed_ms)
    }

    // ========================================================================
    // USERS
    // ========================================================================

    pub async fn get_user_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error> {
        let clean = email.trim().to_lowercase();
        let row = sqlx::query(
            "SELECT id, name, email, password, role, coalesce(created_at::text, 'Today') as created_at FROM users WHERE lower(email) = $1 LIMIT 1;"
        )
        .bind(clean)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| User {
            id: r
                .try_get::<i64, _>("id")
                .map(|v| v as usize)
                .or_else(|_| r.try_get::<i32, _>("id").map(|v| v as usize))
                .unwrap_or(0),
            name: r.get("name"),
            email: r.get("email"),
            password: r.get("password"),
            role: r.get("role"),
            created_at: r
                .get::<Option<String>, _>("created_at")
                .unwrap_or_else(|| "Today".to_string()),
        }))
    }

    pub async fn create_user(
        &self,
        name: String,
        email: String,
        password: String,
        role: String,
    ) -> Result<User, sqlx::Error> {
        let clean_email = email.trim().to_lowercase();
        let next_id_row = sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM users;")
            .fetch_one(&self.pool)
            .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);

        sqlx::query(
            "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;",
        )
        .bind(next_id)
        .bind(&name)
        .bind(&clean_email)
        .bind(&password)
        .bind(&role)
        .execute(&self.pool)
        .await?;

        Ok(User {
            id: next_id as usize,
            name,
            email: clean_email,
            password,
            role,
            created_at: "Today".to_string(),
        })
    }

    pub async fn list_users(&self) -> Result<Vec<User>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, name, email, password, role, coalesce(created_at::text, 'Today') as created_at FROM users ORDER BY id ASC;")
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| User {
                id: r
                    .try_get::<i64, _>("id")
                    .map(|v| v as usize)
                    .or_else(|_| r.try_get::<i32, _>("id").map(|v| v as usize))
                    .unwrap_or(0),
                name: r.get("name"),
                email: r.get("email"),
                password: r.get("password"),
                role: r.get("role"),
                created_at: r
                    .get::<Option<String>, _>("created_at")
                    .unwrap_or_else(|| "Today".to_string()),
            })
            .collect())
    }

    // ========================================================================
    // JOBS
    // ========================================================================

    pub async fn list_jobs(&self) -> Result<Vec<Job>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, title, department, location, skills, status, posted_date FROM jobs ORDER BY id DESC;"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Job {
                id: r.get::<i32, _>("id") as usize,
                title: r.get("title"),
                department: r.get("department"),
                location: r.get("location"),
                skills: r.get("skills"),
                status: r.get("status"),
                posted_date: r.get("posted_date"),
            })
            .collect())
    }

    pub async fn create_job(
        &self,
        title: String,
        department: String,
        location: String,
        skills: String,
        status: String,
    ) -> Result<Job, sqlx::Error> {
        let next_id_row = sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM jobs;")
            .fetch_one(&self.pool)
            .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);

        sqlx::query(
            "INSERT INTO jobs (id, title, department, location, skills, status, posted_date) 
             VALUES ($1, $2, $3, $4, $5, $6, 'Today')
             ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status;",
        )
        .bind(next_id)
        .bind(&title)
        .bind(&department)
        .bind(&location)
        .bind(&skills)
        .bind(&status)
        .execute(&self.pool)
        .await?;

        Ok(Job {
            id: next_id as usize,
            title,
            department,
            location,
            skills,
            status,
            posted_date: "Today".to_string(),
        })
    }

    pub async fn update_job_status(
        &self,
        id: usize,
        status: String,
    ) -> Result<Option<Job>, sqlx::Error> {
        let res = sqlx::query("UPDATE jobs SET status = $1 WHERE id = $2 RETURNING id, title, department, location, skills, status, posted_date;")
            .bind(&status)
            .bind(id as i32)
            .fetch_optional(&self.pool)
            .await?;

        Ok(res.map(|r| Job {
            id: r.get::<i32, _>("id") as usize,
            title: r.get("title"),
            department: r.get("department"),
            location: r.get("location"),
            skills: r.get("skills"),
            status: r.get("status"),
            posted_date: r.get("posted_date"),
        }))
    }

    // ========================================================================
    // CANDIDATES
    // ========================================================================

    pub async fn list_candidates(
        &self,
        search: Option<&str>,
        status: Option<&str>,
        job_id: Option<usize>,
    ) -> Result<Vec<Candidate>, sqlx::Error> {
        let search_pattern = search
            .filter(|s| !s.trim().is_empty())
            .map(|s| format!("%{}%", s.trim().to_lowercase()));
        let status_val = status.filter(|s| !s.trim().is_empty() && *s != "All");
        let job_id_val = job_id.map(|j| j as i32);

        let rows = sqlx::query(
            "SELECT id, name, email, job_id, job_title, skills, status, applied_date FROM candidates
             WHERE ($1::text IS NULL OR lower(name) LIKE $1 OR lower(email) LIKE $1 OR lower(skills) LIKE $1 OR lower(job_title) LIKE $1)
               AND ($2::text IS NULL OR status = $2)
               AND ($3::int IS NULL OR job_id = $3)
             ORDER BY id DESC;"
        )
        .bind(search_pattern)
        .bind(status_val)
        .bind(job_id_val)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Candidate {
                id: r.get::<i32, _>("id") as usize,
                name: r.get("name"),
                email: r.get("email"),
                job_id: r.get::<i32, _>("job_id") as usize,
                job_title: r.get("job_title"),
                skills: r.get("skills"),
                status: r.get("status"),
                applied_date: r.get("applied_date"),
            })
            .collect())
    }

    pub async fn create_candidate(
        &self,
        name: String,
        email: String,
        job_id: usize,
        job_title: String,
        skills: String,
        status: String,
    ) -> Result<Candidate, sqlx::Error> {
        let next_id_row =
            sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM candidates;")
                .fetch_one(&self.pool)
                .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);

        sqlx::query(
            "INSERT INTO candidates (id, name, email, job_id, job_title, skills, status, applied_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'Today')
             ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;"
        )
        .bind(next_id)
        .bind(&name)
        .bind(&email)
        .bind(job_id as i32)
        .bind(&job_title)
        .bind(&skills)
        .bind(&status)
        .execute(&self.pool)
        .await?;

        Ok(Candidate {
            id: next_id as usize,
            name,
            email,
            job_id,
            job_title,
            skills,
            status,
            applied_date: "Today".to_string(),
        })
    }

    pub async fn update_candidate_status(
        &self,
        id: usize,
        status: &str,
    ) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("UPDATE candidates SET status = $1 WHERE id = $2;")
            .bind(status)
            .bind(id as i32)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    // ========================================================================
    // INTERVIEWS
    // ========================================================================

    pub async fn list_interviews(&self) -> Result<Vec<Interview>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, candidate_id, candidate_name, candidate_email, job_title, interview_date, formatted_date, 
                    interviewer, interview_type, notes, status, round, mode, time, venue_link, rating, result, feedback, archived,
                    coalesce(created_at, '') as created_at, coalesce(updated_at, '') as updated_at, coalesce(history, '[]') as history 
             FROM interviews ORDER BY id DESC;"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Interview {
                id: r.get::<i32, _>("id") as usize,
                candidate_id: r.get::<i32, _>("candidate_id") as usize,
                candidate_name: r.get("candidate_name"),
                candidate_email: r.get("candidate_email"),
                job_title: r.get("job_title"),
                interview_date: r.get("interview_date"),
                formatted_date: r.get("formatted_date"),
                interviewer: r.get("interviewer"),
                interview_type: r.get("interview_type"),
                notes: r.get::<Option<String>, _>("notes").unwrap_or_default(),
                status: r.get("status"),
                round: r.get("round"),
                mode: r.get("mode"),
                time: r.get("time"),
                venue_link: r.get("venue_link"),
                rating: r.get::<Option<i32>, _>("rating").map(|v| v as u32),
                result: r.get("result"),
                feedback: r.get("feedback"),
                archived: r.get("archived"),
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
                history: r
                    .get::<Option<String>, _>("history")
                    .and_then(|h| serde_json::from_str(&h).ok()),
            })
            .collect())
    }

    pub async fn create_interview(&self, mut intv: Interview) -> Result<Interview, sqlx::Error> {
        let next_id_row =
            sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM interviews;")
                .fetch_one(&self.pool)
                .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);
        intv.id = next_id as usize;

        let history_str = intv
            .history
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_else(|_| "[]".to_string()))
            .unwrap_or_else(|| "[]".to_string());

        sqlx::query(
            "INSERT INTO interviews (id, candidate_id, candidate_name, candidate_email, job_title, interview_date, 
                    formatted_date, interviewer, interview_type, notes, status, round, mode, time, venue_link, rating, result, feedback, archived,
                    created_at, updated_at, history)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
             ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at, history = EXCLUDED.history;"
        )
        .bind(next_id)
        .bind(intv.candidate_id as i32)
        .bind(&intv.candidate_name)
        .bind(&intv.candidate_email)
        .bind(&intv.job_title)
        .bind(&intv.interview_date)
        .bind(&intv.formatted_date)
        .bind(&intv.interviewer)
        .bind(&intv.interview_type)
        .bind(&intv.notes)
        .bind(&intv.status)
        .bind(&intv.round)
        .bind(&intv.mode)
        .bind(&intv.time)
        .bind(&intv.venue_link)
        .bind(intv.rating.map(|v| v as i32))
        .bind(&intv.result)
        .bind(&intv.feedback)
        .bind(intv.archived.unwrap_or(false))
        .bind(intv.created_at.as_deref().unwrap_or(""))
        .bind(intv.updated_at.as_deref().unwrap_or(""))
        .bind(&history_str)
        .execute(&self.pool)
        .await?;

        // Update candidate stage in candidate_trackers if applicable
        let _ = sqlx::query("UPDATE candidate_trackers SET stage = 'Interview' WHERE full_name = $1 AND stage IN ('Applied', 'Screening');")
            .bind(&intv.candidate_name)
            .execute(&self.pool)
            .await;

        Ok(intv)
    }

    pub async fn update_interview(
        &self,
        id: usize,
        intv: Interview,
    ) -> Result<Interview, sqlx::Error> {
        let history_str = intv
            .history
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_else(|_| "[]".to_string()))
            .unwrap_or_else(|| "[]".to_string());

        sqlx::query(
            "UPDATE interviews SET candidate_name = $1, interview_date = $2, interviewer = $3, round = $4, mode = $5,
                    time = $6, venue_link = $7, rating = $8, result = $9, feedback = $10, status = $11, archived = $12,
                    updated_at = $13, history = $14
             WHERE id = $15;"
        )
        .bind(&intv.candidate_name)
        .bind(&intv.interview_date)
        .bind(&intv.interviewer)
        .bind(&intv.round)
        .bind(&intv.mode)
        .bind(&intv.time)
        .bind(&intv.venue_link)
        .bind(intv.rating.map(|v| v as i32))
        .bind(&intv.result)
        .bind(&intv.feedback)
        .bind(&intv.status)
        .bind(intv.archived.unwrap_or(false))
        .bind(intv.updated_at.as_deref().unwrap_or(""))
        .bind(&history_str)
        .bind(id as i32)
        .execute(&self.pool)
        .await?;

        Ok(intv)
    }

    pub async fn delete_interview(&self, id: usize) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM interviews WHERE id = $1;")
            .bind(id as i32)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    // ========================================================================
    // EMPLOYEES
    // ========================================================================

    pub async fn list_employees(
        &self,
        search: Option<&str>,
        department: Option<&str>,
        status: Option<&str>,
    ) -> Result<Vec<Employee>, sqlx::Error> {
        let search_pattern = search
            .filter(|s| !s.trim().is_empty())
            .map(|s| format!("%{}%", s.trim().to_lowercase()));
        let dept_val = department.filter(|d| !d.trim().is_empty() && *d != "All");
        let status_val = status.filter(|s| !s.trim().is_empty() && *s != "All");

        let rows = sqlx::query(
            "SELECT id, name, role, department, grade, location, manager, status, email FROM employees
             WHERE ($1::text IS NULL OR lower(name) LIKE $1 OR lower(role) LIKE $1 OR lower(id) LIKE $1 OR lower(email) LIKE $1)
               AND ($2::text IS NULL OR department = $2)
               AND ($3::text IS NULL OR status = $3)
             ORDER BY id ASC;"
        )
        .bind(search_pattern)
        .bind(dept_val)
        .bind(status_val)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Employee {
                id: r.get("id"),
                name: r.get("name"),
                role: r.get("role"),
                department: r.get("department"),
                grade: r.get("grade"),
                location: r.get("location"),
                manager: r.get("manager"),
                status: r.get("status"),
                email: r.get("email"),
            })
            .collect())
    }

    pub async fn create_employee(&self, mut emp: Employee) -> Result<Employee, sqlx::Error> {
        if emp.id.trim().is_empty() {
            let emp_ids: Vec<String> =
                sqlx::query_scalar("SELECT id FROM employees WHERE id LIKE 'BC-%';")
                    .fetch_all(&self.pool)
                    .await
                    .unwrap_or_default();
            let max_id = emp_ids
                .iter()
                .filter_map(|id| id.strip_prefix("BC-")?.parse::<u64>().ok())
                .max()
                .unwrap_or(1045);
            emp.id = format!("BC-{}", max_id + 1);
        }

        sqlx::query(
            "INSERT INTO employees (id, name, role, department, grade, location, manager, status, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department, status = EXCLUDED.status;"
        )
        .bind(&emp.id)
        .bind(&emp.name)
        .bind(&emp.role)
        .bind(&emp.department)
        .bind(&emp.grade)
        .bind(&emp.location)
        .bind(&emp.manager)
        .bind(&emp.status)
        .bind(&emp.email)
        .execute(&self.pool)
        .await?;

        Ok(emp)
    }

    pub async fn update_employee(&self, id: &str, emp: Employee) -> Result<Employee, sqlx::Error> {
        sqlx::query(
            "UPDATE employees SET name = $1, role = $2, department = $3, grade = $4, location = $5, manager = $6, status = $7, email = $8
             WHERE id = $9;"
        )
        .bind(&emp.name)
        .bind(&emp.role)
        .bind(&emp.department)
        .bind(&emp.grade)
        .bind(&emp.location)
        .bind(&emp.manager)
        .bind(&emp.status)
        .bind(&emp.email)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(emp)
    }

    // ========================================================================
    // EMPLOYEE PROFILES
    // ========================================================================

    pub async fn get_profile_by_email(
        &self,
        email: &str,
    ) -> Result<Option<EmployeeProfile>, sqlx::Error> {
        let clean = email.trim().to_lowercase();
        let row = sqlx::query(
            "SELECT employee_id, full_name, work_email, role, department, status, phone, dob, blood_group,
                    address, emergency_contact, manager, grade, location, doj, bank_name, bank_account,
                    ifsc, pan, uan, nominee_name, nominee_relation 
             FROM employee_profiles WHERE lower(work_email) = $1 LIMIT 1;"
        )
        .bind(clean)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| EmployeeProfile {
            employee_id: r.get("employee_id"),
            full_name: r.get("full_name"),
            work_email: r.get("work_email"),
            role: r.get("role"),
            department: r.get("department"),
            status: r.get("status"),
            phone: r.get("phone"),
            dob: r.get("dob"),
            blood_group: r.get("blood_group"),
            address: r.get("address"),
            emergency_contact: r.get("emergency_contact"),
            manager: r.get("manager"),
            grade: r.get("grade"),
            location: r.get("location"),
            doj: r.get("doj"),
            bank_name: r.get("bank_name"),
            bank_account: r.get("bank_account"),
            ifsc: r.get("ifsc"),
            pan: r.get("pan"),
            uan: r.get("uan"),
            nominee_name: r.get("nominee_name"),
            nominee_relation: r.get("nominee_relation"),
        }))
    }

    pub async fn upsert_profile(
        &self,
        prof: EmployeeProfile,
    ) -> Result<EmployeeProfile, sqlx::Error> {
        sqlx::query(
            "INSERT INTO employee_profiles (employee_id, full_name, work_email, role, department, status, phone, dob,
                    blood_group, address, emergency_contact, manager, grade, location, doj, bank_name, bank_account, ifsc, pan, uan, nominee_name, nominee_relation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
             ON CONFLICT (employee_id) DO UPDATE SET 
                full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address,
                emergency_contact = EXCLUDED.emergency_contact, bank_name = EXCLUDED.bank_name,
                bank_account = EXCLUDED.bank_account, ifsc = EXCLUDED.ifsc, pan = EXCLUDED.pan,
                uan = EXCLUDED.uan, nominee_name = EXCLUDED.nominee_name, nominee_relation = EXCLUDED.nominee_relation;"
        )
        .bind(&prof.employee_id)
        .bind(&prof.full_name)
        .bind(&prof.work_email)
        .bind(&prof.role)
        .bind(&prof.department)
        .bind(&prof.status)
        .bind(&prof.phone)
        .bind(&prof.dob)
        .bind(&prof.blood_group)
        .bind(&prof.address)
        .bind(&prof.emergency_contact)
        .bind(&prof.manager)
        .bind(&prof.grade)
        .bind(&prof.location)
        .bind(&prof.doj)
        .bind(&prof.bank_name)
        .bind(&prof.bank_account)
        .bind(&prof.ifsc)
        .bind(&prof.pan)
        .bind(&prof.uan)
        .bind(&prof.nominee_name)
        .bind(&prof.nominee_relation)
        .execute(&self.pool)
        .await?;

        Ok(prof)
    }

    // ========================================================================
    // LEAVES, ATTENDANCE & REFERRALS
    // ========================================================================

    pub async fn list_leaves(&self, emp_id: &str) -> Result<Vec<EmployeeLeave>, sqlx::Error> {
        let rows = if emp_id.is_empty() || emp_id == "all" {
            sqlx::query("SELECT id, employee_id, leave_type, from_date, to_date, days, reason, status FROM employee_leaves ORDER BY id DESC;")
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query("SELECT id, employee_id, leave_type, from_date, to_date, days, reason, status FROM employee_leaves WHERE employee_id = $1 ORDER BY id DESC;")
                .bind(emp_id)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows
            .into_iter()
            .map(|r| EmployeeLeave {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                leave_type: r.get("leave_type"),
                from_date: r.get("from_date"),
                to_date: r.get("to_date"),
                days: r.get::<i32, _>("days") as u32,
                reason: r.get::<Option<String>, _>("reason").unwrap_or_default(),
                status: r.get("status"),
            })
            .collect())
    }

    pub async fn create_leave(&self, leave: EmployeeLeave) -> Result<EmployeeLeave, sqlx::Error> {
        sqlx::query(
            "INSERT INTO employee_leaves (id, employee_id, leave_type, from_date, to_date, days, reason, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING;"
        )
        .bind(&leave.id)
        .bind(&leave.employee_id)
        .bind(&leave.leave_type)
        .bind(&leave.from_date)
        .bind(&leave.to_date)
        .bind(leave.days as i32)
        .bind(&leave.reason)
        .bind(&leave.status)
        .execute(&self.pool)
        .await?;

        Ok(leave)
    }

    pub async fn list_attendance(
        &self,
        emp_id: &str,
    ) -> Result<Vec<EmployeeAttendance>, sqlx::Error> {
        let rows = if emp_id.is_empty() || emp_id == "all" {
            sqlx::query("SELECT id, employee_id, date, punch_in, punch_out, work_hours, status FROM employee_attendance ORDER BY date DESC;")
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query("SELECT id, employee_id, date, punch_in, punch_out, work_hours, status FROM employee_attendance WHERE employee_id = $1 ORDER BY date DESC;")
                .bind(emp_id)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows
            .into_iter()
            .map(|r| EmployeeAttendance {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                date: r.get("date"),
                punch_in: r.get("punch_in"),
                punch_out: r.get("punch_out"),
                work_hours: r.get("work_hours"),
                status: r.get("status"),
            })
            .collect())
    }

    pub async fn record_attendance_punch(
        &self,
        emp_id: &str,
    ) -> Result<EmployeeAttendance, sqlx::Error> {
        let today = "2026-10-19".to_string();
        let now_time = "09:30 AM".to_string();

        let existing = sqlx::query("SELECT id, punch_out FROM employee_attendance WHERE employee_id = $1 AND date = $2 LIMIT 1;")
            .bind(emp_id)
            .bind(&today)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(r) = existing {
            let id: String = r.get("id");
            sqlx::query("UPDATE employee_attendance SET punch_out = '06:30 PM', work_hours = '8h 45m' WHERE id = $1;")
                .bind(&id)
                .execute(&self.pool)
                .await?;

            Ok(EmployeeAttendance {
                id,
                employee_id: emp_id.to_string(),
                date: today,
                punch_in: now_time,
                punch_out: Some("06:30 PM".to_string()),
                work_hours: "8h 45m".to_string(),
                status: "Present".to_string(),
            })
        } else {
            let count_row = sqlx::query("SELECT count(*) as count FROM employee_attendance;")
                .fetch_one(&self.pool)
                .await?;
            let count: i64 = count_row.get("count");
            let id = format!("ATT-{}", count + 1);

            sqlx::query(
                "INSERT INTO employee_attendance (id, employee_id, date, punch_in, work_hours, status)
                 VALUES ($1, $2, $3, $4, 'In progress', 'Present');"
            )
            .bind(&id)
            .bind(emp_id)
            .bind(&today)
            .bind(&now_time)
            .execute(&self.pool)
            .await?;

            Ok(EmployeeAttendance {
                id,
                employee_id: emp_id.to_string(),
                date: today,
                punch_in: now_time,
                punch_out: None,
                work_hours: "In progress".to_string(),
                status: "Present".to_string(),
            })
        }
    }

    pub async fn list_referrals(&self, email: &str) -> Result<Vec<EmployeeReferral>, sqlx::Error> {
        let rows = if email.is_empty() || email == "all" || email == "admin" {
            sqlx::query("SELECT id, candidate_name, role, referred_by, bonus, status, date, email, phone, notes FROM employee_referrals ORDER BY id DESC;")
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query("SELECT id, candidate_name, role, referred_by, bonus, status, date, email, phone, notes FROM employee_referrals WHERE lower(referred_by) = lower($1) ORDER BY id DESC;")
                .bind(email)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows
            .into_iter()
            .map(|r| EmployeeReferral {
                id: r.get("id"),
                candidate_name: r.get("candidate_name"),
                role: r.get("role"),
                referred_by: r.get("referred_by"),
                bonus: r.get::<i32, _>("bonus") as u64,
                status: r.get("status"),
                date: r.get("date"),
                email: r.try_get("email").ok(),
                phone: r.try_get("phone").ok(),
                notes: r.try_get("notes").ok(),
            })
            .collect())
    }

    pub async fn create_referral(
        &self,
        referral: EmployeeReferral,
    ) -> Result<EmployeeReferral, sqlx::Error> {
        sqlx::query(
            "INSERT INTO employee_referrals (id, candidate_name, role, referred_by, bonus, status, date, email, phone, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET
                candidate_name = EXCLUDED.candidate_name,
                role = EXCLUDED.role,
                referred_by = EXCLUDED.referred_by,
                bonus = EXCLUDED.bonus,
                status = EXCLUDED.status,
                date = EXCLUDED.date,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                notes = EXCLUDED.notes;"
        )
        .bind(&referral.id)
        .bind(&referral.candidate_name)
        .bind(&referral.role)
        .bind(&referral.referred_by)
        .bind(referral.bonus as i32)
        .bind(&referral.status)
        .bind(&referral.date)
        .bind(referral.email.as_deref().unwrap_or(""))
        .bind(referral.phone.as_deref().unwrap_or(""))
        .bind(referral.notes.as_deref().unwrap_or(""))
        .execute(&self.pool)
        .await?;

        Ok(referral)
    }

    // ========================================================================
    // GOALS & REVIEWS
    // ========================================================================

    pub async fn list_goals(&self) -> Result<Vec<Goal>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, employee_id, employee_name, title, category, target_date, progress, status FROM goals ORDER BY id ASC;")
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| Goal {
                id: r.get::<i32, _>("id") as usize,
                employee_id: r.get("employee_id"),
                employee_name: r.get("employee_name"),
                title: r.get("title"),
                category: r.get("category"),
                target_date: r.get("target_date"),
                progress: r.get::<i32, _>("progress") as u32,
                status: r.get("status"),
            })
            .collect())
    }

    pub async fn create_goal(&self, mut goal: Goal) -> Result<Goal, sqlx::Error> {
        let next_id_row = sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM goals;")
            .fetch_one(&self.pool)
            .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);
        goal.id = next_id as usize;

        sqlx::query(
            "INSERT INTO goals (id, employee_id, employee_name, title, category, target_date, progress, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET progress = EXCLUDED.progress, status = EXCLUDED.status;"
        )
        .bind(next_id)
        .bind(&goal.employee_id)
        .bind(&goal.employee_name)
        .bind(&goal.title)
        .bind(&goal.category)
        .bind(&goal.target_date)
        .bind(goal.progress as i32)
        .bind(&goal.status)
        .execute(&self.pool)
        .await?;

        Ok(goal)
    }

    pub async fn update_goal_progress(
        &self,
        id: usize,
        progress: u32,
    ) -> Result<bool, sqlx::Error> {
        let clamped = progress.clamp(0, 100);
        let status = if clamped >= 100 {
            "Completed"
        } else {
            "In Progress"
        };

        let res = sqlx::query("UPDATE goals SET progress = $1, status = $2 WHERE id = $3;")
            .bind(clamped as i32)
            .bind(status)
            .bind(id as i32)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    pub async fn list_reviews(&self) -> Result<Vec<PerformanceReview>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, employee_id, employee_name, reviewer_name, cycle, rating::float4 as rating, feedback, status, updated_at FROM reviews ORDER BY id DESC;")
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let rating: f32 = r
                    .try_get::<f32, _>("rating")
                    .or_else(|_| r.try_get::<i32, _>("rating").map(|v| v as f32))
                    .or_else(|_| r.try_get::<f64, _>("rating").map(|v| v as f32))
                    .unwrap_or(4.0);
                PerformanceReview {
                    id: r.get::<i32, _>("id") as usize,
                    employee_id: r.get("employee_id"),
                    employee_name: r.get("employee_name"),
                    reviewer_name: r.get("reviewer_name"),
                    cycle: r.get("cycle"),
                    rating,
                    feedback: r.get("feedback"),
                    status: r.get("status"),
                    updated_at: r.get("updated_at"),
                }
            })
            .collect())
    }

    pub async fn create_review(
        &self,
        mut rev: PerformanceReview,
    ) -> Result<PerformanceReview, sqlx::Error> {
        let next_id_row = sqlx::query("SELECT coalesce(max(id), 0) + 1 as next_id FROM reviews;")
            .fetch_one(&self.pool)
            .await?;
        let next_id: i64 = next_id_row
            .try_get::<i64, _>("next_id")
            .or_else(|_| next_id_row.try_get::<i32, _>("next_id").map(|v| v as i64))
            .unwrap_or(1);
        rev.id = next_id as usize;

        sqlx::query(
            "INSERT INTO reviews (id, employee_id, employee_name, reviewer_name, cycle, rating, feedback, status, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET rating = EXCLUDED.rating, feedback = EXCLUDED.feedback;"
        )
        .bind(next_id)
        .bind(&rev.employee_id)
        .bind(&rev.employee_name)
        .bind(&rev.reviewer_name)
        .bind(&rev.cycle)
        .bind(rev.rating)
        .bind(&rev.feedback)
        .bind(&rev.status)
        .bind(&rev.updated_at)
        .execute(&self.pool)
        .await?;

        Ok(rev)
    }

    // ========================================================================
    // MANPOWER REQUIREMENTS & CANDIDATE TRACKER
    // ========================================================================

    pub async fn list_manpower(&self) -> Result<Vec<ManpowerRequirement>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, designation, department, positions, employment_type, location, experience, budget_ctc, 
                    reason, replacing, hiring_manager, required_by, status, job_description, created_at, updated_at, archived 
             FROM manpower_requirements ORDER BY id ASC;"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| ManpowerRequirement {
                id: r.get("id"),
                designation: r.get("designation"),
                department: r.get("department"),
                positions: r.get::<i32, _>("positions") as u32,
                hiring_manager: r.get("hiring_manager"),
                required_by: r.get("required_by"),
                status: r.get("status"),
                employment_type: r.get("employment_type"),
                location: r.get("location"),
                experience: r.get("experience"),
                budget_ctc: r.get("budget_ctc"),
                reason: r.get("reason"),
                replacing: r.get("replacing"),
                job_description: r.get("job_description"),
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
                archived: r.get("archived"),
            })
            .collect())
    }

    pub async fn create_manpower(
        &self,
        req: ManpowerRequirement,
    ) -> Result<ManpowerRequirement, sqlx::Error> {
        sqlx::query(
            "INSERT INTO manpower_requirements (id, designation, department, positions, employment_type, location, 
                    experience, budget_ctc, reason, replacing, hiring_manager, required_by, status, job_description, created_at, updated_at, archived)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
             ON CONFLICT (id) DO UPDATE SET designation = EXCLUDED.designation, department = EXCLUDED.department, status = EXCLUDED.status;"
        )
        .bind(&req.id)
        .bind(&req.designation)
        .bind(&req.department)
        .bind(req.positions as i32)
        .bind(&req.employment_type)
        .bind(&req.location)
        .bind(&req.experience)
        .bind(&req.budget_ctc)
        .bind(&req.reason)
        .bind(&req.replacing)
        .bind(&req.hiring_manager)
        .bind(&req.required_by)
        .bind(&req.status)
        .bind(&req.job_description)
        .bind(&req.created_at)
        .bind(&req.updated_at)
        .bind(req.archived.unwrap_or(false))
        .execute(&self.pool)
        .await?;

        Ok(req)
    }

    pub async fn update_manpower(
        &self,
        id: &str,
        req: ManpowerRequirement,
    ) -> Result<ManpowerRequirement, sqlx::Error> {
        sqlx::query(
            "UPDATE manpower_requirements SET designation = $1, department = $2, positions = $3, hiring_manager = $4,
                    required_by = $5, status = $6, employment_type = $7, location = $8, experience = $9, budget_ctc = $10,
                    reason = $11, replacing = $12, job_description = $13, updated_at = $14, archived = $15
             WHERE id = $16;"
        )
        .bind(&req.designation)
        .bind(&req.department)
        .bind(req.positions as i32)
        .bind(&req.hiring_manager)
        .bind(&req.required_by)
        .bind(&req.status)
        .bind(&req.employment_type)
        .bind(&req.location)
        .bind(&req.experience)
        .bind(&req.budget_ctc)
        .bind(&req.reason)
        .bind(&req.replacing)
        .bind(&req.job_description)
        .bind(&req.updated_at)
        .bind(req.archived.unwrap_or(false))
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(req)
    }

    pub async fn delete_manpower(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM manpower_requirements WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    pub async fn list_candidate_trackers(&self) -> Result<Vec<CandidateTracker>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, full_name, applied_for, source, total_experience,
                    coalesce(current_ctc, 0) as current_ctc,
                    expected_ctc,
                    coalesce(notice_period, 0) as notice_period,
                    coalesce(current_location, '') as current_location,
                    coalesce(resume, '—') as resume,
                    coalesce(consent_to_store_data, 'Yes') as consent_to_store_data,
                    stage, email, phone,
                    coalesce(employee_id, '—') as employee_id,
                    archived,
                    coalesce(created_at::text, 'Today') as created_at
             FROM candidate_trackers ORDER BY id ASC;",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| CandidateTracker {
                id: r.get("id"),
                full_name: r.get("full_name"),
                applied_for: r.get("applied_for"),
                source: r.get("source"),
                total_experience: r.get::<i32, _>("total_experience") as u32,
                current_ctc: Some(r.get::<i64, _>("current_ctc") as u64),
                expected_ctc: r.get::<i64, _>("expected_ctc") as u64,
                notice_period: Some(r.get::<i32, _>("notice_period") as u32),
                current_location: Some(r.get("current_location")),
                resume: Some(r.get("resume")),
                consent_to_store_data: Some(r.get("consent_to_store_data")),
                stage: r.get("stage"),
                email: r.get("email"),
                phone: r.get("phone"),
                employee_id: Some(r.get("employee_id")),
                archived: r.get("archived"),
                created_at: Some(r.get("created_at")),
                updated_at: Some("19 Oct 2026, 3:51 pm".to_string()),
            })
            .collect())
    }

    pub async fn create_candidate_tracker(
        &self,
        cand: CandidateTracker,
    ) -> Result<CandidateTracker, sqlx::Error> {
        sqlx::query(
            "INSERT INTO candidate_trackers (id, full_name, applied_for, source, total_experience, current_ctc, expected_ctc, notice_period, current_location, resume, consent_to_store_data, stage, email, phone, employee_id, status, archived)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active', $16)
             ON CONFLICT (id) DO UPDATE SET stage = EXCLUDED.stage, archived = EXCLUDED.archived;",
        )
        .bind(&cand.id)
        .bind(&cand.full_name)
        .bind(&cand.applied_for)
        .bind(&cand.source)
        .bind(cand.total_experience as i32)
        .bind(cand.current_ctc.unwrap_or(0) as i64)
        .bind(cand.expected_ctc as i64)
        .bind(cand.notice_period.unwrap_or(0) as i32)
        .bind(cand.current_location.as_deref().unwrap_or(""))
        .bind(cand.resume.as_deref().unwrap_or("—"))
        .bind(cand.consent_to_store_data.as_deref().unwrap_or("Yes"))
        .bind(&cand.stage)
        .bind(&cand.email)
        .bind(&cand.phone)
        .bind(cand.employee_id.as_deref().unwrap_or("—"))
        .bind(cand.archived.unwrap_or(false))
        .execute(&self.pool)
        .await?;

        Ok(cand)
    }

    pub async fn update_candidate_tracker(
        &self,
        id: &str,
        cand: CandidateTracker,
    ) -> Result<CandidateTracker, sqlx::Error> {
        sqlx::query(
            "UPDATE candidate_trackers SET full_name = $1, applied_for = $2, source = $3, total_experience = $4,
                    current_ctc = $5, expected_ctc = $6, notice_period = $7, current_location = $8,
                    resume = $9, consent_to_store_data = $10, stage = $11, email = $12, phone = $13,
                    employee_id = $14, archived = $15
             WHERE id = $16;",
        )
        .bind(&cand.full_name)
        .bind(&cand.applied_for)
        .bind(&cand.source)
        .bind(cand.total_experience as i32)
        .bind(cand.current_ctc.unwrap_or(0) as i64)
        .bind(cand.expected_ctc as i64)
        .bind(cand.notice_period.unwrap_or(0) as i32)
        .bind(cand.current_location.as_deref().unwrap_or(""))
        .bind(cand.resume.as_deref().unwrap_or("—"))
        .bind(cand.consent_to_store_data.as_deref().unwrap_or("Yes"))
        .bind(&cand.stage)
        .bind(&cand.email)
        .bind(&cand.phone)
        .bind(cand.employee_id.as_deref().unwrap_or("—"))
        .bind(cand.archived.unwrap_or(false))
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(cand)
    }

    pub async fn delete_candidate_tracker(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM candidate_trackers WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    /// Convert a candidate to an employee atomically in a database transaction
    pub async fn convert_candidate_to_employee(&self, id: &str) -> Result<Employee, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let cand_row = sqlx::query(
            "SELECT id, full_name, applied_for, email, expected_ctc FROM candidate_trackers WHERE id = $1 FOR UPDATE;",
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await?;

        let name: String = cand_row.get("full_name");
        let role: String = cand_row.get("applied_for");
        let email: String = cand_row.get("email");
        let expected_ctc: i64 = cand_row.get("expected_ctc");

        // Generate unique employee ID
        let count_row = sqlx::query("SELECT count(*) as count FROM employees;")
            .fetch_one(&mut *tx)
            .await?;
        let count: i64 = count_row.get("count");
        let new_id = format!("BC-{}", 1050 + count);

        // Mark candidate as Hired and assign employee ID
        sqlx::query(
            "UPDATE candidate_trackers SET stage = 'Hired', employee_id = $1 WHERE id = $2;",
        )
        .bind(&new_id)
        .bind(id)
        .execute(&mut *tx)
        .await?;

        let final_email = if email.is_empty() {
            format!(
                "{}.emp@brightcone.ai",
                name.to_lowercase().replace(' ', ".")
            )
        } else {
            email
        };

        let new_emp = Employee {
            id: new_id.clone(),
            name: name.clone(),
            role: role.clone(),
            department: "Engineering".to_string(),
            grade: "L5".to_string(),
            location: "Hyderabad".to_string(),
            manager: "Ananya Rao".to_string(),
            status: "Probation".to_string(),
            email: final_email.clone(),
        };

        sqlx::query(
            "INSERT INTO employees (id, name, role, department, grade, location, manager, status, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING;",
        )
        .bind(&new_emp.id)
        .bind(&new_emp.name)
        .bind(&new_emp.role)
        .bind(&new_emp.department)
        .bind(&new_emp.grade)
        .bind(&new_emp.location)
        .bind(&new_emp.manager)
        .bind(&new_emp.status)
        .bind(&new_emp.email)
        .execute(&mut *tx)
        .await?;

        // Also generate and insert corresponding Offer Letter for this candidate
        let offer_count_row = sqlx::query("SELECT count(*) as count FROM offer_letters;")
            .fetch_one(&mut *tx)
            .await?;
        let offer_count: i64 = offer_count_row.get("count");
        let new_offer_id = format!("OFF-{:03}", offer_count + 1);
        let annual_ctc_str = format!("₹{}", expected_ctc);

        sqlx::query(
            "INSERT INTO offer_letters (id, candidate_id, candidate_name, designation, annual_ctc, joining_date, valid_till, status, archived)
             VALUES ($1, $2, $3, $4, $5, 'Nov 15, 2026', 'Oct 30, 2026', 'Draft', FALSE)
             ON CONFLICT (id) DO UPDATE SET designation = EXCLUDED.designation, annual_ctc = EXCLUDED.annual_ctc, status = EXCLUDED.status;",
        )
        .bind(&new_offer_id)
        .bind(id)
        .bind(&name)
        .bind(&role)
        .bind(&annual_ctc_str)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        info!(
            "[Repository] Atomically converted candidate '{}' to employee '{}' and created offer letter '{}'",
            id, new_id, new_offer_id
        );

        Ok(new_emp)
    }

    // ========================================================================
    // OFFER LETTERS
    // ========================================================================

    pub async fn list_offer_letters(&self) -> Result<Vec<OfferLetter>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, candidate_id, candidate_name, designation, 
                    coalesce(department, '') as department, annual_ctc, joining_date,
                    coalesce(offer_date, '') as offer_date, valid_till, 
                    coalesce(approved_by, '—') as approved_by, 
                    coalesce(offer_letter_file, '—') as offer_letter_file, 
                    status, archived,
                    coalesce(created_at, '21 Oct 2026, 12:59 pm') as created_at,
                    coalesce(updated_at, '21 Oct 2026, 12:59 pm') as updated_at,
                    coalesce(history, '[]') as history
             FROM offer_letters ORDER BY id ASC;",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| OfferLetter {
                id: r.get("id"),
                candidate_id: r
                    .get::<Option<String>, _>("candidate_id")
                    .unwrap_or_default(),
                candidate_name: r.get("candidate_name"),
                designation: r.get("designation"),
                department: Some(r.get("department")),
                annual_ctc: r.get("annual_ctc"),
                joining_date: r.get("joining_date"),
                offer_date: Some(r.get("offer_date")),
                valid_till: r.get("valid_till"),
                approved_by: Some(r.get("approved_by")),
                offer_letter_file: Some(r.get("offer_letter_file")),
                status: r.get("status"),
                archived: r.get("archived"),
                created_at: Some(r.get("created_at")),
                updated_at: Some(r.get("updated_at")),
                history: r
                    .get::<Option<String>, _>("history")
                    .and_then(|h| serde_json::from_str(&h).ok()),
            })
            .collect())
    }

    pub async fn create_offer_letter(
        &self,
        offer: OfferLetter,
    ) -> Result<OfferLetter, sqlx::Error> {
        let history_str = offer
            .history
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_else(|_| "[]".to_string()))
            .unwrap_or_else(|| "[]".to_string());

        let dept = offer.department.as_deref().unwrap_or("");
        let odate = offer.offer_date.as_deref().unwrap_or("");
        let appby = offer.approved_by.as_deref().unwrap_or("—");
        let ofile = offer.offer_letter_file.as_deref().unwrap_or("—");
        let cat = offer
            .created_at
            .as_deref()
            .unwrap_or("21 Oct 2026, 12:59 pm");
        let uat = offer
            .updated_at
            .as_deref()
            .unwrap_or("21 Oct 2026, 12:59 pm");

        sqlx::query(
            "INSERT INTO offer_letters (id, candidate_id, candidate_name, designation, department, annual_ctc, joining_date,
                    offer_date, valid_till, approved_by, offer_letter_file, status, archived, created_at, updated_at, history)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO UPDATE SET designation = EXCLUDED.designation, department = EXCLUDED.department,
                annual_ctc = EXCLUDED.annual_ctc, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at, history = EXCLUDED.history;"
        )
        .bind(&offer.id)
        .bind(&offer.candidate_id)
        .bind(&offer.candidate_name)
        .bind(&offer.designation)
        .bind(dept)
        .bind(&offer.annual_ctc)
        .bind(&offer.joining_date)
        .bind(odate)
        .bind(&offer.valid_till)
        .bind(appby)
        .bind(ofile)
        .bind(&offer.status)
        .bind(offer.archived.unwrap_or(false))
        .bind(cat)
        .bind(uat)
        .bind(&history_str)
        .execute(&self.pool)
        .await?;

        Ok(offer)
    }

    pub async fn update_offer_letter(
        &self,
        id: &str,
        offer: OfferLetter,
    ) -> Result<OfferLetter, sqlx::Error> {
        let history_str = offer
            .history
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_else(|_| "[]".to_string()))
            .unwrap_or_else(|| "[]".to_string());

        let dept = offer.department.as_deref().unwrap_or("");
        let odate = offer.offer_date.as_deref().unwrap_or("");
        let appby = offer.approved_by.as_deref().unwrap_or("—");
        let ofile = offer.offer_letter_file.as_deref().unwrap_or("—");
        let uat = offer
            .updated_at
            .as_deref()
            .unwrap_or("21 Oct 2026, 12:59 pm");

        sqlx::query(
            "UPDATE offer_letters SET candidate_name = $1, designation = $2, department = $3, annual_ctc = $4,
                    joining_date = $5, offer_date = $6, valid_till = $7, approved_by = $8, offer_letter_file = $9,
                    status = $10, archived = $11, updated_at = $12, history = $13
             WHERE id = $14;"
        )
        .bind(&offer.candidate_name)
        .bind(&offer.designation)
        .bind(dept)
        .bind(&offer.annual_ctc)
        .bind(&offer.joining_date)
        .bind(odate)
        .bind(&offer.valid_till)
        .bind(appby)
        .bind(ofile)
        .bind(&offer.status)
        .bind(offer.archived.unwrap_or(false))
        .bind(uat)
        .bind(&history_str)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(offer)
    }

    pub async fn delete_offer_letter(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM offer_letters WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    // ========================================================================
    // DASHBOARD STATS (Aggregated directly in PostgreSQL)
    // ========================================================================

    pub async fn get_dashboard_stats(&self) -> Result<DashboardStats, sqlx::Error> {
        let total_jobs: i64 = sqlx::query("SELECT count(*) as c FROM jobs;")
            .fetch_one(&self.pool)
            .await?
            .get("c");
        let total_candidates: i64 = sqlx::query("SELECT count(*) as c FROM candidates;")
            .fetch_one(&self.pool)
            .await?
            .get("c");
        let shortlisted_candidates: i64 = sqlx::query(
            "SELECT count(*) as c FROM candidates WHERE status IN ('Shortlisted', 'Screening');",
        )
        .fetch_one(&self.pool)
        .await?
        .get("c");
        let scheduled_interviews: i64 =
            sqlx::query("SELECT count(*) as c FROM interviews WHERE status = 'Scheduled';")
                .fetch_one(&self.pool)
                .await?
                .get("c");
        let selected_candidates: i64 = sqlx::query(
            "SELECT count(*) as c FROM candidates WHERE status IN ('Selected', 'Offer', 'Hired');",
        )
        .fetch_one(&self.pool)
        .await?
        .get("c");
        let total_employees: i64 = sqlx::query("SELECT count(*) as c FROM employees;")
            .fetch_one(&self.pool)
            .await?
            .get("c");
        let active_employees: i64 =
            sqlx::query("SELECT count(*) as c FROM employees WHERE lower(status) = 'active';")
                .fetch_one(&self.pool)
                .await?
                .get("c");
        let employees_on_leave: i64 =
            sqlx::query("SELECT count(*) as c FROM employees WHERE lower(status) = 'on leave';")
                .fetch_one(&self.pool)
                .await?
                .get("c");
        let avg_goal_prog: i64 = sqlx::query(
            "SELECT coalesce(round(avg(progress))::bigint, 75)::bigint as c FROM goals;",
        )
        .fetch_one(&self.pool)
        .await?
        .get("c");
        let pending_reviews: i64 =
            sqlx::query("SELECT count(*) as c FROM reviews WHERE status = 'Pending Review';")
                .fetch_one(&self.pool)
                .await?
                .get("c");

        Ok(DashboardStats {
            total_jobs: total_jobs as usize,
            total_candidates: total_candidates as usize,
            shortlisted_candidates: shortlisted_candidates as usize,
            scheduled_interviews: scheduled_interviews as usize,
            selected_candidates: selected_candidates as usize,
            total_employees: total_employees as usize,
            active_employees: active_employees as usize,
            employees_on_leave: employees_on_leave as usize,
            goal_completion_rate: avg_goal_prog as usize,
            pending_reviews: pending_reviews as usize,
        })
    }

    // ========================================================================
    // SERVICE REQUESTS
    // ========================================================================

    pub async fn list_service_requests(
        &self,
        employee_id: Option<&str>,
    ) -> Result<Vec<ServiceRequest>, sqlx::Error> {
        let rows = if let Some(emp_id) = employee_id {
            sqlx::query(
                "SELECT id, employee_id, employee_name, category, subject, priority, details, status, created_at, updated_at 
                 FROM service_requests WHERE employee_id = $1 ORDER BY id DESC;"
            )
            .bind(emp_id)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query(
                "SELECT id, employee_id, employee_name, category, subject, priority, details, status, created_at, updated_at 
                 FROM service_requests ORDER BY id DESC;"
            )
            .fetch_all(&self.pool)
            .await?
        };

        Ok(rows
            .into_iter()
            .map(|r| ServiceRequest {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                employee_name: r.get("employee_name"),
                category: r.get("category"),
                subject: r.get("subject"),
                priority: r.get("priority"),
                details: r.get("details"),
                status: r.get("status"),
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
            })
            .collect())
    }

    pub async fn create_service_request(
        &self,
        mut req: ServiceRequest,
    ) -> Result<ServiceRequest, sqlx::Error> {
        if req.id.is_empty() {
            let count_row = sqlx::query("SELECT count(*) as c FROM service_requests;")
                .fetch_one(&self.pool)
                .await?;
            let count: i64 = count_row.get("c");
            req.id = format!("REQ-{:04}", count + 1);
        }

        sqlx::query(
            "INSERT INTO service_requests (id, employee_id, employee_name, category, subject, priority, details, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;"
        )
        .bind(&req.id)
        .bind(&req.employee_id)
        .bind(&req.employee_name)
        .bind(&req.category)
        .bind(&req.subject)
        .bind(&req.priority)
        .bind(&req.details)
        .bind(&req.status)
        .bind(&req.created_at)
        .bind(&req.updated_at)
        .execute(&self.pool)
        .await?;

        Ok(req)
    }

    // ========================================================================
    // EMPLOYEE DEPENDENTS (Family Tab)
    // ========================================================================

    pub async fn list_dependents(
        &self,
        emp_id: &str,
    ) -> Result<Vec<EmployeeDependent>, sqlx::Error> {
        let rows = if emp_id.is_empty() || emp_id == "all" {
            sqlx::query("SELECT id, employee_id, name, relationship, dob, coalesce(created_at, '') as created_at FROM employee_dependents ORDER BY id ASC;")
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query("SELECT id, employee_id, name, relationship, dob, coalesce(created_at, '') as created_at FROM employee_dependents WHERE employee_id = $1 ORDER BY id ASC;")
                .bind(emp_id)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows
            .into_iter()
            .map(|r| EmployeeDependent {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                name: r.get("name"),
                relationship: r.get("relationship"),
                dob: r.get("dob"),
                created_at: Some(r.get("created_at")),
            })
            .collect())
    }

    pub async fn create_dependent(
        &self,
        mut dep: EmployeeDependent,
    ) -> Result<EmployeeDependent, sqlx::Error> {
        if dep.id.is_empty() {
            let count_row = sqlx::query("SELECT count(*) as c FROM employee_dependents;")
                .fetch_one(&self.pool)
                .await?;
            let count: i64 = count_row.get("c");
            dep.id = format!("DEP-{:04}", count + 1);
        }

        sqlx::query(
            "INSERT INTO employee_dependents (id, employee_id, name, relationship, dob, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, relationship = EXCLUDED.relationship, dob = EXCLUDED.dob;"
        )
        .bind(&dep.id)
        .bind(&dep.employee_id)
        .bind(&dep.name)
        .bind(&dep.relationship)
        .bind(&dep.dob)
        .bind(dep.created_at.as_deref().unwrap_or(""))
        .execute(&self.pool)
        .await?;

        Ok(dep)
    }

    pub async fn delete_dependent(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM employee_dependents WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }

    // ========================================================================
    // JOINING FORMALITIES
    // ========================================================================

    pub async fn list_joining_formalities(
        &self,
        filter_status: Option<&str>,
        search: Option<&str>,
    ) -> Result<Vec<JoiningRecord>, sqlx::Error> {
        let base_sql = "SELECT id, candidate_id, offer_letter_id, employee_id, candidate_name, employee_name,
                               joining_date, department, designation, reporting_manager, documents_submitted,
                               documents_verified, verification_status, joining_status, remarks,
                               documents_collected, id_card_issued, work_email_created, laptop_issued,
                               pf_nomination_form, appointment_letter_issued, archived, history,
                               created_at, updated_at
                        FROM joining_formalities WHERE 1=1";

        let mut conditions = String::new();
        if let Some(st) = filter_status {
            if !st.is_empty() && st != "All" {
                conditions.push_str(&format!(
                    " AND (lower(joining_status) = lower('{}') OR lower(status) = lower('{}'))",
                    st.replace('\'', "''"),
                    st.replace('\'', "''")
                ));
            }
        }
        if let Some(q) = search {
            if !q.trim().is_empty() {
                let clean_q = q.trim().replace('\'', "''");
                conditions.push_str(&format!(
                    " AND (candidate_name ILIKE '%{clean_q}%' OR employee_name ILIKE '%{clean_q}%' OR id ILIKE '%{clean_q}%' OR employee_id ILIKE '%{clean_q}%')"
                ));
            }
        }

        let full_sql = format!("{base_sql}{conditions} ORDER BY id DESC;");
        let rows = sqlx::query(sqlx::AssertSqlSafe(full_sql.as_str()))
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let history_str: String = r.get("history");
                let history: Option<Vec<AuditHistoryItem>> =
                    serde_json::from_str(&history_str).ok();
                let status_val: String = r.get("joining_status");
                let notes_val: String = r.get("remarks");

                JoiningRecord {
                    id: r.get("id"),
                    candidate_id: Some(r.get("candidate_id")),
                    offer_letter_id: Some(r.get("offer_letter_id")),
                    employee_id: Some(r.get("employee_id")),
                    candidate_name: Some(r.get("candidate_name")),
                    employee_name: Some(r.get("employee_name")),
                    joining_date: r.get("joining_date"),
                    department: Some(r.get("department")),
                    designation: Some(r.get("designation")),
                    reporting_manager: Some(r.get("reporting_manager")),
                    documents_submitted: Some(r.get("documents_submitted")),
                    documents_verified: Some(r.get("documents_verified")),
                    verification_status: Some(r.get("verification_status")),
                    joining_status: Some(status_val.clone()),
                    remarks: Some(notes_val.clone()),
                    documents_collected: Some(r.get("documents_collected")),
                    id_card_issued: Some(r.get("id_card_issued")),
                    work_email_created: Some(r.get("work_email_created")),
                    laptop_issued: Some(r.get("laptop_issued")),
                    pf_nomination_form: Some(r.get("pf_nomination_form")),
                    appointment_letter_issued: Some(r.get("appointment_letter_issued")),
                    status: Some(status_val),
                    notes: Some(notes_val),
                    archived: Some(r.get("archived")),
                    history,
                    created_at: Some(r.get("created_at")),
                    updated_at: Some(r.get("updated_at")),
                }
            })
            .collect())
    }

    pub async fn get_joining_formality(
        &self,
        id: &str,
    ) -> Result<Option<JoiningRecord>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, candidate_id, offer_letter_id, employee_id, candidate_name, employee_name,
                    joining_date, department, designation, reporting_manager, documents_submitted,
                    documents_verified, verification_status, joining_status, remarks,
                    documents_collected, id_card_issued, work_email_created, laptop_issued,
                    pf_nomination_form, appointment_letter_issued, archived, history,
                    created_at, updated_at
             FROM joining_formalities WHERE id = $1 LIMIT 1;",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| {
            let history_str: String = r.get("history");
            let history: Option<Vec<AuditHistoryItem>> = serde_json::from_str(&history_str).ok();
            let status_val: String = r.get("joining_status");
            let notes_val: String = r.get("remarks");

            JoiningRecord {
                id: r.get("id"),
                candidate_id: Some(r.get("candidate_id")),
                offer_letter_id: Some(r.get("offer_letter_id")),
                employee_id: Some(r.get("employee_id")),
                candidate_name: Some(r.get("candidate_name")),
                employee_name: Some(r.get("employee_name")),
                joining_date: r.get("joining_date"),
                department: Some(r.get("department")),
                designation: Some(r.get("designation")),
                reporting_manager: Some(r.get("reporting_manager")),
                documents_submitted: Some(r.get("documents_submitted")),
                documents_verified: Some(r.get("documents_verified")),
                verification_status: Some(r.get("verification_status")),
                joining_status: Some(status_val.clone()),
                remarks: Some(notes_val.clone()),
                documents_collected: Some(r.get("documents_collected")),
                id_card_issued: Some(r.get("id_card_issued")),
                work_email_created: Some(r.get("work_email_created")),
                laptop_issued: Some(r.get("laptop_issued")),
                pf_nomination_form: Some(r.get("pf_nomination_form")),
                appointment_letter_issued: Some(r.get("appointment_letter_issued")),
                status: Some(status_val),
                notes: Some(notes_val),
                archived: Some(r.get("archived")),
                history,
                created_at: Some(r.get("created_at")),
                updated_at: Some(r.get("updated_at")),
            }
        }))
    }

    pub async fn create_joining_formality(
        &self,
        mut record: JoiningRecord,
    ) -> Result<JoiningRecord, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        if record.id.is_empty() {
            let count_row = sqlx::query("SELECT count(*) as c FROM joining_formalities;")
                .fetch_one(&self.pool)
                .await?;
            let count: i64 = count_row.get("c");
            record.id = format!("JN-{:03}", count + 1);
        }

        if record.created_at.as_deref().unwrap_or("").is_empty() {
            record.created_at = Some(now_str.clone());
        }
        record.updated_at = Some(now_str.clone());

        let joining_status = record
            .joining_status
            .or(record.status)
            .unwrap_or_else(|| "Pending".to_string());
        let remarks = record.remarks.or(record.notes).unwrap_or_default();

        let cand_name = record
            .candidate_name
            .or(record.employee_name.clone())
            .unwrap_or_default();
        let emp_name = record
            .employee_name
            .or(Some(cand_name.clone()))
            .unwrap_or_default();

        let history_list = record.history.unwrap_or_else(|| {
            vec![AuditHistoryItem {
                status: joining_status.clone(),
                timestamp: now_str,
                user: "ananya.rao@brightcone.ai".to_string(),
            }]
        });
        let history_json =
            serde_json::to_string(&history_list).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "INSERT INTO joining_formalities (
                id, candidate_id, offer_letter_id, employee_id, candidate_name, employee_name,
                joining_date, department, designation, reporting_manager, documents_submitted,
                documents_verified, verification_status, joining_status, remarks,
                documents_collected, id_card_issued, work_email_created, laptop_issued,
                pf_nomination_form, appointment_letter_issued, archived, history,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
            )
            ON CONFLICT (id) DO UPDATE SET
                candidate_id = EXCLUDED.candidate_id,
                offer_letter_id = EXCLUDED.offer_letter_id,
                employee_id = EXCLUDED.employee_id,
                candidate_name = EXCLUDED.candidate_name,
                employee_name = EXCLUDED.employee_name,
                joining_date = EXCLUDED.joining_date,
                department = EXCLUDED.department,
                designation = EXCLUDED.designation,
                reporting_manager = EXCLUDED.reporting_manager,
                documents_submitted = EXCLUDED.documents_submitted,
                documents_verified = EXCLUDED.documents_verified,
                verification_status = EXCLUDED.verification_status,
                joining_status = EXCLUDED.joining_status,
                remarks = EXCLUDED.remarks,
                documents_collected = EXCLUDED.documents_collected,
                id_card_issued = EXCLUDED.id_card_issued,
                work_email_created = EXCLUDED.work_email_created,
                laptop_issued = EXCLUDED.laptop_issued,
                pf_nomination_form = EXCLUDED.pf_nomination_form,
                appointment_letter_issued = EXCLUDED.appointment_letter_issued,
                archived = EXCLUDED.archived,
                history = EXCLUDED.history,
                updated_at = EXCLUDED.updated_at;",
        )
        .bind(&record.id)
        .bind(record.candidate_id.as_deref().unwrap_or(""))
        .bind(record.offer_letter_id.as_deref().unwrap_or(""))
        .bind(record.employee_id.as_deref().unwrap_or(""))
        .bind(&cand_name)
        .bind(&emp_name)
        .bind(&record.joining_date)
        .bind(record.department.as_deref().unwrap_or(""))
        .bind(record.designation.as_deref().unwrap_or(""))
        .bind(record.reporting_manager.as_deref().unwrap_or(""))
        .bind(record.documents_submitted.as_deref().unwrap_or(""))
        .bind(record.documents_verified.unwrap_or(false))
        .bind(record.verification_status.as_deref().unwrap_or("Pending"))
        .bind(&joining_status)
        .bind(&remarks)
        .bind(record.documents_collected.as_deref().unwrap_or("No"))
        .bind(record.id_card_issued.as_deref().unwrap_or("No"))
        .bind(record.work_email_created.as_deref().unwrap_or("No"))
        .bind(record.laptop_issued.as_deref().unwrap_or("No"))
        .bind(record.pf_nomination_form.as_deref().unwrap_or("No"))
        .bind(record.appointment_letter_issued.as_deref().unwrap_or("No"))
        .bind(record.archived.unwrap_or(false))
        .bind(&history_json)
        .bind(record.created_at.as_deref().unwrap_or(""))
        .bind(record.updated_at.as_deref().unwrap_or(""))
        .execute(&self.pool)
        .await?;

        record.candidate_name = Some(cand_name);
        record.employee_name = Some(emp_name);
        record.joining_status = Some(joining_status.clone());
        record.status = Some(joining_status);
        record.remarks = Some(remarks.clone());
        record.notes = Some(remarks);
        record.history = Some(history_list);

        Ok(record)
    }

    pub async fn update_joining_formality(
        &self,
        id: &str,
        mut record: JoiningRecord,
    ) -> Result<JoiningRecord, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");
        record.updated_at = Some(now_str);

        let joining_status = record
            .joining_status
            .or(record.status.clone())
            .unwrap_or_else(|| "Pending".to_string());
        let remarks = record.remarks.or(record.notes.clone()).unwrap_or_default();

        let history_json = serde_json::to_string(&record.history.clone().unwrap_or_default())
            .unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "UPDATE joining_formalities SET
                candidate_id = $1, offer_letter_id = $2, employee_id = $3, candidate_name = $4,
                employee_name = $5, joining_date = $6, department = $7, designation = $8,
                reporting_manager = $9, documents_submitted = $10, documents_verified = $11,
                verification_status = $12, joining_status = $13, remarks = $14,
                documents_collected = $15, id_card_issued = $16, work_email_created = $17,
                laptop_issued = $18, pf_nomination_form = $19, appointment_letter_issued = $20,
                archived = $21, history = $22, updated_at = $23
             WHERE id = $24;",
        )
        .bind(record.candidate_id.as_deref().unwrap_or(""))
        .bind(record.offer_letter_id.as_deref().unwrap_or(""))
        .bind(record.employee_id.as_deref().unwrap_or(""))
        .bind(record.candidate_name.as_deref().unwrap_or(""))
        .bind(record.employee_name.as_deref().unwrap_or(""))
        .bind(&record.joining_date)
        .bind(record.department.as_deref().unwrap_or(""))
        .bind(record.designation.as_deref().unwrap_or(""))
        .bind(record.reporting_manager.as_deref().unwrap_or(""))
        .bind(record.documents_submitted.as_deref().unwrap_or(""))
        .bind(record.documents_verified.unwrap_or(false))
        .bind(record.verification_status.as_deref().unwrap_or("Pending"))
        .bind(&joining_status)
        .bind(&remarks)
        .bind(record.documents_collected.as_deref().unwrap_or("No"))
        .bind(record.id_card_issued.as_deref().unwrap_or("No"))
        .bind(record.work_email_created.as_deref().unwrap_or("No"))
        .bind(record.laptop_issued.as_deref().unwrap_or("No"))
        .bind(record.pf_nomination_form.as_deref().unwrap_or("No"))
        .bind(record.appointment_letter_issued.as_deref().unwrap_or("No"))
        .bind(record.archived.unwrap_or(false))
        .bind(&history_json)
        .bind(record.updated_at.as_deref().unwrap_or(""))
        .bind(id)
        .execute(&self.pool)
        .await?;

        record.id = id.to_string();
        record.joining_status = Some(joining_status.clone());
        record.status = Some(joining_status);
        record.remarks = Some(remarks.clone());
        record.notes = Some(remarks);

        Ok(record)
    }

    pub async fn update_joining_status(
        &self,
        id: &str,
        status: &str,
        remarks: Option<&str>,
        user: &str,
    ) -> Result<JoiningRecord, sqlx::Error> {
        let current = self
            .get_joining_formality(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        let mut history = current.history.clone().unwrap_or_default();
        history.insert(
            0,
            AuditHistoryItem {
                status: status.to_string(),
                timestamp: now_str.clone(),
                user: user.to_string(),
            },
        );
        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        let final_remarks = if let Some(r) = remarks {
            r.to_string()
        } else {
            current.remarks.clone().unwrap_or_default()
        };

        sqlx::query(
            "UPDATE joining_formalities SET
                joining_status = $1, remarks = $2, history = $3, updated_at = $4
             WHERE id = $5;",
        )
        .bind(status)
        .bind(&final_remarks)
        .bind(&history_json)
        .bind(&now_str)
        .bind(id)
        .execute(&self.pool)
        .await?;

        let mut updated = current;
        updated.joining_status = Some(status.to_string());
        updated.status = Some(status.to_string());
        updated.remarks = Some(final_remarks.clone());
        updated.notes = Some(final_remarks);
        updated.history = Some(history);
        updated.updated_at = Some(now_str);

        Ok(updated)
    }

    pub async fn update_joining_documents(
        &self,
        id: &str,
        payload: UpdateJoiningDocumentsPayload,
    ) -> Result<JoiningRecord, sqlx::Error> {
        let current = self
            .get_joining_formality(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        let docs_submitted = payload
            .documents_submitted
            .or_else(|| current.documents_submitted.clone())
            .unwrap_or_default();
        let docs_verified = payload
            .documents_verified
            .or(current.documents_verified)
            .unwrap_or(false);
        let ver_status = payload
            .verification_status
            .or_else(|| current.verification_status.clone())
            .unwrap_or_else(|| "Pending".to_string());
        let docs_col = payload
            .documents_collected
            .or_else(|| current.documents_collected.clone())
            .unwrap_or_else(|| "No".to_string());
        let id_card = payload
            .id_card_issued
            .or_else(|| current.id_card_issued.clone())
            .unwrap_or_else(|| "No".to_string());
        let email = payload
            .work_email_created
            .or_else(|| current.work_email_created.clone())
            .unwrap_or_else(|| "No".to_string());
        let laptop = payload
            .laptop_issued
            .or_else(|| current.laptop_issued.clone())
            .unwrap_or_else(|| "No".to_string());
        let pf = payload
            .pf_nomination_form
            .or_else(|| current.pf_nomination_form.clone())
            .unwrap_or_else(|| "No".to_string());
        let app_letter = payload
            .appointment_letter_issued
            .or_else(|| current.appointment_letter_issued.clone())
            .unwrap_or_else(|| "No".to_string());
        let remarks = payload
            .remarks
            .or_else(|| current.remarks.clone())
            .unwrap_or_default();

        sqlx::query(
            "UPDATE joining_formalities SET
                documents_submitted = $1, documents_verified = $2, verification_status = $3,
                documents_collected = $4, id_card_issued = $5, work_email_created = $6,
                laptop_issued = $7, pf_nomination_form = $8, appointment_letter_issued = $9,
                remarks = $10, updated_at = $11
             WHERE id = $12;",
        )
        .bind(&docs_submitted)
        .bind(docs_verified)
        .bind(&ver_status)
        .bind(&docs_col)
        .bind(&id_card)
        .bind(&email)
        .bind(&laptop)
        .bind(&pf)
        .bind(&app_letter)
        .bind(&remarks)
        .bind(&now_str)
        .bind(id)
        .execute(&self.pool)
        .await?;

        let mut updated = current;
        updated.documents_submitted = Some(docs_submitted);
        updated.documents_verified = Some(docs_verified);
        updated.verification_status = Some(ver_status);
        updated.documents_collected = Some(docs_col);
        updated.id_card_issued = Some(id_card);
        updated.work_email_created = Some(email);
        updated.laptop_issued = Some(laptop);
        updated.pf_nomination_form = Some(pf);
        updated.appointment_letter_issued = Some(app_letter);
        updated.remarks = Some(remarks.clone());
        updated.notes = Some(remarks);
        updated.updated_at = Some(now_str);

        Ok(updated)
    }

    /// Complete joining formalities and link or create the employee record atomically.
    /// Completely prevents duplicate employee creation even on repeated invocations.
    pub async fn complete_joining_and_link_employee(
        &self,
        id: &str,
        specified_emp_id: Option<&str>,
    ) -> Result<(JoiningRecord, Employee), sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let row = sqlx::query(
            "SELECT id, candidate_id, offer_letter_id, employee_id, candidate_name, employee_name,
                    joining_date, department, designation, reporting_manager, documents_submitted,
                    documents_verified, verification_status, joining_status, remarks,
                    documents_collected, id_card_issued, work_email_created, laptop_issued,
                    pf_nomination_form, appointment_letter_issued, archived, history,
                    created_at, updated_at
             FROM joining_formalities WHERE id = $1 FOR UPDATE;",
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await?;

        let current_emp_id: String = row.get("employee_id");
        let candidate_id: String = row.get("candidate_id");
        let candidate_name: String = row.get("candidate_name");
        let employee_name: String = row.get("employee_name");
        let department: String = row.get("department");
        let designation: String = row.get("designation");
        let reporting_manager: String = row.get("reporting_manager");
        let joining_date: String = row.get("joining_date");
        let history_str: String = row.get("history");

        let primary_name = if !employee_name.trim().is_empty() {
            employee_name
        } else if !candidate_name.trim().is_empty() {
            candidate_name
        } else {
            "New Employee".to_string()
        };

        // Determine target employee ID
        let target_emp_id = if let Some(e) = specified_emp_id {
            if !e.trim().is_empty() && e != "—" {
                e.trim().to_string()
            } else {
                current_emp_id.trim().to_string()
            }
        } else {
            current_emp_id.trim().to_string()
        };

        // Check if employee record already exists
        let existing_emp_row = if !target_emp_id.is_empty() && target_emp_id != "—" {
            sqlx::query(
                "SELECT id, name, role, department, grade, location, manager, status, email
                 FROM employees WHERE id = $1 LIMIT 1;",
            )
            .bind(&target_emp_id)
            .fetch_optional(&mut *tx)
            .await?
        } else {
            None
        };

        let employee = if let Some(er) = existing_emp_row {
            // Re-use existing employee without duplicating
            Employee {
                id: er.get("id"),
                name: er.get("name"),
                role: er.get("role"),
                department: er.get("department"),
                grade: er.get("grade"),
                location: er.get("location"),
                manager: er.get("manager"),
                status: er.get("status"),
                email: er.get("email"),
            }
        } else {
            // Generate next available employee ID
            let count_row = sqlx::query("SELECT count(*) as count FROM employees;")
                .fetch_one(&mut *tx)
                .await?;
            let count: i64 = count_row.get("count");
            let new_emp_id = format!("BC-{}", 1050 + count + 1);

            let emp_email = format!(
                "{}.emp@brightcone.ai",
                primary_name.to_lowercase().replace(' ', ".")
            );

            let dept = if department.is_empty() {
                "Engineering".to_string()
            } else {
                department
            };
            let desig = if designation.is_empty() {
                "Associate".to_string()
            } else {
                designation
            };
            let mgr = if reporting_manager.is_empty() {
                "Ananya Rao".to_string()
            } else {
                reporting_manager
            };

            let new_emp = Employee {
                id: new_emp_id.clone(),
                name: primary_name.clone(),
                role: desig,
                department: dept,
                grade: "L4".to_string(),
                location: "Hyderabad".to_string(),
                manager: mgr,
                status: "Active".to_string(),
                email: emp_email,
            };

            sqlx::query(
                "INSERT INTO employees (id, name, role, department, grade, location, manager, status, email, joined_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (id) DO NOTHING;"
            )
            .bind(&new_emp.id)
            .bind(&new_emp.name)
            .bind(&new_emp.role)
            .bind(&new_emp.department)
            .bind(&new_emp.grade)
            .bind(&new_emp.location)
            .bind(&new_emp.manager)
            .bind(&new_emp.status)
            .bind(&new_emp.email)
            .bind(&joining_date)
            .execute(&mut *tx)
            .await?;

            new_emp
        };

        // Update joining record to link employee and mark completed
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&mut *tx)
                .await?;
        let now_str: String = now_row.get("now_str");

        let mut history: Vec<AuditHistoryItem> =
            serde_json::from_str(&history_str).unwrap_or_default();
        history.insert(
            0,
            AuditHistoryItem {
                status: "Completed".to_string(),
                timestamp: now_str.clone(),
                user: "ananya.rao@brightcone.ai".to_string(),
            },
        );
        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "UPDATE joining_formalities SET
                employee_id = $1, employee_name = $2, joining_status = 'Completed',
                documents_verified = TRUE, verification_status = 'Verified',
                history = $3, updated_at = $4
             WHERE id = $5;",
        )
        .bind(&employee.id)
        .bind(&employee.name)
        .bind(&history_json)
        .bind(&now_str)
        .bind(id)
        .execute(&mut *tx)
        .await?;

        // If linked to candidate_trackers, mark candidate stage as Hired
        if !candidate_id.is_empty() && candidate_id != "—" {
            let _ = sqlx::query(
                "UPDATE candidate_trackers SET stage = 'Hired', employee_id = $1 WHERE id = $2;",
            )
            .bind(&employee.id)
            .bind(&candidate_id)
            .execute(&mut *tx)
            .await;
        }

        tx.commit().await?;

        info!(
            "[Joining] Formality '{}' completed. Employee '{}' ({}) linked safely.",
            id, employee.name, employee.id
        );

        let updated_record = self.get_joining_formality(id).await?.unwrap();
        Ok((updated_record, employee))
    }

    pub async fn delete_joining_formality(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM joining_formalities WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(res.rows_affected() > 0)
    }

    // ========================================================================
    // ONBOARDING CHECKLISTS
    // ========================================================================

    pub async fn list_checklists(
        &self,
        employee_id: Option<&str>,
        status: Option<&str>,
    ) -> Result<Vec<OnboardingChecklist>, sqlx::Error> {
        let mut sql = "SELECT id, employee_id, employee_name, title, description, assigned_by,
                              start_date, due_date, status, completion_percentage, created_at, updated_at
                       FROM onboarding_checklists WHERE 1=1".to_string();

        if let Some(emp) = employee_id {
            if !emp.is_empty() && emp != "all" {
                sql.push_str(&format!(" AND employee_id = '{}'", emp.replace('\'', "''")));
            }
        }

        if let Some(st) = status {
            if !st.is_empty() && st != "All" {
                sql.push_str(&format!(
                    " AND lower(status) = lower('{}')",
                    st.replace('\'', "''")
                ));
            }
        }

        sql.push_str(" ORDER BY id DESC;");

        let chk_rows = sqlx::query(sqlx::AssertSqlSafe(sql.as_str()))
            .fetch_all(&self.pool)
            .await?;

        let mut checklists = Vec::new();
        for r in chk_rows {
            let chk_id: String = r.get("id");
            let items = self.list_checklist_items(&chk_id).await?;

            checklists.push(OnboardingChecklist {
                id: chk_id,
                employee_id: r.get("employee_id"),
                employee_name: Some(r.get("employee_name")),
                title: r.get("title"),
                description: Some(r.get("description")),
                assigned_by: Some(r.get("assigned_by")),
                start_date: Some(r.get("start_date")),
                due_date: Some(r.get("due_date")),
                status: r.get("status"),
                completion_percentage: r.get::<i32, _>("completion_percentage") as u32,
                items,
                created_at: Some(r.get("created_at")),
                updated_at: Some(r.get("updated_at")),
            });
        }

        Ok(checklists)
    }

    pub async fn get_checklist(
        &self,
        id: &str,
    ) -> Result<Option<OnboardingChecklist>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, employee_id, employee_name, title, description, assigned_by,
                    start_date, due_date, status, completion_percentage, created_at, updated_at
             FROM onboarding_checklists WHERE id = $1 LIMIT 1;",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(r) = row {
            let items = self.list_checklist_items(id).await?;
            Ok(Some(OnboardingChecklist {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                employee_name: Some(r.get("employee_name")),
                title: r.get("title"),
                description: Some(r.get("description")),
                assigned_by: Some(r.get("assigned_by")),
                start_date: Some(r.get("start_date")),
                due_date: Some(r.get("due_date")),
                status: r.get("status"),
                completion_percentage: r.get::<i32, _>("completion_percentage") as u32,
                items,
                created_at: Some(r.get("created_at")),
                updated_at: Some(r.get("updated_at")),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn list_checklist_items(
        &self,
        checklist_id: &str,
    ) -> Result<Vec<OnboardingChecklistItem>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, checklist_id, title, description, assigned_to, due_date, status,
                    completed_at, created_at, updated_at
             FROM onboarding_checklist_items WHERE checklist_id = $1 ORDER BY id ASC;",
        )
        .bind(checklist_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let title: String = r.get("title");
                let desc: String = r.get("description");
                let assigned: String = r.get("assigned_to");
                let comp: String = r.get("completed_at");
                OnboardingChecklistItem {
                    id: r.get("id"),
                    checklist_id: r.get("checklist_id"),
                    title: title.clone(),
                    task: Some(title),
                    description: Some(desc.clone()),
                    notes: Some(desc),
                    assigned_to: Some(assigned.clone()),
                    owner: Some(assigned),
                    due_date: Some(r.get("due_date")),
                    status: r.get("status"),
                    completed_at: Some(comp.clone()),
                    completed_on: Some(comp),
                    created_at: Some(r.get("created_at")),
                    updated_at: Some(r.get("updated_at")),
                    ..Default::default()
                }
            })
            .collect())
    }

    pub async fn create_checklist(
        &self,
        mut checklist: OnboardingChecklist,
        initial_items: Vec<OnboardingChecklistItem>,
    ) -> Result<OnboardingChecklist, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&mut *tx)
                .await?;
        let now_str: String = now_row.get("now_str");

        if checklist.id.is_empty() {
            let count_row = sqlx::query("SELECT count(*) as c FROM onboarding_checklists;")
                .fetch_one(&mut *tx)
                .await?;
            let count: i64 = count_row.get("c");
            checklist.id = format!("CHK-{:03}", count + 1);
        }

        // Fetch employee name if not provided
        let emp_name = if checklist.employee_name.as_deref().unwrap_or("").is_empty() {
            let emp_row = sqlx::query("SELECT name FROM employees WHERE id = $1 LIMIT 1;")
                .bind(&checklist.employee_id)
                .fetch_optional(&mut *tx)
                .await?;
            emp_row
                .map(|r| r.get::<String, _>("name"))
                .unwrap_or_else(|| "Employee".to_string())
        } else {
            checklist.employee_name.unwrap()
        };

        checklist.created_at = Some(now_str.clone());
        checklist.updated_at = Some(now_str.clone());

        sqlx::query(
            "INSERT INTO onboarding_checklists (
                id, employee_id, employee_name, title, description, assigned_by,
                start_date, due_date, status, completion_percentage, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', 0, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title, description = EXCLUDED.description,
                assigned_by = EXCLUDED.assigned_by, due_date = EXCLUDED.due_date,
                updated_at = EXCLUDED.updated_at;",
        )
        .bind(&checklist.id)
        .bind(&checklist.employee_id)
        .bind(&emp_name)
        .bind(&checklist.title)
        .bind(checklist.description.as_deref().unwrap_or(""))
        .bind(checklist.assigned_by.as_deref().unwrap_or("People Ops"))
        .bind(checklist.start_date.as_deref().unwrap_or(""))
        .bind(checklist.due_date.as_deref().unwrap_or(""))
        .bind(checklist.created_at.as_deref().unwrap_or(""))
        .bind(checklist.updated_at.as_deref().unwrap_or(""))
        .execute(&mut *tx)
        .await?;

        // Insert initial items
        let mut created_items = Vec::new();
        for (idx, mut item) in initial_items.into_iter().enumerate() {
            if item.id.is_empty() {
                item.id = format!("{}-ITEM-{:02}", checklist.id, idx + 1);
            }
            item.checklist_id = checklist.id.clone();
            item.created_at = Some(now_str.clone());
            item.updated_at = Some(now_str.clone());

            sqlx::query(
                "INSERT INTO onboarding_checklist_items (
                    id, checklist_id, title, description, assigned_to, due_date, status,
                    completed_at, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
            )
            .bind(&item.id)
            .bind(&item.checklist_id)
            .bind(&item.title)
            .bind(item.description.as_deref().unwrap_or(""))
            .bind(item.assigned_to.as_deref().unwrap_or("IT Ops"))
            .bind(item.due_date.as_deref().unwrap_or(""))
            .bind(&item.status)
            .bind(item.completed_at.as_deref().unwrap_or(""))
            .bind(item.created_at.as_deref().unwrap_or(""))
            .bind(item.updated_at.as_deref().unwrap_or(""))
            .execute(&mut *tx)
            .await?;

            created_items.push(item);
        }

        tx.commit().await?;

        // Calculate progress
        let _ = self.recalculate_checklist_progress(&checklist.id).await;

        checklist.employee_name = Some(emp_name);
        checklist.items = created_items;
        Ok(checklist)
    }

    pub async fn update_checklist(
        &self,
        id: &str,
        checklist: OnboardingChecklist,
    ) -> Result<OnboardingChecklist, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        sqlx::query(
            "UPDATE onboarding_checklists SET
                title = $1, description = $2, assigned_by = $3,
                start_date = $4, due_date = $5, updated_at = $6
             WHERE id = $7;",
        )
        .bind(&checklist.title)
        .bind(checklist.description.as_deref().unwrap_or(""))
        .bind(checklist.assigned_by.as_deref().unwrap_or(""))
        .bind(checklist.start_date.as_deref().unwrap_or(""))
        .bind(checklist.due_date.as_deref().unwrap_or(""))
        .bind(&now_str)
        .bind(id)
        .execute(&self.pool)
        .await?;

        self.get_checklist(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn add_checklist_item(
        &self,
        checklist_id: &str,
        mut item: OnboardingChecklistItem,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        if item.id.is_empty() {
            let count_row = sqlx::query(
                "SELECT count(*) as c FROM onboarding_checklist_items WHERE checklist_id = $1;",
            )
            .bind(checklist_id)
            .fetch_one(&self.pool)
            .await?;
            let count: i64 = count_row.get("c");
            item.id = format!("{}-ITEM-{:02}", checklist_id, count + 1);
        }

        item.checklist_id = checklist_id.to_string();
        item.created_at = Some(now_str.clone());
        item.updated_at = Some(now_str);

        sqlx::query(
            "INSERT INTO onboarding_checklist_items (
                id, checklist_id, title, description, assigned_to, due_date, status,
                completed_at, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
        )
        .bind(&item.id)
        .bind(&item.checklist_id)
        .bind(&item.title)
        .bind(item.description.as_deref().unwrap_or(""))
        .bind(item.assigned_to.as_deref().unwrap_or("IT Ops"))
        .bind(item.due_date.as_deref().unwrap_or(""))
        .bind(&item.status)
        .bind(item.completed_at.as_deref().unwrap_or(""))
        .bind(item.created_at.as_deref().unwrap_or(""))
        .bind(item.updated_at.as_deref().unwrap_or(""))
        .execute(&self.pool)
        .await?;

        self.recalculate_checklist_progress(checklist_id).await?;

        Ok(item)
    }

    pub async fn update_checklist_item(
        &self,
        checklist_id: &str,
        item_id: &str,
        payload: UpdateChecklistItemPayload,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        let cur_row = sqlx::query(
            "SELECT title, description, assigned_to, due_date, status, completed_at
             FROM onboarding_checklist_items WHERE id = $1 AND checklist_id = $2;",
        )
        .bind(item_id)
        .bind(checklist_id)
        .fetch_one(&self.pool)
        .await?;

        let title = payload.title.unwrap_or_else(|| cur_row.get("title"));
        let desc = payload
            .description
            .unwrap_or_else(|| cur_row.get("description"));
        let assigned = payload
            .assigned_to
            .unwrap_or_else(|| cur_row.get("assigned_to"));
        let due = payload.due_date.unwrap_or_else(|| cur_row.get("due_date"));
        let status = payload.status.unwrap_or_else(|| cur_row.get("status"));
        let completed_at = if status == "Completed" {
            now_str.clone()
        } else {
            String::new()
        };

        sqlx::query(
            "UPDATE onboarding_checklist_items SET
                title = $1, description = $2, assigned_to = $3, due_date = $4,
                status = $5, completed_at = $6, updated_at = $7
             WHERE id = $8 AND checklist_id = $9;",
        )
        .bind(&title)
        .bind(&desc)
        .bind(&assigned)
        .bind(&due)
        .bind(&status)
        .bind(&completed_at)
        .bind(&now_str)
        .bind(item_id)
        .bind(checklist_id)
        .execute(&self.pool)
        .await?;

        self.recalculate_checklist_progress(checklist_id).await?;

        Ok(OnboardingChecklistItem {
            id: item_id.to_string(),
            checklist_id: checklist_id.to_string(),
            title: title.clone(),
            task: Some(title),
            description: Some(desc.clone()),
            notes: Some(desc),
            assigned_to: Some(assigned.clone()),
            owner: Some(assigned),
            due_date: Some(due),
            status,
            completed_at: Some(completed_at.clone()),
            completed_on: Some(completed_at),
            created_at: None,
            updated_at: Some(now_str),
            ..Default::default()
        })
    }

    pub async fn update_item_status(
        &self,
        checklist_id: &str,
        item_id: &str,
        status: &str,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row =
            sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'DD Mon YYYY, HH12:MI am') as now_str;")
                .fetch_one(&self.pool)
                .await?;
        let now_str: String = now_row.get("now_str");

        let completed_at = if status == "Completed" {
            now_str.clone()
        } else {
            String::new()
        };

        sqlx::query(
            "UPDATE onboarding_checklist_items SET
                status = $1, completed_at = $2, updated_at = $3
             WHERE id = $4 AND checklist_id = $5;",
        )
        .bind(status)
        .bind(&completed_at)
        .bind(&now_str)
        .bind(item_id)
        .bind(checklist_id)
        .execute(&self.pool)
        .await?;

        self.recalculate_checklist_progress(checklist_id).await?;

        let row = sqlx::query(
            "SELECT id, checklist_id, title, description, assigned_to, due_date, status,
                    completed_at, created_at, updated_at
             FROM onboarding_checklist_items WHERE id = $1 AND checklist_id = $2;",
        )
        .bind(item_id)
        .bind(checklist_id)
        .fetch_one(&self.pool)
        .await?;

        let title: String = row.get("title");
        let desc: String = row.get("description");
        let assigned: String = row.get("assigned_to");
        let comp: String = row.get("completed_at");

        Ok(OnboardingChecklistItem {
            id: row.get("id"),
            checklist_id: row.get("checklist_id"),
            title: title.clone(),
            task: Some(title),
            description: Some(desc.clone()),
            notes: Some(desc),
            assigned_to: Some(assigned.clone()),
            owner: Some(assigned),
            due_date: Some(row.get("due_date")),
            status: row.get("status"),
            completed_at: Some(comp.clone()),
            completed_on: Some(comp),
            created_at: Some(row.get("created_at")),
            updated_at: Some(row.get("updated_at")),
            ..Default::default()
        })
    }

    /// Calculate completion percentage from actual item statuses and automatically transition checklist status.
    pub async fn recalculate_checklist_progress(
        &self,
        checklist_id: &str,
    ) -> Result<(u32, String), sqlx::Error> {
        let counts_row = sqlx::query(
            "SELECT count(*) as total,
                    count(*) FILTER (WHERE status = 'Completed') as completed
             FROM onboarding_checklist_items WHERE checklist_id = $1;",
        )
        .bind(checklist_id)
        .fetch_one(&self.pool)
        .await?;

        let total: i64 = counts_row.get("total");
        let completed: i64 = counts_row.get("completed");

        let (pct, new_status) = if total == 0 {
            (0, "Pending".to_string())
        } else {
            let percentage = ((completed as f64 / total as f64) * 100.0).round() as u32;
            let st = if percentage == 100 {
                "Completed".to_string()
            } else if percentage > 0 {
                "In Progress".to_string()
            } else {
                "Pending".to_string()
            };
            (percentage, st)
        };

        sqlx::query(
            "UPDATE onboarding_checklists SET
                completion_percentage = $1, status = $2
             WHERE id = $3;",
        )
        .bind(pct as i32)
        .bind(&new_status)
        .bind(checklist_id)
        .execute(&self.pool)
        .await?;

        Ok((pct, new_status))
    }

    pub async fn delete_checklist(&self, id: &str) -> Result<bool, sqlx::Error> {
        // Items cascade or delete items first
        let _ = sqlx::query("DELETE FROM onboarding_checklist_items WHERE checklist_id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await;

        let res = sqlx::query("DELETE FROM onboarding_checklists WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(res.rows_affected() > 0)
    }

    pub async fn delete_checklist_item(
        &self,
        checklist_id: &str,
        item_id: &str,
    ) -> Result<bool, sqlx::Error> {
        let res = sqlx::query(
            "DELETE FROM onboarding_checklist_items WHERE id = $1 AND checklist_id = $2;",
        )
        .bind(item_id)
        .bind(checklist_id)
        .execute(&self.pool)
        .await?;

        if res.rows_affected() > 0 {
            let _ = self.recalculate_checklist_progress(checklist_id).await;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    // Direct Onboarding Task Operations (Matching UI Reference)

    pub async fn next_onboarding_task_id(&self) -> Result<String, sqlx::Error> {
        let rows = sqlx::query("SELECT id FROM onboarding_checklist_items;")
            .fetch_all(&self.pool)
            .await?;
        let mut max_num: i64 = 0;
        for r in rows {
            let id: String = r.get("id");
            let num_part = id.strip_prefix("ONB-").or_else(|| id.strip_prefix("OB-"));
            if let Some(n_str) = num_part {
                if let Ok(num) = n_str.parse::<i64>() {
                    if num > max_num {
                        max_num = num;
                    }
                }
            }
        }
        let mut next_num = max_num + 1;
        loop {
            let candidate = format!("ONB-{:04}", next_num);
            let exists: (i64,) =
                sqlx::query_as("SELECT count(*) FROM onboarding_checklist_items WHERE id = $1;")
                    .bind(&candidate)
                    .fetch_one(&self.pool)
                    .await?;
            if exists.0 == 0 {
                return Ok(candidate);
            }
            next_num += 1;
        }
    }

    pub async fn list_all_onboarding_tasks(
        &self,
        employee_id: Option<&str>,
        status: Option<&str>,
        archived: Option<bool>,
        q: Option<&str>,
    ) -> Result<Vec<OnboardingChecklistItem>, sqlx::Error> {
        let mut sql = String::from(
            "SELECT i.id, i.checklist_id, i.title, i.description, i.assigned_to, i.due_date,
                    i.status, i.completed_at, i.employee_id, i.employee_name, i.archived,
                    i.created_at, i.updated_at, COALESCE(i.history, '[]') as history_str,
                    COALESCE(NULLIF(i.employee_id, ''), c.employee_id, '') as effective_emp_id,
                    COALESCE(NULLIF(i.employee_name, ''), c.employee_name, '') as effective_emp_name
             FROM onboarding_checklist_items i
             LEFT JOIN onboarding_checklists c ON i.checklist_id = c.id
             WHERE 1=1",
        );

        if let Some(emp) = employee_id {
            let clean_emp = emp.trim().replace('\'', "''");
            if !clean_emp.is_empty() {
                sql.push_str(&format!(
                    " AND (i.employee_id = '{0}' OR c.employee_id = '{0}')",
                    clean_emp
                ));
            }
        }

        if let Some(st) = status {
            let clean_st = st.trim().replace('\'', "''");
            if !clean_st.is_empty() && clean_st != "All" {
                sql.push_str(&format!(" AND lower(i.status) = lower('{}')", clean_st));
            }
        }

        if let Some(arch) = archived {
            sql.push_str(&format!(" AND i.archived = {}", arch));
        }

        if let Some(query) = q {
            let clean = query.trim().replace('\'', "''");
            if !clean.is_empty() {
                sql.push_str(&format!(
                    " AND (lower(i.title) LIKE lower('%{0}%') OR lower(i.assigned_to) LIKE lower('%{0}%') OR lower(i.employee_name) LIKE lower('%{0}%') OR lower(c.employee_name) LIKE lower('%{0}%') OR lower(i.employee_id) LIKE lower('%{0}%') OR lower(c.employee_id) LIKE lower('%{0}%') OR lower(i.id) LIKE lower('%{0}%'))",
                    clean
                ));
            }
        }

        sql.push_str(" ORDER BY i.id DESC;");

        let rows = sqlx::query(sqlx::AssertSqlSafe(sql.as_str()))
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let emp_id: String = r.get("effective_emp_id");
                let emp_name: String = r.get("effective_emp_name");
                let title: String = r.get("title");
                let desc: String = r.get("description");
                let assigned: String = r.get("assigned_to");
                let comp_at: String = r.get("completed_at");
                let created_val: String = r.get("created_at");
                let history_raw: String = r
                    .try_get("history_str")
                    .unwrap_or_else(|_| "[]".to_string());
                let parsed_history: Option<Vec<AuditHistoryItem>> =
                    serde_json::from_str(&history_raw).ok();
                let history = match parsed_history {
                    Some(h) if !h.is_empty() => Some(h),
                    _ => {
                        let ts = if !created_val.is_empty() {
                            created_val.clone()
                        } else {
                            "22 Oct 2026, 9:04 pm".to_string()
                        };
                        Some(vec![AuditHistoryItem {
                            status: r.get("status"),
                            timestamp: ts,
                            user: "ananya.rao@brightcone.ai".to_string(),
                        }])
                    }
                };

                OnboardingChecklistItem {
                    id: r.get("id"),
                    checklist_id: r.get("checklist_id"),
                    employee_id: Some(emp_id),
                    employee_name: Some(emp_name),
                    title: title.clone(),
                    task: Some(title),
                    description: Some(desc.clone()),
                    notes: Some(desc),
                    assigned_to: Some(assigned.clone()),
                    owner: Some(assigned),
                    due_date: Some(r.get("due_date")),
                    status: r.get("status"),
                    completed_at: Some(comp_at.clone()),
                    completed_on: Some(comp_at),
                    archived: Some(r.get("archived")),
                    history,
                    created_at: Some(created_val),
                    updated_at: Some(r.get("updated_at")),
                }
            })
            .collect())
    }

    pub async fn get_onboarding_task(
        &self,
        id: &str,
    ) -> Result<Option<OnboardingChecklistItem>, sqlx::Error> {
        let tasks = self
            .list_all_onboarding_tasks(None, None, None, Some(id))
            .await?;
        Ok(tasks.into_iter().find(|t| t.id == id))
    }

    pub async fn create_onboarding_task(
        &self,
        payload: CreateOnboardingTaskPayload,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match payload.timestamp {
            Some(ref ts) if !ts.trim().is_empty() => ts.clone(),
            _ => db_now_str,
        };
        let audit_user = match payload.user {
            Some(ref u) if !u.trim().is_empty() => u.clone(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        // Lookup employee name if not provided
        let emp_name = if let Some(n) = payload.employee_name {
            if !n.trim().is_empty() {
                n
            } else {
                self.get_employee_name_by_id(&payload.employee_id).await?
            }
        } else {
            self.get_employee_name_by_id(&payload.employee_id).await?
        };

        let checklist_id = format!("CHK-{}", payload.employee_id);
        // Ensure parent checklist exists
        let _ = sqlx::query(
            "INSERT INTO onboarding_checklists (id, employee_id, employee_name, title, description, assigned_by, start_date, due_date, status, completion_percentage, created_at, updated_at)
             VALUES ($1, $2, $3, $4, '', 'HR Ops', $5, $6, 'Pending', 0, $7, $8)
             ON CONFLICT (id) DO UPDATE SET employee_name = EXCLUDED.employee_name;"
        )
        .bind(&checklist_id)
        .bind(&payload.employee_id)
        .bind(&emp_name)
        .bind(format!("Onboarding - {}", emp_name))
        .bind(&payload.due_date)
        .bind(&payload.due_date)
        .bind(&now_str)
        .bind(&now_str)
        .execute(&self.pool)
        .await;

        let task_id = match payload.id {
            Some(ref id) if !id.trim().is_empty() => id.clone(),
            _ => self.next_onboarding_task_id().await?,
        };

        let status = payload.status.unwrap_or_else(|| "Pending".to_string());
        let owner = payload.owner.unwrap_or_else(|| "HR".to_string());
        let completed_on = payload.completed_on.unwrap_or_default();
        let notes = payload.notes.unwrap_or_default();

        let initial_history = vec![AuditHistoryItem {
            status: status.clone(),
            timestamp: now_str.clone(),
            user: audit_user,
        }];
        let history_json =
            serde_json::to_string(&initial_history).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "INSERT INTO onboarding_checklist_items (
                id, checklist_id, title, description, assigned_to, due_date, status,
                completed_at, employee_id, employee_name, archived, created_at, updated_at, history
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE, $11, $12, $13);",
        )
        .bind(&task_id)
        .bind(&checklist_id)
        .bind(&payload.task)
        .bind(&notes)
        .bind(&owner)
        .bind(&payload.due_date)
        .bind(&status)
        .bind(&completed_on)
        .bind(&payload.employee_id)
        .bind(&emp_name)
        .bind(&now_str)
        .bind(&now_str)
        .bind(&history_json)
        .execute(&self.pool)
        .await?;

        let _ = self.recalculate_checklist_progress(&checklist_id).await;

        Ok(OnboardingChecklistItem {
            id: task_id,
            checklist_id,
            employee_id: Some(payload.employee_id),
            employee_name: Some(emp_name),
            title: payload.task.clone(),
            task: Some(payload.task),
            description: Some(notes.clone()),
            notes: Some(notes),
            assigned_to: Some(owner.clone()),
            owner: Some(owner),
            due_date: Some(payload.due_date),
            status,
            completed_at: Some(completed_on.clone()),
            completed_on: Some(completed_on),
            archived: Some(false),
            history: Some(initial_history),
            created_at: Some(now_str.clone()),
            updated_at: Some(now_str),
        })
    }

    pub async fn update_onboarding_task(
        &self,
        id: &str,
        payload: CreateOnboardingTaskPayload,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match payload.timestamp.as_deref() {
            Some(ts) if !ts.trim().is_empty() => ts.to_string(),
            _ => db_now_str,
        };
        let audit_user = match payload.user.as_deref() {
            Some(u) if !u.trim().is_empty() => u.to_string(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        let cur_row = sqlx::query(
            "SELECT checklist_id, employee_id, employee_name, title, description, assigned_to, due_date, status, completed_at, archived, created_at, COALESCE(history, '[]') as history_str
             FROM onboarding_checklist_items WHERE id = $1;"
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        let checklist_id: String = cur_row.get("checklist_id");
        let emp_id = if !payload.employee_id.is_empty() {
            payload.employee_id
        } else {
            cur_row.get("employee_id")
        };
        let emp_name = if let Some(n) = payload.employee_name {
            if !n.trim().is_empty() {
                n
            } else {
                cur_row.get("employee_name")
            }
        } else {
            cur_row.get("employee_name")
        };

        let cur_status: String = cur_row.get("status");
        let status = payload.status.unwrap_or_else(|| cur_status.clone());
        let owner = payload.owner.unwrap_or_else(|| cur_row.get("assigned_to"));
        let notes = payload.notes.unwrap_or_else(|| cur_row.get("description"));
        let completed_on = payload
            .completed_on
            .unwrap_or_else(|| cur_row.get("completed_at"));

        let mut history: Vec<AuditHistoryItem> = cur_row
            .try_get::<String, _>("history_str")
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();

        if history.is_empty() {
            let created: String = cur_row.try_get("created_at").unwrap_or_default();
            let ts = if !created.is_empty() {
                created
            } else {
                now_str.clone()
            };
            history.push(AuditHistoryItem {
                status: cur_status,
                timestamp: ts,
                user: "ananya.rao@brightcone.ai".to_string(),
            });
        }

        history.push(AuditHistoryItem {
            status: status.clone(),
            timestamp: now_str.clone(),
            user: audit_user,
        });

        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "UPDATE onboarding_checklist_items SET
                title = $1, description = $2, assigned_to = $3, due_date = $4,
                status = $5, completed_at = $6, employee_id = $7, employee_name = $8,
                updated_at = $9, history = $10
             WHERE id = $11;",
        )
        .bind(&payload.task)
        .bind(&notes)
        .bind(&owner)
        .bind(&payload.due_date)
        .bind(&status)
        .bind(&completed_on)
        .bind(&emp_id)
        .bind(&emp_name)
        .bind(&now_str)
        .bind(&history_json)
        .bind(id)
        .execute(&self.pool)
        .await?;

        let _ = self.recalculate_checklist_progress(&checklist_id).await;

        Ok(OnboardingChecklistItem {
            id: id.to_string(),
            checklist_id,
            employee_id: Some(emp_id),
            employee_name: Some(emp_name),
            title: payload.task.clone(),
            task: Some(payload.task),
            description: Some(notes.clone()),
            notes: Some(notes),
            assigned_to: Some(owner.clone()),
            owner: Some(owner),
            due_date: Some(payload.due_date),
            status,
            completed_at: Some(completed_on.clone()),
            completed_on: Some(completed_on),
            archived: Some(cur_row.get("archived")),
            history: Some(history),
            created_at: cur_row.try_get("created_at").ok(),
            updated_at: Some(now_str),
        })
    }

    pub async fn update_onboarding_task_status(
        &self,
        id: &str,
        status: &str,
        completed_on: Option<&str>,
        custom_timestamp: Option<&str>,
        custom_user: Option<&str>,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match custom_timestamp {
            Some(ts) if !ts.trim().is_empty() => ts.to_string(),
            _ => db_now_str,
        };
        let audit_user = match custom_user {
            Some(u) if !u.trim().is_empty() => u.to_string(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        let cur_row = sqlx::query(
            "SELECT checklist_id, completed_at, status, created_at, COALESCE(history, '[]') as history_str
             FROM onboarding_checklist_items WHERE id = $1;",
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;
        let checklist_id: String = cur_row.get("checklist_id");
        let cur_comp: String = cur_row.get("completed_at");
        let cur_status: String = cur_row.get("status");

        let mut history: Vec<AuditHistoryItem> = cur_row
            .try_get::<String, _>("history_str")
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();

        if history.is_empty() {
            let created: String = cur_row.try_get("created_at").unwrap_or_default();
            let ts = if !created.is_empty() {
                created
            } else {
                now_str.clone()
            };
            history.push(AuditHistoryItem {
                status: cur_status,
                timestamp: ts,
                user: "ananya.rao@brightcone.ai".to_string(),
            });
        }

        history.push(AuditHistoryItem {
            status: status.to_string(),
            timestamp: now_str.clone(),
            user: audit_user,
        });

        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        let final_comp = if let Some(co) = completed_on {
            co.to_string()
        } else if status == "Completed" && cur_comp.is_empty() {
            now_str.clone()
        } else if status != "Completed" {
            String::new()
        } else {
            cur_comp
        };

        sqlx::query(
            "UPDATE onboarding_checklist_items SET
                status = $1, completed_at = $2, updated_at = $3, history = $4
             WHERE id = $5;",
        )
        .bind(status)
        .bind(&final_comp)
        .bind(&now_str)
        .bind(&history_json)
        .bind(id)
        .execute(&self.pool)
        .await?;

        let _ = self.recalculate_checklist_progress(&checklist_id).await;

        self.get_onboarding_task(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn create_standard_checklist(
        &self,
        employee_id: &str,
    ) -> Result<Vec<OnboardingChecklistItem>, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let now_str: String = now_row.get("now_str");

        // Lookup employee
        let emp_row = sqlx::query("SELECT name, joined_date FROM employees WHERE id = $1 LIMIT 1;")
            .bind(employee_id)
            .fetch_optional(&self.pool)
            .await?;

        let (emp_name, joined_date) = if let Some(er) = emp_row {
            (
                er.get::<String, _>("name"),
                er.get::<String, _>("joined_date"),
            )
        } else {
            ("New Joiner".to_string(), "Today".to_string())
        };

        // Standard 8 tasks
        let standard_tasks = vec![
            ("Welcome email & orientation schedule sent", "HR", 0),
            (
                "Workspace setup & corporate laptop provisioned",
                "IT Support",
                0,
            ),
            (
                "Company email, Slack & Google Workspace configured",
                "IT Support",
                0,
            ),
            (
                "Collect signed contracts, tax & ID verification forms",
                "HR",
                1,
            ),
            (
                "Team introduction and 1-on-1 buddy allocation",
                "Manager",
                2,
            ),
            (
                "Complete Security, Privacy & Compliance training",
                "Employee",
                5,
            ),
            ("HR benefits, PF nomination & payroll enrollment", "HR", 7),
            (
                "First 30-day goals and review milestone sync",
                "Manager",
                30,
            ),
        ];

        // Introspect existing tasks for this employee
        let existing_rows = sqlx::query(
            "SELECT lower(title) as t FROM onboarding_checklist_items WHERE employee_id = $1;",
        )
        .bind(employee_id)
        .fetch_all(&self.pool)
        .await?;
        let existing_titles: HashSet<String> =
            existing_rows.into_iter().map(|r| r.get("t")).collect();

        let checklist_id = format!("CHK-{}", employee_id);
        let _ = sqlx::query(
            "INSERT INTO onboarding_checklists (id, employee_id, employee_name, title, description, assigned_by, start_date, due_date, status, completion_percentage, created_at, updated_at)
             VALUES ($1, $2, $3, $4, '', 'HR Ops', $5, $6, 'Pending', 0, $7, $8)
             ON CONFLICT (id) DO UPDATE SET employee_name = EXCLUDED.employee_name;"
        )
        .bind(&checklist_id)
        .bind(employee_id)
        .bind(&emp_name)
        .bind(format!("Standard Onboarding - {}", emp_name))
        .bind(&joined_date)
        .bind(&joined_date)
        .bind(&now_str)
        .bind(&now_str)
        .execute(&self.pool)
        .await;

        let mut next_num = {
            let rows = sqlx::query("SELECT id FROM onboarding_checklist_items;")
                .fetch_all(&self.pool)
                .await?;
            let mut m: i64 = 0;
            for r in rows {
                let id: String = r.get("id");
                let num_part = id.strip_prefix("ONB-").or_else(|| id.strip_prefix("OB-"));
                if let Some(n_str) = num_part {
                    if let Ok(num) = n_str.parse::<i64>() {
                        if num > m {
                            m = num;
                        }
                    }
                }
            }
            m + 1
        };

        for (title, owner, offset_days) in standard_tasks {
            if existing_titles.contains(&title.to_lowercase()) {
                // Task already exists, skip it
                continue;
            }

            let task_id = loop {
                let candidate = format!("ONB-{:04}", next_num);
                next_num += 1;
                let exists: (i64,) = sqlx::query_as(
                    "SELECT count(*) FROM onboarding_checklist_items WHERE id = $1;",
                )
                .bind(&candidate)
                .fetch_one(&self.pool)
                .await?;
                if exists.0 == 0 {
                    break candidate;
                }
            };

            let due_date = if offset_days == 0 {
                if !joined_date.is_empty() {
                    joined_date.clone()
                } else {
                    "Day 1".to_string()
                }
            } else {
                format!("Day +{} ({})", offset_days, joined_date)
            };

            let task_history = vec![AuditHistoryItem {
                status: "Pending".to_string(),
                timestamp: now_str.clone(),
                user: "ananya.rao@brightcone.ai".to_string(),
            }];
            let history_json =
                serde_json::to_string(&task_history).unwrap_or_else(|_| "[]".to_string());

            sqlx::query(
                "INSERT INTO onboarding_checklist_items (
                    id, checklist_id, title, description, assigned_to, due_date, status,
                    completed_at, employee_id, employee_name, archived, created_at, updated_at, history
                ) VALUES ($1, $2, $3, '', $4, $5, 'Pending', '', $6, $7, FALSE, $8, $9, $10);",
            )
            .bind(&task_id)
            .bind(&checklist_id)
            .bind(title)
            .bind(owner)
            .bind(&due_date)
            .bind(employee_id)
            .bind(&emp_name)
            .bind(&now_str)
            .bind(&now_str)
            .bind(&history_json)
            .execute(&self.pool)
            .await?;
        }

        let _ = self.recalculate_checklist_progress(&checklist_id).await;

        self.list_all_onboarding_tasks(Some(employee_id), None, Some(false), None)
            .await
    }

    pub async fn toggle_archive_onboarding_task(
        &self,
        id: &str,
        archived: bool,
    ) -> Result<OnboardingChecklistItem, sqlx::Error> {
        sqlx::query("UPDATE onboarding_checklist_items SET archived = $1 WHERE id = $2;")
            .bind(archived)
            .bind(id)
            .execute(&self.pool)
            .await?;

        let row = sqlx::query("SELECT checklist_id FROM onboarding_checklist_items WHERE id = $1;")
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
        let chk_id: String = row.get("checklist_id");
        let _ = self.recalculate_checklist_progress(&chk_id).await;

        self.get_onboarding_task(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_onboarding_task(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM onboarding_checklist_items WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(res.rows_affected() > 0)
    }

    async fn get_employee_name_by_id(&self, employee_id: &str) -> Result<String, sqlx::Error> {
        let row = sqlx::query("SELECT name FROM employees WHERE id = $1 LIMIT 1;")
            .bind(employee_id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(row
            .map(|r| r.get("name"))
            .unwrap_or_else(|| "Employee".to_string()))
    }

    // ========================================================================
    // INTERNSHIP MANAGEMENT
    // ========================================================================

    pub async fn list_internships(
        &self,
        status: Option<&str>,
        archived: Option<bool>,
        department: Option<&str>,
        search: Option<&str>,
    ) -> Result<Vec<Internship>, sqlx::Error> {
        let mut sql = "SELECT id, intern_name, email, phone, college, degree, department,
                              internship_role, mentor_employee_id, mentor_name, start_date, end_date,
                              stipend, status, work_mode, project_title, performance_rating,
                              feedback, archived, COALESCE(history, '[]') as history_str, created_at, updated_at
                       FROM internships WHERE 1=1".to_string();

        if let Some(arch) = archived {
            if arch {
                sql.push_str(" AND archived = TRUE");
            } else {
                sql.push_str(" AND (archived IS FALSE OR archived IS NULL)");
            }
        }

        if let Some(st) = status {
            if !st.is_empty() && st != "All" && st != "All statuses" {
                sql.push_str(&format!(
                    " AND lower(status) = lower('{}')",
                    st.replace('\'', "''")
                ));
            }
        }

        if let Some(dept) = department {
            if !dept.is_empty() && dept != "All" && dept != "All: department" {
                sql.push_str(&format!(
                    " AND lower(department) = lower('{}')",
                    dept.replace('\'', "''")
                ));
            }
        }

        if let Some(q) = search {
            if !q.trim().is_empty() {
                let clean_q = q.trim().replace('\'', "''");
                sql.push_str(&format!(
                    " AND (intern_name ILIKE '%{clean_q}%' OR email ILIKE '%{clean_q}%' OR college ILIKE '%{clean_q}%' OR project_title ILIKE '%{clean_q}%' OR department ILIKE '%{clean_q}%' OR mentor_name ILIKE '%{clean_q}%')"
                ));
            }
        }

        sql.push_str(" ORDER BY id DESC;");

        let rows = sqlx::query(sqlx::AssertSqlSafe(sql.as_str()))
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let history_str: String = r.get("history_str");
                let history: Vec<AuditHistoryItem> =
                    serde_json::from_str(&history_str).unwrap_or_default();
                let archived: bool = r.try_get("archived").unwrap_or(false);

                Internship {
                    id: r.get("id"),
                    intern_name: r.get("intern_name"),
                    email: r.get("email"),
                    phone: Some(r.get("phone")),
                    college: Some(r.get("college")),
                    degree: Some(r.get("degree")),
                    department: Some(r.get("department")),
                    internship_role: r.get("internship_role"),
                    mentor_employee_id: Some(r.get("mentor_employee_id")),
                    mentor_name: Some(r.get("mentor_name")),
                    start_date: r.get("start_date"),
                    end_date: r.get("end_date"),
                    stipend: Some(r.get("stipend")),
                    status: r.get("status"),
                    work_mode: Some(r.get("work_mode")),
                    project_title: Some(r.get("project_title")),
                    performance_rating: Some(r.get("performance_rating")),
                    feedback: Some(r.get("feedback")),
                    archived: Some(archived),
                    history: Some(history),
                    created_at: Some(r.get("created_at")),
                    updated_at: Some(r.get("updated_at")),
                }
            })
            .collect())
    }

    pub async fn get_internship(&self, id: &str) -> Result<Option<Internship>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, intern_name, email, phone, college, degree, department,
                    internship_role, mentor_employee_id, mentor_name, start_date, end_date,
                    stipend, status, work_mode, project_title, performance_rating,
                    feedback, archived, COALESCE(history, '[]') as history_str, created_at, updated_at
             FROM internships WHERE id = $1 LIMIT 1;",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| {
            let history_str: String = r.get("history_str");
            let history: Vec<AuditHistoryItem> =
                serde_json::from_str(&history_str).unwrap_or_default();
            let archived: bool = r.try_get("archived").unwrap_or(false);

            Internship {
                id: r.get("id"),
                intern_name: r.get("intern_name"),
                email: r.get("email"),
                phone: Some(r.get("phone")),
                college: Some(r.get("college")),
                degree: Some(r.get("degree")),
                department: Some(r.get("department")),
                internship_role: r.get("internship_role"),
                mentor_employee_id: Some(r.get("mentor_employee_id")),
                mentor_name: Some(r.get("mentor_name")),
                start_date: r.get("start_date"),
                end_date: r.get("end_date"),
                stipend: Some(r.get("stipend")),
                status: r.get("status"),
                work_mode: Some(r.get("work_mode")),
                project_title: Some(r.get("project_title")),
                performance_rating: Some(r.get("performance_rating")),
                feedback: Some(r.get("feedback")),
                archived: Some(archived),
                history: Some(history),
                created_at: Some(r.get("created_at")),
                updated_at: Some(r.get("updated_at")),
            }
        }))
    }

    pub async fn create_internship(
        &self,
        mut internship: Internship,
        custom_timestamp: Option<&str>,
        custom_user: Option<&str>,
    ) -> Result<Internship, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match custom_timestamp {
            Some(ts) if !ts.trim().is_empty() => ts.to_string(),
            _ => db_now_str,
        };
        let audit_user = match custom_user {
            Some(u) if !u.trim().is_empty() => u.to_string(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        if internship.id.is_empty() {
            let count_row = sqlx::query("SELECT count(*) as c FROM internships;")
                .fetch_one(&self.pool)
                .await?;
            let count: i64 = count_row.get("c");
            internship.id = format!("INT-{:03}", count + 1);
        }

        // Lookup mentor name if not provided but ID is
        if internship.mentor_name.as_deref().unwrap_or("").is_empty() {
            if let Some(ref mid) = internship.mentor_employee_id {
                if !mid.is_empty() {
                    let m_row = sqlx::query("SELECT name FROM employees WHERE id = $1 LIMIT 1;")
                        .bind(mid)
                        .fetch_optional(&self.pool)
                        .await?;
                    if let Some(mr) = m_row {
                        internship.mentor_name = Some(mr.get("name"));
                    }
                }
            }
        }

        let initial_history = vec![AuditHistoryItem {
            status: internship.status.clone(),
            timestamp: now_str.clone(),
            user: audit_user,
        }];
        let history_json =
            serde_json::to_string(&initial_history).unwrap_or_else(|_| "[]".to_string());

        internship.archived = Some(false);
        internship.history = Some(initial_history);
        internship.created_at = Some(now_str.clone());
        internship.updated_at = Some(now_str.clone());

        sqlx::query(
            "INSERT INTO internships (
                id, intern_name, email, phone, college, degree, department,
                internship_role, mentor_employee_id, mentor_name, start_date, end_date,
                stipend, status, work_mode, project_title, performance_rating,
                feedback, archived, history, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
            )
            ON CONFLICT (id) DO UPDATE SET
                intern_name = EXCLUDED.intern_name, email = EXCLUDED.email,
                phone = EXCLUDED.phone, college = EXCLUDED.college,
                degree = EXCLUDED.degree, department = EXCLUDED.department,
                internship_role = EXCLUDED.internship_role,
                mentor_employee_id = EXCLUDED.mentor_employee_id,
                mentor_name = EXCLUDED.mentor_name, start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date, stipend = EXCLUDED.stipend,
                status = EXCLUDED.status, work_mode = EXCLUDED.work_mode,
                project_title = EXCLUDED.project_title,
                performance_rating = EXCLUDED.performance_rating,
                feedback = EXCLUDED.feedback,
                archived = EXCLUDED.archived,
                history = EXCLUDED.history,
                updated_at = EXCLUDED.updated_at;"
        )
        .bind(&internship.id)
        .bind(&internship.intern_name)
        .bind(&internship.email)
        .bind(internship.phone.as_deref().unwrap_or(""))
        .bind(internship.college.as_deref().unwrap_or(""))
        .bind(internship.degree.as_deref().unwrap_or(""))
        .bind(internship.department.as_deref().unwrap_or(""))
        .bind(&internship.internship_role)
        .bind(internship.mentor_employee_id.as_deref().unwrap_or(""))
        .bind(internship.mentor_name.as_deref().unwrap_or(""))
        .bind(&internship.start_date)
        .bind(&internship.end_date)
        .bind(internship.stipend.as_deref().unwrap_or(""))
        .bind(&internship.status)
        .bind(internship.work_mode.as_deref().unwrap_or("Hybrid"))
        .bind(internship.project_title.as_deref().unwrap_or(""))
        .bind(internship.performance_rating.unwrap_or(0.0))
        .bind(internship.feedback.as_deref().unwrap_or(""))
        .bind(false)
        .bind(&history_json)
        .bind(internship.created_at.as_deref().unwrap_or(""))
        .bind(internship.updated_at.as_deref().unwrap_or(""))
        .execute(&self.pool)
        .await?;

        Ok(internship)
    }

    pub async fn update_internship(
        &self,
        id: &str,
        mut internship: Internship,
        custom_timestamp: Option<&str>,
        custom_user: Option<&str>,
    ) -> Result<Internship, sqlx::Error> {
        let cur_row = sqlx::query(
            "SELECT status, created_at, COALESCE(history, '[]') as history_str, archived
             FROM internships WHERE id = $1 LIMIT 1;",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let cur_status: String = cur_row.get("status");
        let cur_archived: bool = cur_row.try_get("archived").unwrap_or(false);
        let history_str: String = cur_row.get("history_str");
        let mut history: Vec<AuditHistoryItem> =
            serde_json::from_str(&history_str).unwrap_or_default();

        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match custom_timestamp {
            Some(ts) if !ts.trim().is_empty() => ts.to_string(),
            _ => db_now_str,
        };
        let audit_user = match custom_user {
            Some(u) if !u.trim().is_empty() => u.to_string(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        if history.is_empty() {
            let created: String = cur_row.get("created_at");
            history.push(AuditHistoryItem {
                status: cur_status.clone(),
                timestamp: if !created.is_empty() {
                    created
                } else {
                    now_str.clone()
                },
                user: "ananya.rao@brightcone.ai".to_string(),
            });
        }

        if cur_status != internship.status {
            history.push(AuditHistoryItem {
                status: internship.status.clone(),
                timestamp: now_str.clone(),
                user: audit_user,
            });
        }

        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());
        internship.updated_at = Some(now_str.clone());
        internship.history = Some(history);
        internship.archived = Some(cur_archived);

        // Mentor name lookup if needed
        if internship.mentor_name.as_deref().unwrap_or("").is_empty() {
            if let Some(ref mid) = internship.mentor_employee_id {
                if !mid.is_empty() {
                    let m_row = sqlx::query("SELECT name FROM employees WHERE id = $1 LIMIT 1;")
                        .bind(mid)
                        .fetch_optional(&self.pool)
                        .await?;
                    if let Some(mr) = m_row {
                        internship.mentor_name = Some(mr.get("name"));
                    }
                }
            }
        }

        sqlx::query(
            "UPDATE internships SET
                intern_name = $1, email = $2, phone = $3, college = $4, degree = $5,
                department = $6, internship_role = $7, mentor_employee_id = $8,
                mentor_name = $9, start_date = $10, end_date = $11, stipend = $12,
                status = $13, work_mode = $14, project_title = $15,
                performance_rating = $16, feedback = $17, history = $18, updated_at = $19
             WHERE id = $20;",
        )
        .bind(&internship.intern_name)
        .bind(&internship.email)
        .bind(internship.phone.as_deref().unwrap_or(""))
        .bind(internship.college.as_deref().unwrap_or(""))
        .bind(internship.degree.as_deref().unwrap_or(""))
        .bind(internship.department.as_deref().unwrap_or(""))
        .bind(&internship.internship_role)
        .bind(internship.mentor_employee_id.as_deref().unwrap_or(""))
        .bind(internship.mentor_name.as_deref().unwrap_or(""))
        .bind(&internship.start_date)
        .bind(&internship.end_date)
        .bind(internship.stipend.as_deref().unwrap_or(""))
        .bind(&internship.status)
        .bind(internship.work_mode.as_deref().unwrap_or("Hybrid"))
        .bind(internship.project_title.as_deref().unwrap_or(""))
        .bind(internship.performance_rating.unwrap_or(0.0))
        .bind(internship.feedback.as_deref().unwrap_or(""))
        .bind(&history_json)
        .bind(internship.updated_at.as_deref().unwrap_or(""))
        .bind(id)
        .execute(&self.pool)
        .await?;

        internship.id = id.to_string();
        Ok(internship)
    }

    pub async fn update_internship_status(
        &self,
        id: &str,
        status: &str,
        feedback: Option<&str>,
        rating: Option<f32>,
        custom_timestamp: Option<&str>,
        custom_user: Option<&str>,
    ) -> Result<Internship, sqlx::Error> {
        let current = self
            .get_internship(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match custom_timestamp {
            Some(ts) if !ts.trim().is_empty() => ts.to_string(),
            _ => db_now_str,
        };
        let audit_user = match custom_user {
            Some(u) if !u.trim().is_empty() => u.to_string(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        let mut history: Vec<AuditHistoryItem> = current.history.clone().unwrap_or_default();
        if history.is_empty() {
            let created = current
                .created_at
                .clone()
                .unwrap_or_else(|| now_str.clone());
            history.push(AuditHistoryItem {
                status: current.status.clone(),
                timestamp: created,
                user: "ananya.rao@brightcone.ai".to_string(),
            });
        }

        history.push(AuditHistoryItem {
            status: status.to_string(),
            timestamp: now_str.clone(),
            user: audit_user,
        });

        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        let final_feedback = feedback
            .map(|s| s.to_string())
            .unwrap_or_else(|| current.feedback.clone().unwrap_or_default());
        let final_rating = rating.unwrap_or_else(|| current.performance_rating.unwrap_or(0.0));

        sqlx::query(
            "UPDATE internships SET
                status = $1, feedback = $2, performance_rating = $3, history = $4, updated_at = $5
             WHERE id = $6;",
        )
        .bind(status)
        .bind(&final_feedback)
        .bind(final_rating)
        .bind(&history_json)
        .bind(&now_str)
        .bind(id)
        .execute(&self.pool)
        .await?;

        let mut updated = current;
        updated.status = status.to_string();
        updated.feedback = Some(final_feedback);
        updated.performance_rating = Some(final_rating);
        updated.history = Some(history);
        updated.updated_at = Some(now_str);

        Ok(updated)
    }

    pub async fn toggle_archive_internship(
        &self,
        id: &str,
        archived: bool,
    ) -> Result<Internship, sqlx::Error> {
        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&self.pool)
        .await?;
        let now_str: String = now_row.get("now_str");

        sqlx::query("UPDATE internships SET archived = $1, updated_at = $2 WHERE id = $3;")
            .bind(archived)
            .bind(&now_str)
            .bind(id)
            .execute(&self.pool)
            .await?;

        self.get_internship(id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_internship(&self, id: &str) -> Result<bool, sqlx::Error> {
        let res = sqlx::query("DELETE FROM internships WHERE id = $1;")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(res.rows_affected() > 0)
    }

    pub async fn convert_internship_to_employee(
        &self,
        id: &str,
        payload: ConvertInternshipPayload,
    ) -> Result<(Internship, Employee), sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let intern_row = sqlx::query(
            "SELECT id, intern_name, email, phone, college, degree, department,
                    internship_role, mentor_employee_id, mentor_name, start_date, end_date,
                    stipend, status, work_mode, project_title, performance_rating,
                    feedback, archived, COALESCE(history, '[]') as history_str, created_at, updated_at
             FROM internships WHERE id = $1 LIMIT 1;",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let history_str: String = intern_row.get("history_str");

        let now_row = sqlx::query(
            "SELECT to_char(timezone('+05:30', CURRENT_TIMESTAMP), 'DD Mon YYYY, HH12:MI am') as now_str;",
        )
        .fetch_one(&mut *tx)
        .await?;
        let db_now_str: String = now_row.get("now_str");
        let now_str = match payload.timestamp {
            Some(ref ts) if !ts.trim().is_empty() => ts.clone(),
            _ => db_now_str,
        };
        let audit_user = match payload.user {
            Some(ref u) if !u.trim().is_empty() => u.clone(),
            _ => "ananya.rao@brightcone.ai".to_string(),
        };

        // Create new employee
        let emp_ids: Vec<String> =
            sqlx::query_scalar("SELECT id FROM employees WHERE id LIKE 'BC-%';")
                .fetch_all(&mut *tx)
                .await
                .unwrap_or_default();
        let max_id = emp_ids
            .iter()
            .filter_map(|id| id.strip_prefix("BC-")?.parse::<u64>().ok())
            .max()
            .unwrap_or(1045);
        let new_emp_id = format!("BC-{}", max_id + 1);

        let full_name = if let Some(ref last) = payload.last_name {
            if !last.trim().is_empty() {
                format!("{} {}", payload.first_name.trim(), last.trim())
            } else {
                payload.first_name.trim().to_string()
            }
        } else {
            payload.first_name.trim().to_string()
        };

        let manager = payload
            .reporting_manager
            .unwrap_or_else(|| "HR".to_string());
        let location = payload
            .location
            .unwrap_or_else(|| "Hyderabad, India".to_string());
        let grade = payload.grade.unwrap_or_else(|| "L3".to_string());

        let new_emp = Employee {
            id: new_emp_id.clone(),
            name: full_name.clone(),
            role: payload.designation.clone(),
            department: payload.department.clone(),
            grade: grade.clone(),
            location: location.clone(),
            manager: manager.clone(),
            status: payload.status.clone(),
            email: payload.email.clone(),
        };

        sqlx::query(
            "INSERT INTO employees (id, name, role, department, grade, location, manager, status, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
        )
        .bind(&new_emp.id)
        .bind(&new_emp.name)
        .bind(&new_emp.role)
        .bind(&new_emp.department)
        .bind(&new_emp.grade)
        .bind(&new_emp.location)
        .bind(&new_emp.manager)
        .bind(&new_emp.status)
        .bind(&new_emp.email)
        .execute(&mut *tx)
        .await?;

        // Create initial employee profile
        let _ = sqlx::query(
            "INSERT INTO employee_profiles (
                employee_id, full_name, work_email, role, department, status, phone, dob,
                grade, location, doj
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (employee_id) DO NOTHING;",
        )
        .bind(&new_emp.id)
        .bind(&new_emp.name)
        .bind(&new_emp.email)
        .bind(&new_emp.role)
        .bind(&new_emp.department)
        .bind(&new_emp.status)
        .bind(payload.phone.as_deref().unwrap_or(""))
        .bind(payload.dob.as_deref().unwrap_or(""))
        .bind(&new_emp.grade)
        .bind(&new_emp.location)
        .bind(&payload.date_of_joining)
        .execute(&mut *tx)
        .await?;

        // Update internship record: status = "Converted" and append history
        let mut history: Vec<AuditHistoryItem> =
            serde_json::from_str(&history_str).unwrap_or_default();

        if history.is_empty() {
            let cur_status: String = intern_row.get("status");
            let created: String = intern_row.get("created_at");
            history.push(AuditHistoryItem {
                status: cur_status,
                timestamp: if !created.is_empty() {
                    created
                } else {
                    now_str.clone()
                },
                user: "ananya.rao@brightcone.ai".to_string(),
            });
        }

        history.push(AuditHistoryItem {
            status: "Converted".to_string(),
            timestamp: now_str.clone(),
            user: audit_user,
        });

        let history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            "UPDATE internships SET
                status = 'Converted', updated_at = $1, history = $2
             WHERE id = $3;",
        )
        .bind(&now_str)
        .bind(&history_json)
        .bind(id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        let updated_intern = self.get_internship(id).await?.unwrap();
        Ok((updated_intern, new_emp))
    }

    // ========================================================================
    // EMPLOYEE SELF-SERVICE: ATTENDANCE
    // ========================================================================

    pub async fn get_attendance_summary(
        &self,
        employee_id: &str,
    ) -> Result<AttendanceSummaryResponse, sqlx::Error> {
        let punch_opt = sqlx::query(
            "SELECT id, employee_id, punch_date, clock_in, clock_out, clocked_in, elapsed_seconds, last_clock_in_timestamp
             FROM attendance_punches
             WHERE employee_id = $1 AND punch_date = to_char(CURRENT_DATE, 'YYYY-MM-DD')
             LIMIT 1;"
        )
        .bind(employee_id)
        .fetch_optional(&self.pool)
        .await?;

        let (clocked_in, punch_in, punch_out, elapsed_seconds) = match punch_opt {
            Some(row) => {
                let is_clocked_in: bool = row.get("clocked_in");
                let p_in: Option<String> = row.get("clock_in");
                let p_out: Option<String> = row.get("clock_out");
                let mut stored_elapsed: i32 = row.get("elapsed_seconds");
                if stored_elapsed < 0 {
                    stored_elapsed = 0;
                }
                let mut total_sec = stored_elapsed as u64;

                if is_clocked_in {
                    let last_ts: i64 = row.get("last_clock_in_timestamp");
                    let now_ts = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs() as i64;
                    if now_ts > last_ts && last_ts > 0 {
                        total_sec += (now_ts - last_ts) as u64;
                    }
                }
                (is_clocked_in, p_in, p_out, total_sec)
            }
            None => (false, None, None, 0u64),
        };

        let last_week = vec![
            DayAttendanceCard {
                day: "Mon".to_string(),
                date_label: "Sep 28".to_string(),
                hours: "9h 12m".to_string(),
                status: "Present".to_string(),
            },
            DayAttendanceCard {
                day: "Tue".to_string(),
                date_label: "Sep 29".to_string(),
                hours: "8h 47m".to_string(),
                status: "Present".to_string(),
            },
            DayAttendanceCard {
                day: "Wed".to_string(),
                date_label: "Sep 30".to_string(),
                hours: "8h 05m".to_string(),
                status: "Remote".to_string(),
            },
            DayAttendanceCard {
                day: "Thu".to_string(),
                date_label: "Oct 1".to_string(),
                hours: "9h 31m".to_string(),
                status: "Present".to_string(),
            },
            DayAttendanceCard {
                day: "Fri".to_string(),
                date_label: "Oct 2".to_string(),
                hours: "—".to_string(),
                status: "Holiday".to_string(),
            },
            DayAttendanceCard {
                day: "Sat".to_string(),
                date_label: "Oct 3".to_string(),
                hours: "—".to_string(),
                status: "Weekend".to_string(),
            },
            DayAttendanceCard {
                day: "Sun".to_string(),
                date_label: "Oct 4".to_string(),
                hours: "—".to_string(),
                status: "Weekend".to_string(),
            },
        ];

        let regularisations = self.list_attendance_regularisations(employee_id).await?;

        Ok(AttendanceSummaryResponse {
            employee_id: employee_id.to_string(),
            today_clocked_in: clocked_in,
            today_punch_in: punch_in,
            today_punch_out: punch_out,
            today_elapsed_seconds: elapsed_seconds,
            avg_hours_monthly: "8h 52m".to_string(),
            target_hours: "8h 30m".to_string(),
            late_arrivals: 1,
            grace_limit: 3,
            last_week,
            regularisations,
        })
    }

    pub async fn punch_clock(
        &self,
        employee_id: &str,
    ) -> Result<AttendanceSummaryResponse, sqlx::Error> {
        let punch_opt = sqlx::query(
            "SELECT id, clocked_in, clock_in, clock_out, elapsed_seconds, last_clock_in_timestamp
             FROM attendance_punches
             WHERE employee_id = $1 AND punch_date = to_char(CURRENT_DATE, 'YYYY-MM-DD')
             LIMIT 1;",
        )
        .bind(employee_id)
        .fetch_optional(&self.pool)
        .await?;

        let now_ts = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let time_row = sqlx::query("SELECT to_char(CURRENT_TIMESTAMP, 'HH24:MI') as cur_time;")
            .fetch_one(&self.pool)
            .await?;
        let cur_time: String = time_row.get("cur_time");

        match punch_opt {
            None => {
                let id = format!("PUNCH-{}-{}", employee_id, now_ts);
                sqlx::query(
                    "INSERT INTO attendance_punches (id, employee_id, punch_date, clock_in, clocked_in, elapsed_seconds, last_clock_in_timestamp)
                     VALUES ($1, $2, to_char(CURRENT_DATE, 'YYYY-MM-DD'), $3, TRUE, 0, $4);"
                )
                .bind(&id)
                .bind(employee_id)
                .bind(&cur_time)
                .bind(now_ts)
                .execute(&self.pool)
                .await?;
            }
            Some(row) => {
                let id: String = row.get("id");
                let is_clocked_in: bool = row.get("clocked_in");
                let last_ts: i64 = row.get("last_clock_in_timestamp");
                let stored_elapsed: i32 = row.get("elapsed_seconds");

                if is_clocked_in {
                    let delta = if now_ts > last_ts && last_ts > 0 {
                        now_ts - last_ts
                    } else {
                        0
                    };
                    let new_elapsed = stored_elapsed + delta as i32;
                    sqlx::query(
                        "UPDATE attendance_punches SET clocked_in = FALSE, clock_out = $1, elapsed_seconds = $2
                         WHERE id = $3;"
                    )
                    .bind(&cur_time)
                    .bind(new_elapsed)
                    .bind(&id)
                    .execute(&self.pool)
                    .await?;
                } else {
                    sqlx::query(
                        "UPDATE attendance_punches SET clocked_in = TRUE, last_clock_in_timestamp = $1
                         WHERE id = $2;"
                    )
                    .bind(now_ts)
                    .bind(&id)
                    .execute(&self.pool)
                    .await?;
                }
            }
        }

        self.get_attendance_summary(employee_id).await
    }

    pub async fn list_attendance_regularisations(
        &self,
        employee_id: &str,
    ) -> Result<Vec<AttendanceRegularisation>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, employee_id, employee_name, date, clock_in, clock_out, reason, status, created_at
             FROM attendance_regularisations
             WHERE employee_id = $1
             ORDER BY id DESC;"
        )
        .bind(employee_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| AttendanceRegularisation {
                id: r.get("id"),
                employee_id: r.get("employee_id"),
                employee_name: r.get("employee_name"),
                date: r.get("date"),
                clock_in: r.get("clock_in"),
                clock_out: r.get("clock_out"),
                reason: r.get("reason"),
                status: r.get("status"),
                created_at: r.get("created_at"),
            })
            .collect())
    }

    pub async fn create_attendance_regularisation(
        &self,
        payload: CreateRegularisationPayload,
    ) -> Result<AttendanceRegularisation, sqlx::Error> {
        let count_row = sqlx::query("SELECT count(*) as c FROM attendance_regularisations;")
            .fetch_one(&self.pool)
            .await?;
        let count: i64 = count_row.get("c");
        let id = format!("REG-{:04}", count + 1);

        let emp_name = payload
            .employee_name
            .unwrap_or_else(|| "Rahul Varma".to_string());
        let date_str = payload.date;

        sqlx::query(
            "INSERT INTO attendance_regularisations (id, employee_id, employee_name, date, clock_in, clock_out, reason, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'Approved', $8);"
        )
        .bind(&id)
        .bind(&payload.employee_id)
        .bind(&emp_name)
        .bind(&date_str)
        .bind(&payload.clock_in)
        .bind(&payload.clock_out)
        .bind(&payload.reason)
        .bind(&date_str)
        .execute(&self.pool)
        .await?;

        Ok(AttendanceRegularisation {
            id,
            employee_id: payload.employee_id,
            employee_name: emp_name,
            date: date_str.clone(),
            clock_in: payload.clock_in,
            clock_out: payload.clock_out,
            reason: payload.reason,
            status: "Approved".to_string(),
            created_at: Some(date_str),
        })
    }

    // ========================================================================
    // PEER FEEDBACK & SELF-REVIEWS
    // ========================================================================

    pub async fn list_feedbacks(
        &self,
        to_employee_id: &str,
    ) -> Result<Vec<PeerFeedback>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, from_employee_id, from_employee_name, to_employee_id, to_employee_name, feedback, date, created_at
             FROM feedbacks
             WHERE to_employee_id = $1
             ORDER BY id DESC;"
        )
        .bind(to_employee_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| PeerFeedback {
                id: r.get("id"),
                from_employee_id: r.get("from_employee_id"),
                from_employee_name: r.get("from_employee_name"),
                to_employee_id: r.get("to_employee_id"),
                to_employee_name: r.get("to_employee_name"),
                feedback: r.get("feedback"),
                date: r.get("date"),
                created_at: r.get("created_at"),
            })
            .collect())
    }

    pub async fn create_feedback(
        &self,
        payload: CreateFeedbackPayload,
    ) -> Result<PeerFeedback, sqlx::Error> {
        let count_row = sqlx::query("SELECT count(*) as c FROM feedbacks;")
            .fetch_one(&self.pool)
            .await?;
        let count: i64 = count_row.get("c");
        let id = format!("FB-{:04}", count + 1);

        let date_row = sqlx::query("SELECT to_char(CURRENT_DATE, 'Mon DD, YYYY') as today_str;")
            .fetch_one(&self.pool)
            .await?;
        let today_str: String = date_row.get("today_str");

        let from_name = payload
            .from_employee_name
            .unwrap_or_else(|| "Rahul Varma".to_string());
        let to_name = payload
            .to_employee_name
            .unwrap_or_else(|| "Colleague".to_string());

        sqlx::query(
            "INSERT INTO feedbacks (id, from_employee_id, from_employee_name, to_employee_id, to_employee_name, feedback, date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8);"
        )
        .bind(&id)
        .bind(&payload.from_employee_id)
        .bind(&from_name)
        .bind(&payload.to_employee_id)
        .bind(&to_name)
        .bind(&payload.feedback)
        .bind(&today_str)
        .bind(&today_str)
        .execute(&self.pool)
        .await?;

        Ok(PeerFeedback {
            id,
            from_employee_id: payload.from_employee_id,
            from_employee_name: from_name,
            to_employee_id: payload.to_employee_id,
            to_employee_name: to_name,
            feedback: payload.feedback,
            date: today_str.clone(),
            created_at: Some(today_str),
        })
    }

    pub async fn get_review_status(
        &self,
        employee_id: &str,
        cycle: &str,
    ) -> Result<ReviewCycleStatus, sqlx::Error> {
        let row_opt = sqlx::query(
            "SELECT id, employee_id, cycle, accomplishments, rating, status, submitted_at
             FROM self_reviews
             WHERE employee_id = $1 AND cycle = $2
             LIMIT 1;",
        )
        .bind(employee_id)
        .bind(cycle)
        .fetch_optional(&self.pool)
        .await?;

        match row_opt {
            Some(_) => Ok(ReviewCycleStatus {
                cycle: cycle.to_string(),
                current_step: 3,
                self_review_submitted: true,
                self_review_status_text: "Submitted".to_string(),
                due_date: "Oct 25, 2026".to_string(),
            }),
            None => Ok(ReviewCycleStatus {
                cycle: cycle.to_string(),
                current_step: 2,
                self_review_submitted: false,
                self_review_status_text: "Not submitted".to_string(),
                due_date: "Oct 25, 2026".to_string(),
            }),
        }
    }

    pub async fn submit_self_review(
        &self,
        payload: SelfReviewPayload,
    ) -> Result<ReviewCycleStatus, sqlx::Error> {
        let id = format!(
            "SR-{}-{}",
            payload.employee_id,
            payload.cycle.replace(' ', "-")
        );
        let date_row = sqlx::query("SELECT to_char(CURRENT_DATE, 'Mon DD, YYYY') as today_str;")
            .fetch_one(&self.pool)
            .await?;
        let today_str: String = date_row.get("today_str");

        sqlx::query(
            "INSERT INTO self_reviews (id, employee_id, cycle, accomplishments, rating, status, submitted_at)
             VALUES ($1, $2, $3, $4, $5, 'Submitted', $6)
             ON CONFLICT (id) DO UPDATE SET accomplishments = EXCLUDED.accomplishments, rating = EXCLUDED.rating, submitted_at = EXCLUDED.submitted_at;"
        )
        .bind(&id)
        .bind(&payload.employee_id)
        .bind(&payload.cycle)
        .bind(&payload.accomplishments)
        .bind(payload.rating)
        .bind(&today_str)
        .execute(&self.pool)
        .await?;

        Ok(ReviewCycleStatus {
            cycle: payload.cycle,
            current_step: 3,
            self_review_submitted: true,
            self_review_status_text: "Submitted".to_string(),
            due_date: "Oct 25, 2026".to_string(),
        })
    }

    // ========================================================================
    // COMPANY POLICIES, DOCUMENTS & LETTER REQUESTS
    // ========================================================================

    pub async fn list_company_policies(
        &self,
        employee_id: &str,
    ) -> Result<Vec<CompanyPolicy>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT p.id, p.title, p.version, p.updated_date, p.acknowledgement_required, p.category, p.content,
                    CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END as acknowledged,
                    a.acknowledged_at
             FROM company_policies p
             LEFT JOIN policy_acknowledgements a ON a.policy_id = p.id AND a.employee_id = $1
             ORDER BY p.id ASC;"
        )
        .bind(employee_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| CompanyPolicy {
                id: r.get("id"),
                title: r.get("title"),
                version: r.get("version"),
                updated_date: r.get("updated_date"),
                acknowledgement_required: r.get("acknowledgement_required"),
                category: r.get("category"),
                content: r.get("content"),
                acknowledged: r.get("acknowledged"),
                acknowledged_at: r.get("acknowledged_at"),
            })
            .collect())
    }

    pub async fn acknowledge_policy(
        &self,
        policy_id: &str,
        employee_id: &str,
    ) -> Result<CompanyPolicy, sqlx::Error> {
        let ack_id = format!("ACK-{}-{}", employee_id, policy_id);
        let date_row = sqlx::query("SELECT to_char(CURRENT_DATE, 'Mon DD, YYYY') as today_str;")
            .fetch_one(&self.pool)
            .await?;
        let today_str: String = date_row.get("today_str");

        sqlx::query(
            "INSERT INTO policy_acknowledgements (id, policy_id, employee_id, acknowledged_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO NOTHING;",
        )
        .bind(&ack_id)
        .bind(policy_id)
        .bind(employee_id)
        .bind(&today_str)
        .execute(&self.pool)
        .await?;

        let pol_row = sqlx::query(
            "SELECT id, title, version, updated_date, acknowledgement_required, category, content
             FROM company_policies WHERE id = $1 LIMIT 1;",
        )
        .bind(policy_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(CompanyPolicy {
            id: pol_row.get("id"),
            title: pol_row.get("title"),
            version: pol_row.get("version"),
            updated_date: pol_row.get("updated_date"),
            acknowledgement_required: pol_row.get("acknowledgement_required"),
            category: pol_row.get("category"),
            content: pol_row.get("content"),
            acknowledged: true,
            acknowledged_at: Some(today_str),
        })
    }

    pub async fn list_employee_documents(
        &self,
        employee_id: &str,
    ) -> Result<Vec<EmployeeDocument>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, employee_id, document_name, status, file_path, file_size, uploaded_at
             FROM employee_documents
             WHERE employee_id = $1
             ORDER BY id ASC;",
        )
        .bind(employee_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let path: String = r.get("file_path");
                let url = format!("/static/{}", path.trim_start_matches('/'));
                EmployeeDocument {
                    id: r.get("id"),
                    employee_id: r.get("employee_id"),
                    document_name: r.get("document_name"),
                    status: r.get("status"),
                    file_path: path,
                    file_size: r.get("file_size"),
                    uploaded_at: r.get("uploaded_at"),
                    download_url: Some(url),
                }
            })
            .collect())
    }

    pub async fn upload_employee_document(
        &self,
        payload: UploadDocumentPayload,
    ) -> Result<EmployeeDocument, sqlx::Error> {
        let count_row = sqlx::query("SELECT count(*) as c FROM employee_documents;")
            .fetch_one(&self.pool)
            .await?;
        let count: i64 = count_row.get("c");
        let id = format!("DOC-{:04}", count + 1);

        let date_row = sqlx::query("SELECT to_char(CURRENT_DATE, 'Mon DD, YYYY') as today_str;")
            .fetch_one(&self.pool)
            .await?;
        let today_str: String = date_row.get("today_str");

        let clean_fname = payload
            .file_name
            .replace([' ', '/', '\\'], "_")
            .replace("..", "_");
        let relative_path = format!("uploads/documents/{}", clean_fname);
        let full_path = format!("assets/static/{}", relative_path);

        let bytes = decode_base64_bytes(&payload.file_data_base64);
        let file_size_str = if bytes.len() >= 1_048_576 {
            format!("{:.1} MB", bytes.len() as f64 / 1_048_576.0)
        } else {
            format!("{:.1} KB", bytes.len() as f64 / 1024.0)
        };

        if let Some(parent) = std::path::Path::new(&full_path).parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(&full_path, &bytes);

        sqlx::query(
            "INSERT INTO employee_documents (id, employee_id, document_name, status, file_path, file_size, uploaded_at)
             VALUES ($1, $2, $3, 'Verified', $4, $5, $6);"
        )
        .bind(&id)
        .bind(&payload.employee_id)
        .bind(&payload.document_name)
        .bind(&relative_path)
        .bind(&file_size_str)
        .bind(&today_str)
        .execute(&self.pool)
        .await?;

        Ok(EmployeeDocument {
            id,
            employee_id: payload.employee_id,
            document_name: payload.document_name,
            status: "Verified".to_string(),
            file_path: relative_path.clone(),
            file_size: file_size_str,
            uploaded_at: today_str,
            download_url: Some(format!("/static/{}", relative_path)),
        })
    }

    pub async fn list_letter_requests(
        &self,
        employee_id: &str,
    ) -> Result<Vec<LetterRequest>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, employee_id, employee_name, letter_type, addressed_to, requested_date, status, file_path, purpose, created_at
             FROM letter_requests
             WHERE employee_id = $1
             ORDER BY id DESC;"
        )
        .bind(employee_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let path: String = r.get("file_path");
                let url = if !path.is_empty() {
                    Some(format!("/static/{}", path.trim_start_matches('/')))
                } else {
                    None
                };
                LetterRequest {
                    id: r.get("id"),
                    employee_id: r.get("employee_id"),
                    employee_name: r.get("employee_name"),
                    letter_type: r.get("letter_type"),
                    addressed_to: r.get("addressed_to"),
                    requested_date: r.get("requested_date"),
                    status: r.get("status"),
                    file_path: path,
                    purpose: r.get("purpose"),
                    created_at: r.get("created_at"),
                    download_url: url,
                }
            })
            .collect())
    }

    pub async fn create_letter_request(
        &self,
        payload: CreateLetterRequestPayload,
    ) -> Result<LetterRequest, sqlx::Error> {
        let count_row = sqlx::query("SELECT count(*) as c FROM letter_requests;")
            .fetch_one(&self.pool)
            .await?;
        let count: i64 = count_row.get("c");
        let id = format!("LTR-{:04}", count + 1);

        let date_row = sqlx::query("SELECT to_char(CURRENT_DATE, 'Mon DD, YYYY') as today_str;")
            .fetch_one(&self.pool)
            .await?;
        let today_str: String = date_row.get("today_str");

        let emp_name = payload
            .employee_name
            .unwrap_or_else(|| "Rahul Varma".to_string());
        let purpose = payload
            .purpose
            .unwrap_or_else(|| "Official verification".to_string());

        let relative_path = format!("uploads/letters/letter_{}.pdf", id.to_lowercase());
        let full_path = format!("assets/static/{}", relative_path);

        if let Some(parent) = std::path::Path::new(&full_path).parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let pdf_bytes = generate_letter_pdf_bytes(
            &payload.letter_type,
            &payload.addressed_to,
            &emp_name,
            &today_str,
            &purpose,
        );
        let _ = std::fs::write(&full_path, &pdf_bytes);

        sqlx::query(
            "INSERT INTO letter_requests (id, employee_id, employee_name, letter_type, addressed_to, requested_date, status, file_path, purpose, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'Issued', $7, $8, $9);"
        )
        .bind(&id)
        .bind(&payload.employee_id)
        .bind(&emp_name)
        .bind(&payload.letter_type)
        .bind(&payload.addressed_to)
        .bind(&today_str)
        .bind(&relative_path)
        .bind(&purpose)
        .bind(&today_str)
        .execute(&self.pool)
        .await?;

        Ok(LetterRequest {
            id,
            employee_id: payload.employee_id,
            employee_name: emp_name,
            letter_type: payload.letter_type,
            addressed_to: payload.addressed_to,
            requested_date: today_str.clone(),
            status: "Issued".to_string(),
            file_path: relative_path.clone(),
            purpose,
            created_at: Some(today_str),
            download_url: Some(format!("/static/{}", relative_path)),
        })
    }
}

fn decode_base64_bytes(input: &str) -> Vec<u8> {
    let clean = if let Some(pos) = input.find(";base64,") {
        &input[pos + 8..]
    } else {
        input.trim()
    };
    let clean = clean.replace(['\r', '\n', ' '], "");

    let mut out = Vec::new();
    let mut buf = 0u32;
    let mut bits = 0;
    for &b in clean.as_bytes() {
        let val = match b {
            b'A'..=b'Z' => (b - b'A') as u32,
            b'a'..=b'z' => (b - b'a' + 26) as u32,
            b'0'..=b'9' => (b - b'0' + 52) as u32,
            b'+' => 62,
            b'/' => 63,
            b'=' => continue,
            _ => continue,
        };
        buf = (buf << 6) | val;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
            buf &= (1 << bits) - 1;
        }
    }
    out
}

fn generate_letter_pdf_bytes(
    letter_type: &str,
    recipient: &str,
    employee_name: &str,
    date: &str,
    purpose: &str,
) -> Vec<u8> {
    let stream_content = format!(
        "BT\n/F1 18 Tf\n50 720 Td\n(BRIGHTCONE TECHNOLOGIES) Tj\n/F1 12 Tf\n0 -25 Td\n(Official Human Resources Document) Tj\n0 -40 Td\n(Date: {date}) Tj\n0 -25 Td\n(To: {recipient}) Tj\n0 -35 Td\n(Subject: {letter_type}) Tj\n0 -30 Td\n(This document confirms that {employee_name} is currently employed with Brightcone Technologies) Tj\n0 -20 Td\n(as a full-time employee in good standing.) Tj\n0 -30 Td\n(Purpose: {purpose}) Tj\n0 -50 Td\n(Authorized Signatory) Tj\n0 -18 Td\n(People Operations & Talent Governance) Tj\n0 -15 Td\n(Brightcone Technologies Private Limited) Tj\nET\n"
    );
    let stream_len = stream_content.len();
    let pdf = format!(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length {stream_len} >>\nstream\n{stream_content}endstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000236 00000 n \n0000000305 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{}\n%%EOF\n",
        370 + stream_len
    );
    pdf.into_bytes()
}

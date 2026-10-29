use crate::db::schema::{
    CheckConstraintSchema, ColumnSchema, EntitySchema, ForeignKeySchema, IndexSchema, PostgresType,
    TableSchema, UniqueConstraintSchema,
};
use serde::{Deserialize, Serialize};

// =========================================================================
// Shift Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Shift {
    pub id: i64,
    pub pid: String,
    pub name: String,
    pub code: String,
    pub start_time: String,
    pub end_time: String,
    pub break_duration_minutes: i32,
    pub grace_period_minutes: i32,
    pub is_overnight: bool,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateShiftPayload {
    pub name: String,
    pub code: String,
    pub start_time: String,
    pub end_time: String,
    pub break_duration_minutes: Option<i32>,
    pub grace_period_minutes: Option<i32>,
    pub is_overnight: Option<bool>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateShiftPayload {
    pub name: Option<String>,
    pub code: Option<String>,
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub break_duration_minutes: Option<i32>,
    pub grace_period_minutes: Option<i32>,
    pub is_overnight: Option<bool>,
    pub is_active: Option<bool>,
}

// =========================================================================
// Holiday Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Holiday {
    pub id: i64,
    pub pid: String,
    pub name: String,
    pub holiday_date: String,
    pub description: Option<String>,
    pub applicable_location: Option<String>,
    pub is_recurring: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateHolidayPayload {
    pub name: String,
    pub holiday_date: String,
    pub description: Option<String>,
    pub applicable_location: Option<String>,
    pub is_recurring: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateHolidayPayload {
    pub name: Option<String>,
    pub holiday_date: Option<String>,
    pub description: Option<String>,
    pub applicable_location: Option<String>,
    pub is_recurring: Option<bool>,
}

// =========================================================================
// Leave Type Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct LeaveType {
    pub id: i64,
    pub pid: String,
    pub name: String,
    pub code: String,
    pub description: Option<String>,
    pub is_paid: bool,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveTypePayload {
    pub name: String,
    pub code: String,
    pub description: Option<String>,
    pub is_paid: Option<bool>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveTypePayload {
    pub name: Option<String>,
    pub code: Option<String>,
    pub description: Option<String>,
    pub is_paid: Option<bool>,
    pub is_active: Option<bool>,
}

// =========================================================================
// Leave Quota Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct LeaveQuota {
    pub id: i64,
    pub pid: String,
    pub leave_type_id: i64,
    pub leave_type_name: Option<String>,
    pub leave_type_code: Option<String>,
    pub year: i32,
    pub entitled_days: f64,
    pub applicable_group: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveQuotaPayload {
    pub leave_type_id: i64,
    pub year: i32,
    pub entitled_days: f64,
    pub applicable_group: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveQuotaPayload {
    pub leave_type_id: Option<i64>,
    pub year: Option<i32>,
    pub entitled_days: Option<f64>,
    pub applicable_group: Option<String>,
}

// =========================================================================
// Common Error Response
// =========================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}

// =========================================================================
// Employees & Weekly Roster Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Employee {
    pub id: i64,
    pub pid: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub department: String,
    pub default_shift_id: Option<i64>,
    pub default_shift_name: Option<String>,
    pub default_shift_code: Option<String>,
    pub avatar_color: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct RosterAssignment {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub roster_date: String,
    pub shift_id: Option<i64>,
    pub shift_code: Option<String>,
    pub shift_name: Option<String>,
    pub is_off: bool,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct WeeklyRosterQuery {
    pub week_start: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AssignShiftPayload {
    pub employee_id: i64,
    pub date: String,
    pub shift_id: Option<i64>,
    pub is_off: Option<bool>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PublishRosterPayload {
    pub week_start_date: String,
    pub published_by: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct RosterPublication {
    pub id: i64,
    pub week_start_date: String,
    pub published_at: String,
    pub published_by: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SwapRequest {
    pub id: i64,
    pub pid: String,
    pub requester_id: i64,
    pub target_employee_id: Option<i64>,
    pub request_date: String,
    pub target_date: Option<String>,
    pub source_shift_id: Option<i64>,
    pub target_shift_id: Option<i64>,
    pub status: String,
    pub reason: Option<String>,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SwapRequestWithDetails {
    pub id: i64,
    pub pid: String,
    pub requester_id: i64,
    pub requester_name: String,
    pub requester_email: String,
    pub requester_department: String,
    pub requester_avatar_color: String,
    pub target_employee_id: Option<i64>,
    pub target_employee_name: Option<String>,
    pub target_employee_email: Option<String>,
    pub target_employee_department: Option<String>,
    pub target_employee_avatar_color: Option<String>,
    pub request_date: String,
    pub target_date: Option<String>,
    pub source_shift_id: Option<i64>,
    pub source_shift_name: Option<String>,
    pub source_shift_code: Option<String>,
    pub target_shift_id: Option<i64>,
    pub target_shift_name: Option<String>,
    pub target_shift_code: Option<String>,
    pub status: String,
    pub reason: Option<String>,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSwapRequestPayload {
    pub requester_id: i64,
    pub target_employee_id: Option<i64>,
    pub request_date: String,
    pub target_date: Option<String>,
    pub source_shift_id: Option<i64>,
    pub target_shift_id: Option<i64>,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ApproveSwapRequestPayload {
    pub reviewer_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectSwapRequestPayload {
    pub reviewer_name: Option<String>,
    pub rejection_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct SwapRequestQuery {
    pub employee_id: Option<i64>,
    pub status: Option<String>,
    pub date: Option<String>,
}

// =========================================================================
// Work From Home (WFH) Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct WorkFromHomeRequest {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub start_date: String,
    pub end_date: String,
    pub reason: String,
    pub status: String,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct WorkFromHomeRequestWithEmployee {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: String,
    pub employee_email: String,
    pub employee_department: String,
    pub avatar_color: String,
    pub start_date: String,
    pub end_date: String,
    pub reason: String,
    pub status: String,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateWfhRequestPayload {
    pub employee_id: i64,
    pub start_date: String,
    pub end_date: String,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct ApproveWfhRequestPayload {
    pub reviewer_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectWfhRequestPayload {
    pub reviewer_name: Option<String>,
    pub rejection_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct WfhRequestQuery {
    pub employee_id: Option<i64>,
    pub status: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

// =========================================================================
// Comp-Off Tracker Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CompOffEntitlement {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub earned_date: String,
    pub days_earned: f64,
    pub reason: String,
    pub expiry_date: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CompOffEntitlementWithEmployee {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: String,
    pub employee_email: String,
    pub employee_department: String,
    pub avatar_color: String,
    pub earned_date: String,
    pub days_earned: f64,
    pub reason: String,
    pub expiry_date: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CompOffRequest {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub requested_date: String,
    pub days_requested: f64,
    pub reason: String,
    pub status: String,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CompOffRequestWithEmployee {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: String,
    pub employee_email: String,
    pub employee_department: String,
    pub avatar_color: String,
    pub requested_date: String,
    pub days_requested: f64,
    pub reason: String,
    pub status: String,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompOffBalance {
    pub employee_id: i64,
    pub employee_name: Option<String>,
    pub total_earned_days: f64,
    pub used_days: f64,
    pub pending_days: f64,
    pub available_days: f64,
}

#[derive(Debug, Deserialize)]
pub struct GrantCompOffPayload {
    pub employee_id: i64,
    pub earned_date: String,
    pub days_earned: f64,
    pub reason: String,
    pub expiry_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCompOffRequestPayload {
    pub employee_id: i64,
    pub requested_date: String,
    pub days_requested: Option<f64>,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct ApproveCompOffRequestPayload {
    pub reviewer_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectCompOffRequestPayload {
    pub reviewer_name: Option<String>,
    pub rejection_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct CompOffQuery {
    pub employee_id: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DayRosterEntry {
    pub date: String,
    pub day_name: String,
    pub day_number: u32,
    pub shift_id: Option<i64>,
    pub shift_code: Option<String>,
    pub shift_name: Option<String>,
    pub is_off: bool,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmployeeRosterRow {
    pub id: i64,
    pub pid: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub department: String,
    pub default_shift_id: Option<i64>,
    pub default_shift_name: Option<String>,
    pub default_shift_code: Option<String>,
    pub avatar_color: String,
    pub days: Vec<DayRosterEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RosterSummary {
    pub scheduled_today: i64,
    pub total_employees: i64,
    pub shifts_defined: i64,
    pub shift_codes: Vec<String>,
    pub swap_requests_count: i64,
    pub on_leave_this_week_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeeklyRosterResponse {
    pub week_start: String,
    pub week_end: String,
    pub is_published: bool,
    pub published_at: Option<String>,
    pub published_by: Option<String>,
    pub summary: RosterSummary,
    pub employees: Vec<EmployeeRosterRow>,
}

// =========================================================================
// Daily Attendance Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DailyAttendanceRecord {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: Option<String>,
    pub employee_email: Option<String>,
    pub employee_department: Option<String>,
    pub avatar_color: Option<String>,
    pub attendance_date: String,
    pub attendance_status: String,
    pub in_time: Option<String>,
    pub out_time: Option<String>,
    pub hours_worked: f64,
    pub entry_status: String,
    pub is_archived: bool,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceSummary {
    pub total_records: i64,
    pub recorded_count: i64,
    pub pending_count: i64,
    pub regularised_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceQuery {
    pub search: Option<String>,
    pub status: Option<String>,
    pub entry_status: Option<String>,
    pub archived: Option<bool>,
    pub date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAttendancePayload {
    pub employee_id: i64,
    pub date: String,
    pub attendance_status: String,
    pub in_time: Option<String>,
    pub out_time: Option<String>,
    pub entry_status: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAttendancePayload {
    pub attendance_status: Option<String>,
    pub in_time: Option<String>,
    pub out_time: Option<String>,
    pub entry_status: Option<String>,
    pub is_archived: Option<bool>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceListResponse {
    pub summary: AttendanceSummary,
    pub records: Vec<DailyAttendanceRecord>,
    pub archived_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct ClockInPayload {
    pub employee_id: i64,
    pub date: Option<String>,
    pub time: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ClockOutPayload {
    pub employee_id: i64,
    pub date: Option<String>,
    pub time: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TodayAttendanceQuery {
    pub employee_id: i64,
    pub date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodayAttendanceStatus {
    pub date: String,
    pub employee_id: i64,
    pub record: Option<DailyAttendanceRecord>,
    pub can_clock_in: bool,
    pub can_clock_out: bool,
    pub status: String,
}

// =========================================================================
// Attendance Correction Request Models
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AttendanceCorrectionRequest {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: Option<String>,
    pub employee_email: Option<String>,
    pub employee_department: Option<String>,
    pub avatar_color: Option<String>,
    pub attendance_date: String,
    pub correction_type: String,
    pub requested_time: String,
    pub reason: String,
    pub status: String,
    pub previous_in_time: Option<String>,
    pub previous_out_time: Option<String>,
    pub previous_hours_worked: Option<f64>,
    pub previous_status: Option<String>,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCorrectionRequestPayload {
    pub employee_id: i64,
    pub attendance_date: String,
    pub correction_type: String,
    pub requested_time: String,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct ApproveCorrectionPayload {
    pub reviewer_name: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectCorrectionPayload {
    pub reviewer_name: Option<String>,
    pub rejection_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct CorrectionQuery {
    pub employee_id: Option<i64>,
    pub status: Option<String>,
    pub date: Option<String>,
}

// =========================================================================
// Leave Request & Balance Models (TIM-05)
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct LeaveRequest {
    pub id: i64,
    pub pid: String,
    pub employee_id: i64,
    pub employee_name: Option<String>,
    pub employee_email: Option<String>,
    pub employee_department: Option<String>,
    pub avatar_color: Option<String>,
    pub leave_type_id: i64,
    pub leave_type_name: Option<String>,
    pub leave_type_code: Option<String>,
    pub is_paid: Option<bool>,
    pub start_date: String,
    pub end_date: String,
    pub is_half_day: bool,
    pub reason: String,
    pub total_days: f64,
    pub status: String,
    pub reviewer_name: Option<String>,
    pub rejection_reason: Option<String>,
    pub reviewed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveRequestPayload {
    pub employee_id: i64,
    pub leave_type_id: i64,
    pub start_date: String,
    pub end_date: String,
    pub is_half_day: Option<bool>,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct ApproveLeaveRequestPayload {
    pub reviewer_name: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectLeaveRequestPayload {
    pub reviewer_name: Option<String>,
    pub rejection_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct LeaveRequestQuery {
    pub employee_id: Option<i64>,
    pub status: Option<String>,
    pub year: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveBalanceItem {
    pub leave_type_id: i64,
    pub leave_type_name: String,
    pub leave_type_code: String,
    pub is_paid: bool,
    pub year: i32,
    pub entitled_days: f64,
    pub consumed_days: f64,
    pub pending_days: f64,
    pub remaining_days: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveBalanceResponse {
    pub employee_id: i64,
    pub employee_name: String,
    pub employee_email: String,
    pub employee_department: String,
    pub year: i32,
    pub balances: Vec<LeaveBalanceItem>,
}

// =========================================================================
// EntitySchema Implementations (Single Source of Truth)
// =========================================================================

impl EntitySchema for Shift {
    fn table_name() -> &'static str {
        "shifts"
    }

    fn schema() -> TableSchema {
        TableSchema::new("shifts")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(ColumnSchema::new("pid", PostgresType::Uuid).not_null().unique().default("gen_random_uuid()"))
            .column(ColumnSchema::new("name", PostgresType::VarChar(Some(100))).not_null())
            .column(ColumnSchema::new("code", PostgresType::VarChar(Some(30))).not_null().unique())
            .column(ColumnSchema::new("start_time", PostgresType::Time).not_null())
            .column(ColumnSchema::new("end_time", PostgresType::Time).not_null())
            .column(ColumnSchema::new("break_duration_minutes", PostgresType::Integer).not_null().default("60"))
            .column(ColumnSchema::new("grace_period_minutes", PostgresType::Integer).not_null().default("15"))
            .column(ColumnSchema::new("is_overnight", PostgresType::Boolean).not_null().default("false"))
            .column(ColumnSchema::new("is_active", PostgresType::Boolean).not_null().default("true"))
            .column(ColumnSchema::new("created_at", PostgresType::TimestampTz).not_null().default("CURRENT_TIMESTAMP"))
            .column(ColumnSchema::new("updated_at", PostgresType::TimestampTz).not_null().default("CURRENT_TIMESTAMP"))
            .check_constraint(CheckConstraintSchema::new("chk_shifts_break_duration", "break_duration_minutes >= 0"))
            .check_constraint(CheckConstraintSchema::new("chk_shifts_grace_period", "grace_period_minutes >= 0"))
            .check_constraint(CheckConstraintSchema::new(
                "chk_shifts_times",
                "(NOT is_overnight AND start_time < end_time) OR (is_overnight AND start_time > end_time)",
            ))
            .index(IndexSchema::new("idx_shifts_code", &["code"]))
            .index(IndexSchema::new("idx_shifts_active", &["is_active"]))
    }
}

impl EntitySchema for Holiday {
    fn table_name() -> &'static str {
        "holidays"
    }

    fn schema() -> TableSchema {
        TableSchema::new("holidays")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("name", PostgresType::VarChar(Some(150))).not_null())
            .column(ColumnSchema::new("holiday_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("description", PostgresType::Text).nullable())
            .column(
                ColumnSchema::new("applicable_location", PostgresType::VarChar(Some(100)))
                    .nullable(),
            )
            .column(
                ColumnSchema::new("is_recurring", PostgresType::Boolean)
                    .not_null()
                    .default("false"),
            )
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .index(
                IndexSchema::new(
                    "idx_holidays_date_location",
                    &["holiday_date", "applicable_location"],
                )
                .unique()
                .nulls_not_distinct(),
            )
            .index(IndexSchema::new("idx_holidays_date", &["holiday_date"]))
    }
}

impl EntitySchema for LeaveType {
    fn table_name() -> &'static str {
        "leave_types"
    }

    fn schema() -> TableSchema {
        TableSchema::new("leave_types")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("name", PostgresType::VarChar(Some(100))).not_null())
            .column(
                ColumnSchema::new("code", PostgresType::VarChar(Some(30)))
                    .not_null()
                    .unique(),
            )
            .column(ColumnSchema::new("description", PostgresType::Text).nullable())
            .column(
                ColumnSchema::new("is_paid", PostgresType::Boolean)
                    .not_null()
                    .default("true"),
            )
            .column(
                ColumnSchema::new("is_active", PostgresType::Boolean)
                    .not_null()
                    .default("true"),
            )
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .index(IndexSchema::new("idx_leave_types_code", &["code"]))
            .index(IndexSchema::new("idx_leave_types_active", &["is_active"]))
    }
}

impl EntitySchema for LeaveQuota {
    fn table_name() -> &'static str {
        "leave_quotas"
    }

    fn schema() -> TableSchema {
        TableSchema::new("leave_quotas")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("leave_type_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("year", PostgresType::Integer).not_null())
            .column(
                ColumnSchema::new("entitled_days", PostgresType::Numeric(Some(4), Some(1)))
                    .not_null(),
            )
            .column(
                ColumnSchema::new("applicable_group", PostgresType::VarChar(Some(100)))
                    .not_null()
                    .default("'ALL'"),
            )
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_leave_quotas_leave_type",
                    "leave_type_id",
                    "leave_types",
                    "id",
                )
                .on_delete("RESTRICT")
                .on_update("CASCADE"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_leave_quotas_days",
                "entitled_days > 0",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_leave_quotas_year",
                "year >= 2000 AND year <= 2100",
            ))
            .unique_constraint(UniqueConstraintSchema::new(
                "uq_leave_quotas_type_year_group",
                &["leave_type_id", "year", "applicable_group"],
            ))
            .index(IndexSchema::new(
                "idx_leave_quotas_type",
                &["leave_type_id"],
            ))
            .index(IndexSchema::new(
                "idx_leave_quotas_year_group",
                &["year", "applicable_group"],
            ))
    }
}

impl EntitySchema for Employee {
    fn table_name() -> &'static str {
        "time_employees"
    }

    fn schema() -> TableSchema {
        TableSchema::new("time_employees")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("name", PostgresType::VarChar(Some(150))).not_null())
            .column(
                ColumnSchema::new("email", PostgresType::VarChar(Some(255)))
                    .not_null()
                    .unique(),
            )
            .column(
                ColumnSchema::new("role", PostgresType::VarChar(Some(100)))
                    .not_null()
                    .default("'Employee'"),
            )
            .column(
                ColumnSchema::new("department", PostgresType::VarChar(Some(100)))
                    .not_null()
                    .default("'Engineering'"),
            )
            .column(ColumnSchema::new("default_shift_id", PostgresType::BigInt).nullable())
            .column(
                ColumnSchema::new("avatar_color", PostgresType::VarChar(Some(30)))
                    .not_null()
                    .default("'purple'"),
            )
            .column(
                ColumnSchema::new("is_active", PostgresType::Boolean)
                    .not_null()
                    .default("true"),
            )
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_employees_default_shift",
                    "default_shift_id",
                    "shifts",
                    "id",
                )
                .on_delete("SET NULL"),
            )
            .index(IndexSchema::new("idx_employees_email", &["email"]))
            .index(IndexSchema::new("idx_employees_active", &["is_active"]))
    }
}

impl EntitySchema for RosterAssignment {
    fn table_name() -> &'static str {
        "roster_assignments"
    }

    fn schema() -> TableSchema {
        TableSchema::new("roster_assignments")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("roster_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("shift_id", PostgresType::BigInt).nullable())
            .column(
                ColumnSchema::new("is_off", PostgresType::Boolean)
                    .not_null()
                    .default("false"),
            )
            .column(ColumnSchema::new("notes", PostgresType::Text).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_roster_assignments_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .foreign_key(
                ForeignKeySchema::new("fk_roster_assignments_shift", "shift_id", "shifts", "id")
                    .on_delete("SET NULL"),
            )
            .unique_constraint(UniqueConstraintSchema::new(
                "uq_roster_employee_date",
                &["employee_id", "roster_date"],
            ))
            .index(IndexSchema::new("idx_roster_date", &["roster_date"]))
            .index(IndexSchema::new(
                "idx_roster_emp_date",
                &["employee_id", "roster_date"],
            ))
    }
}

impl EntitySchema for RosterPublication {
    fn table_name() -> &'static str {
        "roster_publications"
    }

    fn schema() -> TableSchema {
        TableSchema::new("roster_publications")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("week_start_date", PostgresType::Date)
                    .not_null()
                    .unique(),
            )
            .column(
                ColumnSchema::new("published_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("published_by", PostgresType::VarChar(Some(100)))
                    .not_null()
                    .default("'Ananya Rao'"),
            )
            .column(ColumnSchema::new("notes", PostgresType::Text).nullable())
            .index(IndexSchema::new(
                "idx_roster_pub_week",
                &["week_start_date"],
            ))
    }
}

impl EntitySchema for SwapRequest {
    fn table_name() -> &'static str {
        "swap_requests"
    }

    fn schema() -> TableSchema {
        TableSchema::new("swap_requests")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("requester_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("target_employee_id", PostgresType::BigInt).nullable())
            .column(ColumnSchema::new("request_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("target_date", PostgresType::Date).nullable())
            .column(ColumnSchema::new("source_shift_id", PostgresType::BigInt).nullable())
            .column(ColumnSchema::new("target_shift_id", PostgresType::BigInt).nullable())
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PENDING'"),
            )
            .column(ColumnSchema::new("reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewer_name", PostgresType::VarChar(Some(200))).nullable())
            .column(ColumnSchema::new("rejection_reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewed_at", PostgresType::TimestampTz).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_swap_requests_requester",
                    "requester_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_swap_requests_target",
                    "target_employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_swap_requests_source_shift",
                    "source_shift_id",
                    "shifts",
                    "id",
                )
                .on_delete("SET NULL"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_swap_requests_target_shift",
                    "target_shift_id",
                    "shifts",
                    "id",
                )
                .on_delete("SET NULL"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_swap_requests_status",
                "status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')",
            ))
            .index(IndexSchema::new("idx_swap_requests_status", &["status"]))
            .index(IndexSchema::new(
                "idx_swap_requests_requester",
                &["requester_id"],
            ))
    }
}

impl EntitySchema for DailyAttendanceRecord {
    fn table_name() -> &'static str {
        "daily_attendance"
    }

    fn schema() -> TableSchema {
        TableSchema::new("daily_attendance")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("attendance_date", PostgresType::Date).not_null())
            .column(
                ColumnSchema::new("attendance_status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PRESENT'"),
            )
            .column(ColumnSchema::new("in_time", PostgresType::Time).nullable())
            .column(ColumnSchema::new("out_time", PostgresType::Time).nullable())
            .column(
                ColumnSchema::new("hours_worked", PostgresType::Numeric(Some(5), Some(2)))
                    .not_null()
                    .default("0.0"),
            )
            .column(
                ColumnSchema::new("entry_status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'RECORDED'"),
            )
            .column(
                ColumnSchema::new("is_archived", PostgresType::Boolean)
                    .not_null()
                    .default("false"),
            )
            .column(ColumnSchema::new("notes", PostgresType::Text).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_daily_attendance_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .unique_constraint(UniqueConstraintSchema::new(
                "uq_daily_attendance_emp_date",
                &["employee_id", "attendance_date"],
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_attendance_status",
                "attendance_status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_entry_status",
                "entry_status IN ('RECORDED', 'PENDING', 'REGULARISED')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_hours_worked",
                "hours_worked >= 0.0 AND hours_worked <= 24.0",
            ))
            .index(IndexSchema::new(
                "idx_daily_attendance_emp",
                &["employee_id"],
            ))
            .index(IndexSchema::new(
                "idx_daily_attendance_date",
                &["attendance_date"],
            ))
            .index(IndexSchema::new(
                "idx_daily_attendance_status",
                &["attendance_status"],
            ))
            .index(IndexSchema::new(
                "idx_daily_attendance_entry_status",
                &["entry_status"],
            ))
            .index(IndexSchema::new(
                "idx_daily_attendance_archived",
                &["is_archived"],
            ))
    }
}

impl EntitySchema for AttendanceCorrectionRequest {
    fn table_name() -> &'static str {
        "attendance_correction_requests"
    }

    fn schema() -> TableSchema {
        TableSchema::new("attendance_correction_requests")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("attendance_date", PostgresType::Date).not_null())
            .column(
                ColumnSchema::new("correction_type", PostgresType::VarChar(Some(50))).not_null(),
            )
            .column(ColumnSchema::new("requested_time", PostgresType::Time).not_null())
            .column(ColumnSchema::new("reason", PostgresType::Text).not_null())
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PENDING'"),
            )
            .column(ColumnSchema::new("previous_in_time", PostgresType::Time).nullable())
            .column(ColumnSchema::new("previous_out_time", PostgresType::Time).nullable())
            .column(
                ColumnSchema::new(
                    "previous_hours_worked",
                    PostgresType::Numeric(Some(5), Some(2)),
                )
                .nullable(),
            )
            .column(
                ColumnSchema::new("previous_status", PostgresType::VarChar(Some(50))).nullable(),
            )
            .column(ColumnSchema::new("reviewer_name", PostgresType::VarChar(Some(150))).nullable())
            .column(ColumnSchema::new("rejection_reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewed_at", PostgresType::TimestampTz).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_attendance_correction_requests_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_correction_type",
                "correction_type IN ('MISSED_CLOCK_IN', 'MISSED_CLOCK_OUT')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_correction_status",
                "status IN ('PENDING', 'APPROVED', 'REJECTED')",
            ))
            .index(IndexSchema::new("idx_corr_req_emp", &["employee_id"]))
            .index(IndexSchema::new("idx_corr_req_date", &["attendance_date"]))
            .index(IndexSchema::new("idx_corr_req_status", &["status"]))
            .index(
                IndexSchema::new(
                    "uq_pending_correction_request",
                    &["employee_id", "attendance_date", "correction_type"],
                )
                .unique()
                .predicate("status = 'PENDING'"),
            )
    }
}

impl EntitySchema for LeaveRequest {
    fn table_name() -> &'static str {
        "leave_requests"
    }

    fn schema() -> TableSchema {
        TableSchema::new("leave_requests")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("leave_type_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("start_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("end_date", PostgresType::Date).not_null())
            .column(
                ColumnSchema::new("is_half_day", PostgresType::Boolean)
                    .not_null()
                    .default("false"),
            )
            .column(ColumnSchema::new("reason", PostgresType::Text).not_null())
            .column(
                ColumnSchema::new("total_days", PostgresType::Numeric(Some(4), Some(1))).not_null(),
            )
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PENDING'"),
            )
            .column(ColumnSchema::new("reviewer_name", PostgresType::VarChar(Some(150))).nullable())
            .column(ColumnSchema::new("rejection_reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewed_at", PostgresType::TimestampTz).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_leave_requests_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_leave_requests_leave_type",
                    "leave_type_id",
                    "leave_types",
                    "id",
                )
                .on_delete("RESTRICT"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_leave_req_status",
                "status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_leave_req_dates",
                "start_date <= end_date",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_leave_req_days",
                "total_days > 0.0",
            ))
            .index(IndexSchema::new("idx_leave_req_emp", &["employee_id"]))
            .index(IndexSchema::new(
                "idx_leave_req_dates",
                &["start_date", "end_date"],
            ))
            .index(IndexSchema::new("idx_leave_req_status", &["status"]))
            .index(IndexSchema::new("idx_leave_req_type", &["leave_type_id"]))
    }
}

impl EntitySchema for WorkFromHomeRequest {
    fn table_name() -> &'static str {
        "work_from_home_requests"
    }

    fn schema() -> TableSchema {
        TableSchema::new("work_from_home_requests")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("start_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("end_date", PostgresType::Date).not_null())
            .column(ColumnSchema::new("reason", PostgresType::Text).not_null())
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PENDING'"),
            )
            .column(ColumnSchema::new("reviewer_name", PostgresType::VarChar(Some(200))).nullable())
            .column(ColumnSchema::new("rejection_reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewed_at", PostgresType::TimestampTz).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_wfh_requests_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_wfh_requests_status",
                "status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_wfh_requests_dates",
                "start_date <= end_date",
            ))
            .index(IndexSchema::new(
                "idx_wfh_requests_employee_id",
                &["employee_id"],
            ))
            .index(IndexSchema::new("idx_wfh_requests_status", &["status"]))
            .index(IndexSchema::new(
                "idx_wfh_requests_dates",
                &["start_date", "end_date"],
            ))
    }
}

impl EntitySchema for CompOffEntitlement {
    fn table_name() -> &'static str {
        "comp_off_entitlements"
    }

    fn schema() -> TableSchema {
        TableSchema::new("comp_off_entitlements")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("earned_date", PostgresType::Date).not_null())
            .column(
                ColumnSchema::new("days_earned", PostgresType::Numeric(Some(4), Some(1)))
                    .not_null()
                    .default("1.0"),
            )
            .column(ColumnSchema::new("reason", PostgresType::Text).not_null())
            .column(ColumnSchema::new("expiry_date", PostgresType::Date).nullable())
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'ACTIVE'"),
            )
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_comp_off_entitlements_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_comp_off_entitlements_status",
                "status IN ('ACTIVE', 'EXPIRED', 'REVOKED')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_comp_off_entitlements_days",
                "days_earned > 0.0",
            ))
            .index(IndexSchema::new(
                "idx_comp_off_entitlements_emp",
                &["employee_id"],
            ))
            .index(IndexSchema::new(
                "idx_comp_off_entitlements_status",
                &["status"],
            ))
    }
}

impl EntitySchema for CompOffRequest {
    fn table_name() -> &'static str {
        "comp_off_requests"
    }

    fn schema() -> TableSchema {
        TableSchema::new("comp_off_requests")
            .column(ColumnSchema::new("id", PostgresType::BigSerial).primary_key())
            .column(
                ColumnSchema::new("pid", PostgresType::Uuid)
                    .not_null()
                    .unique()
                    .default("gen_random_uuid()"),
            )
            .column(ColumnSchema::new("employee_id", PostgresType::BigInt).not_null())
            .column(ColumnSchema::new("requested_date", PostgresType::Date).not_null())
            .column(
                ColumnSchema::new("days_requested", PostgresType::Numeric(Some(4), Some(1)))
                    .not_null()
                    .default("1.0"),
            )
            .column(ColumnSchema::new("reason", PostgresType::Text).not_null())
            .column(
                ColumnSchema::new("status", PostgresType::VarChar(Some(50)))
                    .not_null()
                    .default("'PENDING'"),
            )
            .column(ColumnSchema::new("reviewer_name", PostgresType::VarChar(Some(200))).nullable())
            .column(ColumnSchema::new("rejection_reason", PostgresType::Text).nullable())
            .column(ColumnSchema::new("reviewed_at", PostgresType::TimestampTz).nullable())
            .column(
                ColumnSchema::new("created_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .column(
                ColumnSchema::new("updated_at", PostgresType::TimestampTz)
                    .not_null()
                    .default("CURRENT_TIMESTAMP"),
            )
            .foreign_key(
                ForeignKeySchema::new(
                    "fk_comp_off_requests_employee",
                    "employee_id",
                    "time_employees",
                    "id",
                )
                .on_delete("CASCADE"),
            )
            .check_constraint(CheckConstraintSchema::new(
                "chk_comp_off_requests_status",
                "status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')",
            ))
            .check_constraint(CheckConstraintSchema::new(
                "chk_comp_off_requests_days",
                "days_requested > 0.0",
            ))
            .index(IndexSchema::new(
                "idx_comp_off_requests_emp",
                &["employee_id"],
            ))
            .index(IndexSchema::new(
                "idx_comp_off_requests_status",
                &["status"],
            ))
    }
}

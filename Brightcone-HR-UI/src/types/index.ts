export interface Shift {
  id: number;
  pid: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  grace_period_minutes: number;
  is_overnight: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  id: number;
  pid: string;
  name: string;
  holiday_date: string;
  description?: string | null;
  applicable_location?: string | null;
  is_recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveType {
  id: number;
  pid: string;
  name: string;
  code: string;
  description?: string | null;
  is_paid: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveQuota {
  id: number;
  pid: string;
  leave_type_id: number;
  leave_type_name?: string;
  leave_type_code?: string;
  year: number;
  entitled_days: number;
  applicable_group: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  pid: string;
  name: string;
  email: string;
  role: string;
  department: string;
  default_shift_id?: number | null;
  default_shift_name?: string | null;
  default_shift_code?: string | null;
  avatar_color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DayRosterEntry {
  date: string;
  day_name: string;
  day_number: number;
  shift_id: number | null;
  shift_code: string | null;
  shift_name: string | null;
  is_off: boolean;
  notes?: string | null;
}

export interface EmployeeRosterRow {
  id: number;
  pid: string;
  name: string;
  email: string;
  role: string;
  department: string;
  default_shift_id?: number | null;
  default_shift_name?: string | null;
  default_shift_code?: string | null;
  avatar_color: string;
  days: DayRosterEntry[];
}

export interface RosterSummary {
  scheduled_today: number;
  total_employees: number;
  shifts_defined: number;
  shift_codes: string[];
  swap_requests_count: number;
  on_leave_this_week_count: number;
}

export interface WeeklyRosterResponse {
  week_start: string;
  week_end: string;
  is_published: boolean;
  published_at?: string | null;
  published_by?: string | null;
  summary: RosterSummary;
  employees: EmployeeRosterRow[];
}

export interface AssignShiftPayload {
  employee_id: number;
  date: string;
  shift_id?: number | null;
  is_off?: boolean;
  notes?: string;
}

export interface PublishRosterPayload {
  week_start_date: string;
  published_by?: string;
  notes?: string;
}

export type ActiveTab =
  | 'weekly-roster'
  | 'daily-attendance'
  | 'login-logout'
  | 'login-logout'
  | 'shifts'
  | 'holidays'
  | 'leave-types'
  | 'leave-quotas'
  | 'leave-calculator'
  | 'leave-requests'
  | 'work-from-home'
  | 'comp-off'
  | 'shift-swaps';

export interface DailyAttendanceRecord {
  id: number;
  pid: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department: string;
  employee_avatar_color: string;
  attendance_date: string;
  attendance_status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | string;
  in_time: string | null;
  out_time: string | null;
  hours_worked: number;
  entry_status: 'RECORDED' | 'PENDING' | 'REGULARISED' | string;
  is_archived: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  total_records: number;
  recorded_count: number;
  pending_count: number;
  regularised_count: number;
}

export interface AttendanceListResponse {
  summary: AttendanceSummary;
  records: DailyAttendanceRecord[];
  archived_count: number;
}

export interface CreateAttendancePayload {
  employee_id: number;
  date: string;
  attendance_status: string;
  in_time?: string | null;
  out_time?: string | null;
  entry_status?: string | null;
  notes?: string | null;
}

export interface UpdateAttendancePayload {
  attendance_status?: string;
  in_time?: string | null;
  out_time?: string | null;
  entry_status?: string;
  is_archived?: boolean;
  notes?: string | null;
}

export interface ClockInPayload {
  employee_id: number;
  date?: string;
  time?: string;
  notes?: string;
}

export interface ClockOutPayload {
  employee_id: number;
  date?: string;
  time?: string;
  notes?: string;
}

export interface TodayAttendanceStatus {
  date: string;
  employee_id: number;
  record: DailyAttendanceRecord | null;
  can_clock_in: boolean;
  can_clock_out: boolean;
  status: 'NOT_CLOCKED_IN' | 'CLOCKED_IN' | 'CLOCKED_OUT' | string;
}


export interface DateDayDetail {
  date: string;
  day_name: string;
  is_weekend: boolean;
  is_scheduled_off: boolean;
  is_holiday: boolean;
  holiday_name: string | null;
  is_chargeable: boolean;
  chargeable_value: number;
}

export interface LeaveCalculationResult {
  start_date: string;
  end_date: string;
  total_calendar_days: number;
  chargeable_days: number;
  weekend_days: number;
  holiday_days: number;
  working_days: number;
  policy_applied: string;
  leave_type_code: string | null;
  breakdown: DateDayDetail[];
}

export interface CountLeaveDaysRequest {
  start_date: string;
  end_date: string;
  employee_id?: number;
  leave_type_id?: number;
  leave_type_code?: string;
  is_half_day?: boolean;
  count_calendar_days?: boolean;
  exclude_weekends?: boolean;
  exclude_holidays?: boolean;
  applicable_location?: string;
}

export type CorrectionType = 'MISSED_CLOCK_IN' | 'MISSED_CLOCK_OUT';
export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceCorrectionRequest {
  id: number;
  pid: string;
  employee_id: number;
  employee_name?: string | null;
  employee_email?: string | null;
  employee_department?: string | null;
  avatar_color?: string | null;
  attendance_date: string;
  correction_type: CorrectionType | string;
  requested_time: string;
  reason: string;
  status: CorrectionStatus | string;
  previous_in_time?: string | null;
  previous_out_time?: string | null;
  previous_hours_worked?: number | null;
  previous_status?: string | null;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCorrectionPayload {
  employee_id: number;
  attendance_date: string;
  correction_type: CorrectionType | string;
  requested_time: string;
  reason: string;
}

export interface ApproveCorrectionPayload {
  reviewer_name?: string;
  notes?: string;
}

export interface RejectCorrectionPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface CorrectionQuery {
  employee_id?: number;
  status?: string;
  date?: string;
}

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  pid: string;
  employee_id: number;
  employee_name?: string | null;
  employee_email?: string | null;
  employee_department?: string | null;
  avatar_color?: string | null;
  leave_type_id: number;
  leave_type_name?: string | null;
  leave_type_code?: string | null;
  is_paid?: boolean;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  reason: string;
  total_days: number;
  days_count?: number;
  status: LeaveRequestStatus | string;
  reviewer_name?: string | null;
  approved_by_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveRequestPayload {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  reason: string;
}

export interface ApproveLeaveRequestPayload {
  reviewer_name?: string;
}

export interface RejectLeaveRequestPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface LeaveRequestQuery {
  employee_id?: number;
  status?: string;
  year?: number;
}

export interface LeaveBalanceItem {
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  is_paid: boolean;
  entitled_days: number;
  consumed_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface LeaveBalanceResponse {
  employee_id: number;
  year: number;
  balances: LeaveBalanceItem[];
}


export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// =========================================================================
// Work From Home (WFH) Types
// =========================================================================

export type WfhStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface WorkFromHomeRequest {
  id: number;
  pid: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department: string;
  avatar_color: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: WfhStatus | string;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWfhPayload {
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface ApproveWfhPayload {
  reviewer_name?: string;
}

export interface RejectWfhPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface WfhQuery {
  employee_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

// =========================================================================
// Comp-Off Tracker Types
// =========================================================================

export interface CompOffBalance {
  employee_id: number;
  employee_name?: string | null;
  total_earned_days: number;
  used_days: number;
  pending_days: number;
  available_days: number;
}

export interface CompOffEntitlement {
  id: number;
  pid: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department: string;
  avatar_color: string;
  earned_date: string;
  days_earned: number;
  reason: string;
  expiry_date?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | string;
  created_at: string;
  updated_at: string;
}

export interface CompOffRequest {
  id: number;
  pid: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department: string;
  avatar_color: string;
  requested_date: string;
  days_requested: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | string;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrantCompOffPayload {
  employee_id: number;
  earned_date: string;
  days_earned: number;
  reason: string;
  expiry_date?: string | null;
}

export interface CreateCompOffRequestPayload {
  employee_id: number;
  requested_date: string;
  days_requested?: number;
  reason: string;
}

export interface ApproveCompOffPayload {
  reviewer_name?: string;
}

export interface RejectCompOffPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface CompOffQuery {
  employee_id?: number;
  status?: string;
}

// =========================================================================
// Shift Swap Request Types
// =========================================================================

export type SwapStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface SwapRequestDetail {
  id: number;
  pid: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  requester_avatar_color: string;
  target_employee_id?: number | null;
  target_employee_name?: string | null;
  target_employee_email?: string | null;
  target_employee_department?: string | null;
  target_employee_avatar_color?: string | null;
  request_date: string;
  target_date?: string | null;
  source_shift_id?: number | null;
  source_shift_name?: string | null;
  source_shift_code?: string | null;
  target_shift_id?: number | null;
  target_shift_name?: string | null;
  target_shift_code?: string | null;
  status: SwapStatus | string;
  reason?: string | null;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSwapPayload {
  requester_id: number;
  target_employee_id?: number | null;
  request_date: string;
  target_date?: string | null;
  source_shift_id?: number | null;
  target_shift_id?: number | null;
  reason?: string | null;
}

export interface ApproveSwapPayload {
  reviewer_name?: string;
}

export interface RejectSwapPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface SwapQuery {
  employee_id?: number;
  status?: string;
  date?: string;
}



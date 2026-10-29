export interface Employee {
  id: string; // e.g. "BC-1001"
  name: string;
  role: string;
  department: string;
  grade: string;
  location: string;
  manager: string;
  status: 'Active' | 'On leave' | 'Terminated' | 'Probation' | string;
  email: string;
  joined_date?: string;
}

export interface EmployeeProfile {
  employee_id: string;
  full_name: string;
  work_email: string;
  role: string;
  department: string;
  status: string;
  phone: string;
  dob: string;
  blood_group: string;
  address: string;
  emergency_contact: string;
  manager: string;
  grade: string;
  location: string;
  doj: string;
  bank_name: string;
  bank_account: string;
  ifsc: string;
  pan: string;
  uan: string;
  nominee_name: string;
  nominee_relation: string;
}

export interface ManpowerHistoryItem {
  status: string;
  timestamp: string;
  user: string;
}

export interface ManpowerRequirement {
  id: string;
  designation: string;
  department: string;
  positions: number;
  hiring_manager: string;
  required_by: string;
  status: 'Overdue' | 'Approved' | 'Pending' | 'On hold' | string;
  employment_type?: string;
  location?: string;
  experience?: string;
  budget_ctc?: string;
  reason?: string;
  replacing?: string;
  job_description?: string;
  history?: ManpowerHistoryItem[];
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
}

export interface CandidateHistoryItem {
  stage: string;
  timestamp: string;
  user: string;
}

export interface CandidateTracker {
  id: string;
  full_name: string;
  applied_for: string;
  source: string;
  total_experience: number;
  current_ctc?: number;
  expected_ctc: number;
  notice_period?: number;
  current_location?: string;
  resume?: string;
  consent_to_store_data?: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Selected' | 'Offered' | 'Joined' | 'Rejected' | 'On hold' | string;
  email: string;
  phone: string;
  employee_id?: string;
  archived?: boolean;
  history?: CandidateHistoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeReferral {
  id: string;
  candidate_name: string;
  role: string;
  referred_by: string;
  bonus: number;
  status: 'Applied' | 'Interview' | 'Offered' | 'Hired' | string;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface EmployeeLeave {
  id: string;
  employee_id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected' | string;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  date: string;
  punch_in: string;
  punch_out?: string | null;
  work_hours: string;
  status: string;
}

export interface WakeupStatus {
  status: string;
  background_process: string;
  wakeup_interval_secs: number;
  total_wakeups_recorded: number;
  last_wakeup_call: string;
  database_connection_pool: string;
  postgres_sync: string;
}

export interface EmployeeFilterQuery {
  q?: string;
  department?: string;
  status?: string;
}

export interface CreateEmployeePayload {
  id?: string;
  name: string;
  role: string;
  department: string;
  grade: string;
  location: string;
  manager: string;
  status: string;
  email: string;
}

export type ServiceRequestCategory =
  | 'Payroll & tax'
  | 'Benefits & insurance'
  | 'Letters & documents'
  | 'Leave & attendance'
  | 'IT & assets'
  | 'Other';

export interface ServiceRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  category: ServiceRequestCategory | string;
  subject: string;
  priority: 'Normal' | 'Urgent' | 'High' | 'Low' | string;
  details: string;
  status: 'Submitted' | 'In Review' | 'In Progress' | 'Resolved' | string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequestPayload {
  employee_id?: string;
  employee_name?: string;
  category: ServiceRequestCategory | string;
  subject: string;
  priority?: string;
  details: string;
}

export interface EmployeeDependent {
  id: string;
  employee_id: string;
  name: string;
  relationship: 'Spouse' | 'Mother' | 'Father' | 'Child' | 'Sibling' | 'Other' | string;
  dob: string;
  date_of_birth?: string;
  created_at?: string;
}

export interface CreateDependentPayload {
  employee_id?: string;
  name: string;
  relationship: string;
  dob: string;
  date_of_birth?: string;
}

export interface AttendanceRegularisation {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  clock_in: string;
  clock_out: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected' | string;
  created_at?: string;
}

export interface DayAttendanceCard {
  day: string;
  date_label: string;
  hours: string;
  status: 'Present' | 'Remote' | 'Holiday' | 'Weekend' | 'Absent' | string;
}

export interface AttendanceSummaryResponse {
  employee_id: string;
  today_clocked_in: boolean;
  today_punch_in?: string | null;
  today_punch_out?: string | null;
  today_elapsed_seconds: number;
  avg_hours_monthly: string;
  target_hours: string;
  late_arrivals: number;
  grace_limit: number;
  last_week: DayAttendanceCard[];
  regularisations: AttendanceRegularisation[];
}

export interface CreateRegularisationPayload {
  employee_id: string;
  employee_name?: string;
  date: string;
  clock_in: string;
  clock_out: string;
  reason: string;
}

export interface CompanyPolicy {
  id: string;
  title: string;
  version: string;
  updated_date: string;
  acknowledgement_required: boolean;
  category: string;
  content: string;
  acknowledged: boolean;
  acknowledged_at?: string | null;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  status: 'Verified' | 'Pending' | 'Rejected' | string;
  file_path: string;
  file_size: string;
  uploaded_at: string;
  download_url?: string;
}

export interface UploadDocumentPayload {
  employee_id: string;
  document_name: string;
  file_name: string;
  file_data_base64: string;
}

export interface LetterRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  letter_type: string;
  addressed_to: string;
  requested_date: string;
  status: 'Issued' | 'Pending' | 'Rejected' | string;
  file_path: string;
  purpose: string;
  created_at?: string;
  download_url?: string;
}

export interface CreateLetterRequestPayload {
  employee_id: string;
  employee_name?: string;
  letter_type: string;
  addressed_to: string;
  purpose?: string;
}


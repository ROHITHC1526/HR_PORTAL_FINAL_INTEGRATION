export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  skills: string;
  status: string; // 'Active' | 'Closed' | 'Draft'
  posted_date: string;
}

export interface CreateJobPayload {
  title: string;
  department: string;
  location: string;
  skills: string;
  status: string;
  referral_bonus?: number;
  employment_type?: string;
}

export type CandidateStage = 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Offer' | 'Selected' | 'Hired' | 'Rejected';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  job_id: number;
  job_title: string;
  skills: string;
  status: CandidateStage | string;
  applied_date: string;
  source?: string;
  match_score?: number;
}

export interface CreateCandidatePayload {
  name: string;
  email: string;
  job_id: number;
  skills: string;
  status: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email?: string;
  job_title?: string;
  interview_date: string;
  formatted_date?: string;
  interviewer: string;
  interview_type?: string;
  notes?: string;
  status: string; // 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'
  round?: string; // 'HR screening' | 'Technical 1' | 'Technical 2' | 'Managerial' | 'Final / founder'
  mode?: string; // 'In person' | 'Video call' | 'Phone'
  time?: string;
  venue_link?: string;
  rating?: number;
  result?: string; // 'Pass' | 'Fail' | 'On hold' | 'Pending'
  feedback?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  history?: InterviewHistoryItem[];
}

export interface InterviewHistoryItem {
  status: string;
  timestamp: string;
  user: string;
}

export interface ScheduleInterviewPayload {
  candidate_id?: number;
  candidate_name?: string;
  interview_date: string;
  interviewer: string;
  interview_type?: string;
  notes?: string;
  round?: string;
  mode?: string;
  time?: string;
  venue_link?: string;
  rating?: number;
  result?: string;
  feedback?: string;
  status?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  history?: InterviewHistoryItem[];
}

export interface OfferHistoryItem {
  status: string;
  timestamp: string;
  user: string;
}

export interface OfferLetter {
  id: string;
  candidate_id?: string;
  candidate_name: string;
  designation: string;
  department?: string;
  annual_ctc: string;
  joining_date: string;
  offer_date?: string;
  valid_till: string;
  approved_by?: string;
  offer_letter_file?: string;
  status: 'Draft' | 'Pending approval' | 'Approved' | 'Sent' | 'Accepted' | 'Declined' | string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  history?: OfferHistoryItem[];
}

export interface CreateOfferPayload {
  candidate_id?: string;
  candidate_name: string;
  designation: string;
  department?: string;
  annual_ctc: string;
  joining_date: string;
  offer_date?: string;
  valid_till: string;
  approved_by?: string;
  offer_letter_file?: string;
  status: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  history?: OfferHistoryItem[];
}

// ---------------------------------------------------------------------------
// Joining Formalities Types
// ---------------------------------------------------------------------------
export interface JoiningHistoryItem {
  status: string;
  timestamp: string;
  user: string;
}

export interface JoiningRecord {
  id: string;
  candidate_id?: string;
  offer_letter_id?: string;
  employee_id?: string;
  candidate_name?: string;
  employee_name?: string;
  joining_date: string;
  department?: string;
  designation?: string;
  reporting_manager?: string;
  documents_submitted?: string;
  documents_verified?: boolean;
  verification_status?: 'Pending' | 'In progress' | 'Verified' | 'Rejected' | string;
  joining_status?: 'Pending' | 'In progress' | 'Completed' | string;
  remarks?: string;
  documents_collected?: 'Yes' | 'No' | '';
  id_card_issued?: 'Yes' | 'No' | '';
  work_email_created?: 'Yes' | 'No' | '';
  laptop_issued?: 'Yes' | 'No' | '';
  pf_nomination_form?: 'Yes' | 'No' | '';
  appointment_letter_issued?: 'Yes' | 'No' | '';
  status?: 'Pending' | 'In progress' | 'Completed' | string;
  notes?: string;
  archived?: boolean;
  history?: JoiningHistoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateJoiningRecordPayload {
  id?: string;
  candidate_id?: string;
  offer_letter_id?: string;
  employee_id?: string;
  candidate_name?: string;
  employee_name?: string;
  joining_date: string;
  department?: string;
  designation?: string;
  reporting_manager?: string;
  documents_submitted?: string;
  documents_verified?: boolean;
  verification_status?: string;
  joining_status?: string;
  remarks?: string;
  documents_collected?: 'Yes' | 'No' | '';
  id_card_issued?: 'Yes' | 'No' | '';
  work_email_created?: 'Yes' | 'No' | '';
  laptop_issued?: 'Yes' | 'No' | '';
  pf_nomination_form?: 'Yes' | 'No' | '';
  appointment_letter_issued?: 'Yes' | 'No' | '';
  status?: string;
  notes?: string;
  archived?: boolean;
  history?: JoiningHistoryItem[];
  create_employee?: boolean;
}

export interface UpdateJoiningStatusPayload {
  status: string;
  remarks?: string;
}

export interface UpdateJoiningDocumentsPayload {
  documents_submitted?: string;
  documents_verified?: boolean;
  verification_status?: string;
  documents_collected?: 'Yes' | 'No' | '';
  id_card_issued?: 'Yes' | 'No' | '';
  work_email_created?: 'Yes' | 'No' | '';
  laptop_issued?: 'Yes' | 'No' | '';
  pf_nomination_form?: 'Yes' | 'No' | '';
  appointment_letter_issued?: 'Yes' | 'No' | '';
  remarks?: string;
}

// ---------------------------------------------------------------------------
// Onboarding Checklist Types
// ---------------------------------------------------------------------------
export interface AuditHistoryItem {
  status: string;
  timestamp: string;
  user: string;
}

export interface OnboardingChecklistItem {
  id: string;
  checklist_id: string;
  employee_id?: string;
  employee_name?: string;
  title: string;
  task?: string;
  description?: string;
  notes?: string;
  assigned_to?: string;
  owner?: string;
  due_date?: string;
  status: 'Pending' | 'In progress' | 'Completed' | string;
  completed_at?: string;
  completed_on?: string;
  archived?: boolean;
  history?: AuditHistoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateOnboardingTaskPayload {
  id?: string;
  employee_id: string;
  employee_name?: string;
  task: string;
  owner?: string;
  due_date: string;
  status?: string;
  completed_on?: string;
  notes?: string;
  timestamp?: string;
  user?: string;
}

export interface CreateStandardChecklistPayload {
  employee_id: string;
}

export interface OnboardingChecklist {
  id: string;
  employee_id: string;
  employee_name?: string;
  title: string;
  description?: string;
  assigned_by?: string;
  start_date?: string;
  due_date?: string;
  status: 'Pending' | 'In progress' | 'Completed' | string;
  completion_percentage: number;
  items: OnboardingChecklistItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateChecklistPayload {
  employee_id: string;
  title: string;
  description?: string;
  assigned_by?: string;
  start_date?: string;
  due_date?: string;
  items?: Array<{
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    status?: string;
  }>;
}

export interface CreateChecklistItemPayload {
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  status?: string;
}

export interface UpdateChecklistItemPayload {
  title?: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Internship Management Types
// ---------------------------------------------------------------------------
export interface Internship {
  id: string;
  intern_name: string;
  email: string;
  phone?: string;
  college?: string;
  degree?: string; // Course
  department?: string;
  internship_role: string;
  mentor_employee_id?: string;
  mentor_name?: string;
  start_date: string;
  end_date: string;
  stipend?: string;
  status: 'Active' | 'Completed' | 'Converted' | 'PPO Offered' | 'Terminated' | string;
  work_mode?: 'In-office' | 'Hybrid' | 'Remote' | string;
  project_title?: string;
  performance_rating?: number;
  feedback?: string;
  archived?: boolean;
  history?: AuditHistoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateInternshipPayload {
  intern_name: string;
  email: string;
  phone?: string;
  college?: string;
  degree?: string;
  department?: string;
  internship_role?: string;
  mentor_employee_id?: string;
  mentor_name?: string;
  start_date: string;
  end_date: string;
  stipend?: string;
  status?: string;
  work_mode?: string;
  project_title?: string;
  performance_rating?: number;
  feedback?: string;
  timestamp?: string;
  user?: string;
}

export interface UpdateInternshipStatusPayload {
  status: string;
  feedback?: string;
  performance_rating?: number;
  timestamp?: string;
  user?: string;
}

export interface ConvertInternshipPayload {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  department: string;
  designation: string;
  grade?: string;
  location?: string;
  reporting_manager?: string;
  employment_type: string;
  date_of_joining: string;
  status: string;
  timestamp?: string;
  user?: string;
}




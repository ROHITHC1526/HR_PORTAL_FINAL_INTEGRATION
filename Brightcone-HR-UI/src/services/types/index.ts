export interface User {
  id?: string;
  pid?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  departmentId?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  loc: string;
  mgr: string | null;
  status: 'Active' | 'Inactive' | 'On leave' | 'Probation' | 'Notice period';
}

export type CourseContentType = 'document' | 'video' | 'link';

export interface Course {
  id: string;
  title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  audience: string;
  due_date: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
  total_assigned: number;
  completed_count: number;
  completion_percentage: number;
  category_id?: string | null;
  category_name?: string | null;
  created_at?: string;
}

export interface CourseAssignment {
  id: string;
  course_id: string;
  employee_id: string;
  employee_name: string;
  progress: number;
  status: 'Not started' | 'In progress' | 'Completed';
  completed_at?: string | null;
}

export interface MyAssignment {
  assignment_id: string;
  course_id: string;
  course_title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  due_date: string | null;
  is_overdue?: boolean;
  progress: number;
  status: 'Not started' | 'In progress' | 'Completed';
  completed_at?: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
  score?: number | null;
}

// ---------------------------------------------------------------------------
// DOC-14: Training Programmes, POSH, Security Training, and Completion Types
// ---------------------------------------------------------------------------

export interface TrainingProgramme {
  id: string;
  prog: string;
  ttype: string;
  trainer?: string | null;
  mode?: string | null;
  start: string;
  end?: string | null;
  parts?: number | null;
  cost?: number | null;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'Cancelled';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PoshRecord {
  id: string;
  rtype: 'Committee member' | 'Training session';
  emp?: string | null;
  name: string;
  role?: string | null;
  date: string;
  valid?: string | null;
  parts?: number | null;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Overdue';
  created_at?: string;
  updated_at?: string;
}

export interface SecurityTraining {
  id: string;
  course: string;
  emp: string;
  assigned: string;
  due?: string | null;
  done?: string | null;
  score?: number | null;
  status: 'Pending' | 'In progress' | 'Completed' | 'Overdue';
  course_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BulkAssignResponse {
  assigned: number;
  skipped: number;
  failed: number;
  message: string;
}

export interface EmployeeTrainingItem {
  id: string;
  title: string;
  training_type: 'Course' | 'Security';
  due_date?: string | null;
  completed_at?: string | null;
  progress: number;
  score?: number | null;
  is_assessment: boolean;
  status: string;
}

export interface CompletionTrackerRecord {
  employee_id: string;
  employee_name: string;
  department: string;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  overdue_count: number;
  progress_pct: number;
  status: 'Compliant' | 'In progress' | 'Not started' | 'Overdue' | 'Not assigned';
  items?: EmployeeTrainingItem[];
}

export interface CompletionTrackerResponse {
  total_employees: number;
  fully_compliant_count: number;
  in_progress_count: number;
  overdue_count: number;
  not_assigned_count?: number;
  overall_compliance_pct: number;
  records: CompletionTrackerRecord[];
}

export interface AssignCoursePayload {
  audience?: string;
  employee_ids?: string[];
  due_date?: string;
}

export interface AssignCourseResponse {
  assigned: number;
  skipped: number;
  failed: number;
  message: string;
}

export interface OpenMandatoryItem {
  assignment_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  course_id: string;
  course_title: string;
  due_date: string | null;
  progress: number;
}

export interface CourseCompletionStat {
  course_id: string;
  title: string;
  course_type: string;
  total_assigned: number;
  completed_count: number;
  percentage: number;
}

export interface MandatoryCourseStat {
  course_id: string;
  title: string;
  due_date: string | null;
  completed_count: number;
  total_assigned: number;
}

export interface LearnDashboardMetrics {
  mandatory_compliance: number;
  total_courses: number;
  mandatory_courses_count: number;
  elective_courses_count: number;
  in_progress_count: number;
  people_behind_count: number;
  completion_by_course: CourseCompletionStat[];
  compliance_breakdown: MandatoryCourseStat[];
  open_mandatory: OpenMandatoryItem[];
  total_open_mandatory: number;
}

export interface ReminderDetail {
  assignment_id: string;
  employee_name: string;
  course_title: string;
  status: 'Queued' | 'Delivered' | 'Skipped' | 'Failed';
  reason?: string | null;
}

export interface RemindResponse {
  queued: number;
  delivered: number;
  skipped: number;
  failed: number;
  message: string;
  details: ReminderDetail[];
}

export interface CreateCoursePayload {
  title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  audience: string;
  due_date: string | null;
  category_id?: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---------------------------------------------------------------------------
// REC-12: Performance Admin Types
// ---------------------------------------------------------------------------

export type ReviewStageIndex = 0 | 1 | 2 | 3 | 4;

export interface ReviewCycle {
  id: string;
  name: string;
  stage: number;
  self_review_due: string;
  status: 'Active' | 'Archived' | 'Completed';
  created_at?: string;
  updated_at?: string;
}

export interface CycleReviewItem {
  id: string;
  cycle_id: string;
  employee_id: string;
  employee_name: string;
  manager_name: string;
  department: string;
  self_review_status: 'Submitted' | 'Not submitted';
  self_rating?: string | null;
  goals_count: number;
  rating?: string | null;
  recommended_increment_percentage?: number | null;
  rated_by?: string | null;
  rated_at?: string | null;
  last_reminded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CycleDashboardSummary {
  self_reviews_submitted: number;
  manager_reviews_done: number;
  total_eligible: number;
  goals_count: number;
}

export interface CycleDashboardData {
  cycle: ReviewCycle;
  summary: CycleDashboardSummary;
  reviews: CycleReviewItem[];
}

export interface CreateCyclePayload {
  name: string;
  self_review_due: string;
}

export interface RateEmployeePayload {
  rating: string;
  recommended_increment_percentage?: number | null;
}

export interface RemindReviewResult {
  status: 'queued' | 'skipped' | 'failed';
  message: string;
  reason?: string | null;
}

// ==========================================
// LEARN PLACEHOLDER FEATURES (Categories, Skills Matrix, Records, Recommendations)
// ==========================================

export interface CourseCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  course_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string | null;
  description?: string | null;
  color?: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string | null;
}

export interface CreateSkillPayload {
  name: string;
  category: string;
  description?: string | null;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface EmployeeSkillRating {
  level: SkillLevel;
  verified: boolean;
  verified_by?: string | null;
  updated_at: string;
}

export interface MatrixEmployeeRow {
  employee_code: string;
  full_name: string;
  department: string;
  role: string;
  skills: Record<string, EmployeeSkillRating>;
}

export interface SkillsMatrixResponse {
  skills: Skill[];
  employees: MatrixEmployeeRow[];
  categories: string[];
  levels: string[];
}

export interface RateSkillPayload {
  employee_id: string;
  skill_id: string;
  level: SkillLevel;
  verified?: boolean;
}

export interface CompletionRecord {
  id: string;
  course_id: string;
  course_title: string;
  course_type: string;
  category_name?: string | null;
  duration: string;
  completed_at?: string | null;
  is_assessment: boolean;
  score?: number | null;
  record_type: 'hr_recorded' | 'assessment_verified' | 'self_reported';
  employee_name: string;
  employee_id: string;
}

export interface SkillRecommendation {
  id: string;
  course_id: string;
  title: string;
  course_type: string;
  duration: string;
  category?: string | null;
  due_date?: string | null;
  rule_type: 'mandatory_compliance' | 'department_skill' | 'proficiency_growth';
  reason: string;
  skill_name?: string | null;
}

export interface RecommendationsResponse {
  recommendations: SkillRecommendation[];
  employee_department: string;
  employee_name: string;
  total_skills_mastered: number;
}

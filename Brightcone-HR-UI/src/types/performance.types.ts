export interface Goal {
  id: number;
  employee_id: string;
  employee_name: string;
  title: string;
  category: string; // 'Engineering' | 'Leadership' | 'Delivery' | 'Product'
  target_date: string;
  progress: number; // 0 - 100
  status: 'In Progress' | 'Completed' | 'Behind' | string;
}

export interface PerformanceReview {
  id: number;
  employee_id: string;
  employee_name: string;
  reviewer_name: string;
  cycle: string; // 'Q3 2026' | 'Annual 2026'
  rating: number; // 1.0 - 5.0
  feedback: string;
  status: 'Completed' | 'Pending Review' | string;
  updated_at: string;
}

export interface CreateGoalPayload {
  employee_id: string;
  employee_name: string;
  title: string;
  category: string;
  target_date: string;
  progress: number;
  status: string;
}

export interface CreateReviewPayload {
  employee_id: string;
  employee_name: string;
  reviewer_name: string;
  cycle: string;
  rating: number;
  feedback: string;
  status: string;
}

export interface PeerFeedback {
  id: string;
  from_employee_id: string;
  from_employee_name: string;
  to_employee_id: string;
  to_employee_name: string;
  feedback: string;
  date: string;
  created_at?: string;
}

export interface CreateFeedbackPayload {
  from_employee_id: string;
  from_employee_name?: string;
  to_employee_id: string;
  to_employee_name?: string;
  feedback: string;
}

export interface ReviewCycleStatus {
  cycle: string;
  current_step: number;
  self_review_submitted: boolean;
  self_review_status_text: string;
  due_date: string;
}

export interface SelfReviewPayload {
  employee_id: string;
  cycle: string;
  accomplishments: string;
  rating: number;
}


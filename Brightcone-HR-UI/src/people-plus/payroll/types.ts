export interface PayrollMetrics {
  gross_pay_current: number;
  gross_pay_growth_pct: number;
  net_payout_current: number;
  employees_paid_count: number;
  total_deductions: number;
  next_pay_date: string;
  run_progress_step: number;
  run_total_steps: number;
  active_run_name: string;
  monthly_trend: { month: string; amount: number; label: string }[];
  run_steps: { id: number; title: string; status: 'completed' | 'in_progress' | 'pending' }[];
}

export interface EmployeePayslip {
  id: string;
  month: string;
  gross: number;
  basic: number;
  hra: number;
  special_allowance: number;
  pf: number;
  pt: number;
  tds: number;
  net: number;
  payment_date: string;
  status: 'Paid' | 'Processing';
}

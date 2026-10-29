export interface PayrollRun {
  id: string;
  month: string;
  status: string;
  current_step: number;
  total_employees: number;
  total_gross: number;
  total_net: number;
  total_deductions: number;
  is_locked: boolean;
  is_supplementary: boolean;
  supplementary_notes?: string;
  disbursed_at?: string;
  created_at: string;
}

export interface AttendanceSyncItem {
  employee_id: string;
  employee_name: string;
  department: string;
  total_days: number;
  days_worked: number;
  paid_leaves: number;
  lop_days: number;
  payable_days: number;
}

export interface VarianceItem {
  employee_id: string;
  employee_name: string;
  department: string;
  previous_net: number;
  current_net: number;
  variance_amount: number;
  variance_pct: number;
  flagged: boolean;
  reason: string;
}

export interface OneTimeInput {
  id: string;
  emp: string;
  type: string;
  amt: number;
  notes?: string;
}

export interface RegisterItem {
  empId: string;
  name: string;
  dept: string;
  gross: number;
  pf: number;
  pt: number;
  tds: number;
  net: number;
}

export const registerItems: RegisterItem[] = [
  { empId: "BC-1001", name: "Ananya Rao", dept: "People Ops", gross: 145000, pf: 1740, pt: 200, tds: 12500, net: 130560 },
  { empId: "BC-1002", name: "Rahul Varma", dept: "Engineering", gross: 195000, pf: 1800, pt: 200, tds: 21000, net: 172000 },
  { empId: "BC-1003", name: "Karthik Reddy", dept: "Engineering", gross: 240000, pf: 1800, pt: 200, tds: 32000, net: 206000 },
  { empId: "BC-1004", name: "Meera Joshi", dept: "Finance", gross: 160000, pf: 1800, pt: 200, tds: 16500, net: 141500 },
  { empId: "BC-1005", name: "Pooja Hegde", dept: "Design", gross: 135000, pf: 1620, pt: 200, tds: 10500, net: 122680 },
  { empId: "BC-1006", name: "Vikram Singh", dept: "Engineering", gross: 110000, pf: 1320, pt: 200, tds: 7500, net: 100980 },
  { empId: "BC-1007", name: "Divya Kulkarni", dept: "Marketing", gross: 125000, pf: 1500, pt: 200, tds: 9200, net: 114100 },
  { empId: "BC-1008", name: "Siddharth Sen", dept: "Sales", gross: 150000, pf: 1800, pt: 200, tds: 14000, net: 134000 },
];

export const formatINR = (val: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const paySteps = [
  { title: "Sync attendance & leave", desc: "Biometric and leave balances reconciliation" },
  { title: "Add bonuses & deductions", desc: "One-time variable inputs and ad-hoc additions" },
  { title: "Review variances", desc: "Audit flags exceeding 10% net pay variance" },
  { title: "Approve payroll", desc: "Two-tier HR and Finance leadership sign-off" },
  { title: "Disburse & publish payslips", desc: "Generate payslips, disburse and lock month" },
];

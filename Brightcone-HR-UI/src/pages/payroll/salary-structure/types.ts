export interface SalaryStructure {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  effective_from: string;
  gross_monthly: number;
  basic: number;
  hra: number;
  special_allowance: number;
  employee_pf: number;
  professional_tax: number;
  estimated_tds: number;
  net_take_home: number;
  annual_ctc: number;
  pf_opt_out: boolean;
  tax_regime: string;
  is_active: boolean;
  superseded_by?: string;
}

export interface SalaryRevision {
  id: string;
  employee_id: string;
  employee_name: string;
  current_gross: number;
  proposed_gross: number;
  increment_percent: number;
  effective_date: string;
  reason: string;
  notes: string;
  status: "Draft" | "Under Review" | "Approved" | "Rejected";
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface IncrementRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  previous_gross: number;
  revised_gross: number;
  increment_amount: number;
  increment_percentage: number;
  effective_date: string;
  change_type: string;
  approved_by: string;
  approved_at: string;
  notes: string;
}

export interface SalaryBreakdown {
  gross_monthly_rupees: number;
  basic_monthly_rupees: number;
  hra_monthly_rupees: number;
  special_allowance_rupees: number;
  employee_pf_rupees: number;
  employer_pf_rupees: number;
  professional_tax_rupees: number;
  estimated_tds_rupees: number;
  net_take_home_rupees: number;
  annual_ctc_rupees: number;
  gross_monthly_paise: number;
  basic_monthly_paise: number;
  hra_monthly_paise: number;
  special_allowance_paise: number;
  employee_pf_paise: number;
  employer_pf_paise: number;
  professional_tax_paise: number;
  estimated_tds_paise: number;
  net_take_home_paise: number;
}

export const defaultStructures: SalaryStructure[] = [
  {
    id: "STR-001",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    department: "People Ops",
    effective_from: "2026-04-01",
    gross_monthly: 85000,
    basic: 42500,
    hra: 21250,
    special_allowance: 21250,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 2340,
    net_take_home: 80660,
    annual_ctc: 1041600,
    pf_opt_out: false,
    tax_regime: "New",
    is_active: true,
  },
  {
    id: "STR-002",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    department: "Engineering",
    effective_from: "2026-04-01",
    gross_monthly: 120000,
    basic: 60000,
    hra: 30000,
    special_allowance: 30000,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 6760,
    net_take_home: 111240,
    annual_ctc: 1461600,
    pf_opt_out: false,
    tax_regime: "New",
    is_active: true,
  },
  {
    id: "STR-003",
    employee_id: "EMP-003",
    employee_name: "Priya Sharma",
    department: "Product & Design",
    effective_from: "2026-04-01",
    gross_monthly: 65000,
    basic: 32500,
    hra: 16250,
    special_allowance: 16250,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 0,
    net_take_home: 63000,
    annual_ctc: 801600,
    pf_opt_out: false,
    tax_regime: "Old",
    is_active: true,
  },
];

export const defaultRevisions: SalaryRevision[] = [
  {
    id: "REV-101",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    current_gross: 85000,
    proposed_gross: 100000,
    increment_percent: 17.65,
    effective_date: "2026-11-01",
    reason: "Annual Appraisal",
    notes: "Exceeded Q2 & Q3 organizational hiring and portal delivery benchmarks.",
    status: "Under Review",
    created_at: "2026-10-10T11:00:00Z",
  },
  {
    id: "REV-102",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    current_gross: 120000,
    proposed_gross: 140000,
    increment_percent: 16.67,
    effective_date: "2026-11-01",
    reason: "Promotion",
    notes: "Promotion to Principal Rust Engineer & Platform Architect.",
    status: "Approved",
    approved_by: "Siddharth Patel (CEO)",
    approved_at: "2026-10-14T16:00:00Z",
    created_at: "2026-10-05T09:30:00Z",
  },
];

export const defaultHistory: IncrementRecord[] = [
  {
    id: "INC-01",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    previous_gross: 72000,
    revised_gross: 85000,
    increment_amount: 13000,
    increment_percentage: 18.06,
    effective_date: "2026-04-01",
    change_type: "Annual Appraisal",
    approved_by: "HR Compensation Committee",
    approved_at: "2026-03-25T14:00:00Z",
    notes: "FY26 merit-based appraisal cycle.",
  },
  {
    id: "INC-02",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    previous_gross: 100000,
    revised_gross: 120000,
    increment_amount: 20000,
    increment_percentage: 20.0,
    effective_date: "2026-04-01",
    change_type: "Promotion",
    approved_by: "Engineering VP",
    approved_at: "2026-03-20T10:00:00Z",
    notes: "Promotion to Senior Tech Lead.",
  },
  {
    id: "INC-03",
    employee_id: "EMP-003",
    employee_name: "Priya Sharma",
    previous_gross: 55000,
    revised_gross: 65000,
    increment_amount: 10000,
    increment_percentage: 18.18,
    effective_date: "2026-04-01",
    change_type: "Annual Appraisal",
    approved_by: "HR Committee",
    approved_at: "2026-03-24T12:00:00Z",
    notes: "Exceeded design system unification milestones.",
  },
];

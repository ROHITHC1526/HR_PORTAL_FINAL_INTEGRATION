export interface SalaryStructureRecord {
  id: string
  employeeId: string
  employeeName: string
  dept: string
  effectiveFrom: string
  annualCtc: number
  basic: number
  basicMonthly?: number
  hra: number
  hraMonthly?: number
  specialAllowance: number
  otherAllowance: number
  employerPf: number
  pfDeduction?: number
  ptDeduction?: number
  monthlyGross: number
  status: 'Draft' | 'Active' | 'Superseded'
  isArchived?: boolean
}

export const INITIAL_STRUCTURES: SalaryStructureRecord[] = [
  { id: 'STR-01', employeeId: 'BC-1001', employeeName: 'Ananya Rao', dept: 'People Ops', effectiveFrom: '2026-04-01', annualCtc: 1800000, basic: 72500, basicMonthly: 72500, hra: 29000, hraMonthly: 29000, specialAllowance: 43500, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 145000, status: 'Active' },
  { id: 'STR-02', employeeId: 'BC-1002', employeeName: 'Naresh Vemparala', dept: 'Operations', effectiveFrom: '2026-04-01', annualCtc: 2200000, basic: 90000, basicMonthly: 90000, hra: 36000, hraMonthly: 36000, specialAllowance: 54000, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 180000, status: 'Active' },
  { id: 'STR-03', employeeId: 'BC-1003', employeeName: 'Karthik Reddy', dept: 'Engineering', effectiveFrom: '2026-04-01', annualCtc: 3000000, basic: 120000, basicMonthly: 120000, hra: 48000, hraMonthly: 48000, specialAllowance: 72000, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 240000, status: 'Active' },
  { id: 'STR-04', employeeId: 'BC-1004', employeeName: 'Priya Menon', dept: 'Product', effectiveFrom: '2026-04-01', annualCtc: 2100000, basic: 85000, basicMonthly: 85000, hra: 34000, hraMonthly: 34000, specialAllowance: 51000, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 170000, status: 'Active' },
  { id: 'STR-05', employeeId: 'BC-1005', employeeName: 'Meera Joshi', dept: 'Finance', effectiveFrom: '2026-04-01', annualCtc: 2000000, basic: 80000, basicMonthly: 80000, hra: 32000, hraMonthly: 32000, specialAllowance: 48000, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 160000, status: 'Active' },
  { id: 'STR-06', employeeId: 'BC-1006', employeeName: 'Rahul Varma', dept: 'Engineering', effectiveFrom: '2026-04-01', annualCtc: 2400000, basic: 97500, basicMonthly: 97500, hra: 39000, hraMonthly: 39000, specialAllowance: 58500, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 195000, status: 'Active' },
  { id: 'STR-07', employeeId: 'BC-1007', employeeName: 'Sneha Iyer', dept: 'Design', effectiveFrom: '2026-04-01', annualCtc: 1050000, basic: 42500, basicMonthly: 42500, hra: 17000, hraMonthly: 17000, specialAllowance: 25500, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 85000, status: 'Active' },
  { id: 'STR-08', employeeId: 'BC-1001', employeeName: 'Ananya Rao', dept: 'People Ops', effectiveFrom: '2025-04-01', annualCtc: 1500000, basic: 60000, basicMonthly: 60000, hra: 24000, hraMonthly: 24000, specialAllowance: 36000, otherAllowance: 0, employerPf: 1800, pfDeduction: 1800, ptDeduction: 200, monthlyGross: 120000, status: 'Superseded' },
]

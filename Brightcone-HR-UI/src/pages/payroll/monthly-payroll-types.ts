export interface MonthlyPayrollRecord {
  id: string
  month: string
  employeeId: string
  employeeName: string
  dept: string
  workingDays: number
  lopDays: number
  paidDays: number
  grossPay: number
  totalDeductions: number
  deductions?: number
  netPay: number
  status: 'Draft' | 'Processed' | 'Approved' | 'Paid'
  isArchived?: boolean
}

export const INITIAL_MONTHLY_PAYROLL: MonthlyPayrollRecord[] = [
  { id: 'PR-101', month: '2026-10', employeeId: 'BC-1001', employeeName: 'Ananya Rao', dept: 'People Ops', workingDays: 22, lopDays: 0, paidDays: 22, grossPay: 145000, totalDeductions: 18400, netPay: 126600, status: 'Approved' },
  { id: 'PR-102', month: '2026-10', employeeId: 'BC-1002', employeeName: 'Naresh Vemparala', dept: 'Operations', workingDays: 22, lopDays: 0, paidDays: 22, grossPay: 180000, totalDeductions: 24200, netPay: 155800, status: 'Approved' },
  { id: 'PR-103', month: '2026-10', employeeId: 'BC-1003', employeeName: 'Karthik Reddy', dept: 'Engineering', workingDays: 22, lopDays: 1, paidDays: 21, grossPay: 240000, totalDeductions: 36800, netPay: 203200, status: 'Processed' },
  { id: 'PR-104', month: '2026-10', employeeId: 'BC-1004', employeeName: 'Priya Menon', dept: 'Product', workingDays: 22, lopDays: 0, paidDays: 22, grossPay: 170000, totalDeductions: 22500, netPay: 147500, status: 'Processed' },
  { id: 'PR-105', month: '2026-10', employeeId: 'BC-1005', employeeName: 'Meera Joshi', dept: 'Finance', workingDays: 22, lopDays: 0, paidDays: 22, grossPay: 160000, totalDeductions: 21000, netPay: 139000, status: 'Processed' },
  { id: 'PR-106', month: '2026-10', employeeId: 'BC-1006', employeeName: 'Rahul Varma', dept: 'Engineering', workingDays: 22, lopDays: 2, paidDays: 20, grossPay: 195000, totalDeductions: 28400, netPay: 166600, status: 'Draft' },
  { id: 'PR-107', month: '2026-10', employeeId: 'BC-1007', employeeName: 'Sneha Iyer', dept: 'Design', workingDays: 22, lopDays: 0, paidDays: 22, grossPay: 85000, totalDeductions: 9200, netPay: 75800, status: 'Draft' },
]

export const INITIAL_RECORDS = INITIAL_MONTHLY_PAYROLL

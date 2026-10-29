export interface PayslipRecord {
  id: string
  employeeId: string
  employeeName: string
  dept: string
  month: string
  gross: number
  deductions: number
  netPay: number
  issuedOn: string
  status: 'Generated' | 'Sent' | 'Acknowledged'
  isArchived?: boolean
  basic?: number
  hra?: number
  specialAllowance?: number
  pf?: number
  pt?: number
  tds?: number
}

export const INITIAL_PAYSLIPS: PayslipRecord[] = [
  { id: 'PS-801', employeeId: 'BC-1001', employeeName: 'Ananya Rao', dept: 'People Ops', month: '2026-09', gross: 145000, deductions: 18400, netPay: 126600, issuedOn: '2026-09-30', status: 'Acknowledged', basic: 72500, hra: 29000, specialAllowance: 43500, pf: 1800, pt: 200, tds: 16400 },
  { id: 'PS-802', employeeId: 'BC-1002', employeeName: 'Naresh Vemparala', dept: 'Operations', month: '2026-09', gross: 180000, deductions: 24200, netPay: 155800, issuedOn: '2026-09-30', status: 'Acknowledged', basic: 90000, hra: 36000, specialAllowance: 54000, pf: 1800, pt: 200, tds: 22200 },
  { id: 'PS-803', employeeId: 'BC-1003', employeeName: 'Karthik Reddy', dept: 'Engineering', month: '2026-09', gross: 240000, deductions: 36800, netPay: 203200, issuedOn: '2026-09-30', status: 'Sent', basic: 120000, hra: 48000, specialAllowance: 72000, pf: 1800, pt: 200, tds: 34800 },
  { id: 'PS-804', employeeId: 'BC-1004', employeeName: 'Priya Menon', dept: 'Product', month: '2026-09', gross: 170000, deductions: 22500, netPay: 147500, issuedOn: '2026-09-30', status: 'Sent', basic: 85000, hra: 34000, specialAllowance: 51000, pf: 1800, pt: 200, tds: 20500 },
  { id: 'PS-805', employeeId: 'BC-1005', employeeName: 'Meera Joshi', dept: 'Finance', month: '2026-09', gross: 160000, deductions: 21000, netPay: 139000, issuedOn: '2026-09-30', status: 'Generated', basic: 80000, hra: 32000, specialAllowance: 48000, pf: 1800, pt: 200, tds: 19000 },
  { id: 'PS-806', employeeId: 'BC-1006', employeeName: 'Rahul Varma', dept: 'Engineering', month: '2026-09', gross: 195000, deductions: 28400, netPay: 166600, issuedOn: '2026-09-30', status: 'Generated', basic: 97500, hra: 39000, specialAllowance: 58500, pf: 1800, pt: 200, tds: 26400 },
  { id: 'PS-807', employeeId: 'BC-1007', employeeName: 'Sneha Iyer', dept: 'Design', month: '2026-09', gross: 85000, deductions: 9200, netPay: 75800, issuedOn: '2026-09-30', status: 'Generated', basic: 42500, hra: 17000, specialAllowance: 25500, pf: 1800, pt: 200, tds: 7200 },
]

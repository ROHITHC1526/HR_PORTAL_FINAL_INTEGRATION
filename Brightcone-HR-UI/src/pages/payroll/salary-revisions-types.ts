export interface SalaryRevisionRecord {
  id: string
  employeeId: string
  employeeName: string
  dept: string
  appraisalCycle: string
  rating: number
  currentCtc: number
  revisedCtc: number
  changePct: number
  effectiveDate: string
  approver: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  isArchived?: boolean
}

export const INITIAL_REVISIONS: SalaryRevisionRecord[] = [
  { id: 'SR-201', employeeId: 'BC-1001', employeeName: 'Ananya Rao', dept: 'People Ops', appraisalCycle: 'Annual Appraisal 2026', rating: 5, currentCtc: 1500000, revisedCtc: 1800000, changePct: 20.0, effectiveDate: '2026-04-01', approver: 'Naresh Vemparala', status: 'Approved' },
  { id: 'SR-202', employeeId: 'BC-1002', employeeName: 'Naresh Vemparala', dept: 'Operations', appraisalCycle: 'Annual Appraisal 2026', rating: 4, currentCtc: 1900000, revisedCtc: 2200000, changePct: 15.79, effectiveDate: '2026-04-01', approver: 'Board of Directors', status: 'Approved' },
  { id: 'SR-203', employeeId: 'BC-1003', employeeName: 'Karthik Reddy', dept: 'Engineering', appraisalCycle: 'Mid-Year Promotion', rating: 5, currentCtc: 2500000, revisedCtc: 3000000, changePct: 20.0, effectiveDate: '2026-10-01', approver: 'Naresh Vemparala', status: 'Approved' },
  { id: 'SR-204', employeeId: 'BC-1004', employeeName: 'Priya Menon', dept: 'Product', appraisalCycle: 'Annual Appraisal 2026', rating: 4, currentCtc: 1800000, revisedCtc: 2100000, changePct: 16.67, effectiveDate: '2026-04-01', approver: 'Naresh Vemparala', status: 'Approved' },
  { id: 'SR-205', employeeId: 'BC-1005', employeeName: 'Meera Joshi', dept: 'Finance', appraisalCycle: 'Q3 Merit Correction', rating: 4, currentCtc: 1800000, revisedCtc: 2000000, changePct: 11.11, effectiveDate: '2026-11-01', approver: 'Naresh Vemparala', status: 'Pending' },
  { id: 'SR-206', employeeId: 'BC-1006', employeeName: 'Rahul Varma', dept: 'Engineering', appraisalCycle: 'Q3 Merit Correction', rating: 4, currentCtc: 2100000, revisedCtc: 2400000, changePct: 14.29, effectiveDate: '2026-11-01', approver: 'Karthik Reddy', status: 'Pending' },
  { id: 'SR-207', employeeId: 'BC-1008', employeeName: 'Arjun Nair', dept: 'Sales', appraisalCycle: 'Probation Review', rating: 3, currentCtc: 900000, revisedCtc: 1100000, changePct: 22.22, effectiveDate: '2026-10-15', approver: 'Naresh Vemparala', status: 'Rejected' },
]

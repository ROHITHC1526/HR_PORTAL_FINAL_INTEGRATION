export interface PfEsiFiling {
  id: string
  wageMonth: string
  scheme: 'PF' | 'ESI'
  employeeCount: number
  employeeShare: number
  employerShare: number
  totalAmount: number
  dueDate: string
  paidOn?: string
  challanNo?: string
  status: 'Pending' | 'Paid' | 'Overdue'
  isArchived?: boolean
}

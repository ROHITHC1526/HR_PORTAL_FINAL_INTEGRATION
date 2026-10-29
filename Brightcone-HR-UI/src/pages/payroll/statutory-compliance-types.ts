export interface StatutoryItem {
  id: string
  item: string
  period: string
  authority: string
  dueDate: string
  owner: string
  filedOn?: string
  ackNo?: string
  status: 'Pending' | 'Completed' | 'Overdue'
  isArchived?: boolean
}

export interface ExpenseClaim {
  id: string
  employee_id: string
  employee_name: string
  category: string
  amount: number
  date: string
  description: string
  receipt_url?: string | null
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected'
  paid_at?: string | null
  rejection_reason?: string | null
  created_at: string
}

export interface CategorySpend {
  category: string
  amount: number
  label: string
  pct: number
}

import React from 'react'
import { useAuth } from '@/auth/AuthContext'
import { ExpenseAdminDashboard } from './ExpenseAdminDashboard'
import { ExpenseEmployeeDashboard } from './ExpenseEmployeeDashboard'

export const ExpenseView: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'hr_admin' || user?.role === 'finance' || user?.role === 'admin'

  return isAdmin ? <ExpenseAdminDashboard /> : <ExpenseEmployeeDashboard />
}

export default ExpenseView

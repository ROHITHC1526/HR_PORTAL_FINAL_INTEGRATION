import React from 'react'
import { useAuth } from '@/auth/AuthContext'
import { PayrollAdminDashboard } from './PayrollAdminDashboard'
import { PayrollEmployeeDashboard } from './PayrollEmployeeDashboard'

export const PayrollView: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'hr_admin' || user?.role === 'finance' || user?.role === 'admin'

  return isAdmin ? <PayrollAdminDashboard /> : <PayrollEmployeeDashboard />
}

export default PayrollView

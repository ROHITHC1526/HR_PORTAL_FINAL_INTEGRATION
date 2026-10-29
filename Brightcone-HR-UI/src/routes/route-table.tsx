import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { env } from '@/config/env'
import { AccountsPage } from '@/features/accounts/AccountsPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { SuiteDashboard } from '@/features/dashboard/SuiteDashboard'
import { MODULE_ALIASES, MODULE_STUBS } from '@/features/modules/modules'
import { ComingSoonRoute, ModulePage } from '@/features/modules/ModulePage'
import { UiKitPage } from '@/features/ui-kit/UiKitPage'
import { PlusShell } from '@/people-plus/PlusShell'
import { NotFoundPage } from './NotFoundPage'
import {
  Payroll,
  PayrollDash,
  MonthlyPayroll,
  PayslipRecords,
  SalaryStructures,
  SalaryRevisions,
  PfEsiCompliance,
  StatutoryCompliance,
  PayrollRuns,
  Benefits,
  OfficeExpense,
  Expenses,
  ExpensesAdmin,
  MyExpenses,
  MyPay,
  Helpdesk,
  Feed,
} from '@/people-plus/views'

/** Wraps a page so a crash inside it cannot take down the shell around it. */
const page = (element: ReactNode, scope: string) => (
  <ErrorBoundary scope={scope} resetKey={scope}>
    {element}
  </ErrorBoundary>
)

/**
 * Every URL in the app, in one table.
 */
const shellChildren: RouteObject[] = [
  { index: true, element: page(<SuiteDashboard />, 'home') },
  { path: 'employees', element: page(<AccountsPage />, 'employees') },
  { path: 'people', element: page(<AccountsPage />, 'people') },
  { path: 'change-password', element: page(<ChangePasswordPage />, 'change-password') },
  {
    path: 'audit',
    element: <RequireAuth permission="audit:read">{page(<AuditLogPage />, 'audit')}</RequireAuth>,
  },
  { path: 'coming-soon/:module', element: page(<ComingSoonRoute />, 'coming-soon') },

  // Real Payroll & Expense Domain Routes (PAY-01..16, EXP-01..07)
  { path: 'payroll', element: page(<Payroll />, 'payroll') },
  { path: 'payroll/dashboard', element: page(<PayrollDash />, 'payroll-dashboard') },
  { path: 'payroll/monthly', element: page(<MonthlyPayroll />, 'payroll-monthly') },
  { path: 'payroll/salary-structure', element: page(<SalaryStructures />, 'salary-structure') },
  { path: 'payroll/salary-revisions', element: page(<SalaryRevisions />, 'salary-revisions') },
  { path: 'payroll/payslips', element: page(<PayslipRecords />, 'payroll-payslips') },
  { path: 'payroll/pf-esi', element: page(<PfEsiCompliance />, 'payroll-pf-esi') },
  { path: 'payroll/statutory', element: page(<StatutoryCompliance />, 'payroll-statutory') },
  { path: 'payroll/runs', element: page(<PayrollRuns />, 'payroll-runs') },
  { path: 'payroll/benefits', element: page(<Benefits />, 'payroll-benefits') },

  // Backwards-compatible legacy payroll aliases
  { path: 'pay', element: page(<MyPay />, 'pay') },
  { path: 'payroll/admin', element: page(<MonthlyPayroll />, 'payroll-admin') },

  // Expense Domain Routes
  { path: 'expenses', element: page(<Expenses />, 'expenses') },
  { path: 'expenses/office', element: page(<OfficeExpense />, 'expenses-office') },
  { path: 'expenses/claims', element: page(<ExpensesAdmin />, 'expenses-claims') },
  { path: 'expenses/my-claims', element: page(<MyExpenses />, 'expenses-my-claims') },
  { path: 'my-expenses', element: page(<MyExpenses />, 'my-expenses') },
  { path: 'office-expenses', element: page(<OfficeExpense />, 'office-expenses') },
  { path: 'payroll/office-expense', element: page(<OfficeExpense />, 'payroll-office-expense') },
  { path: 'payroll/expenses', element: page(<MyExpenses />, 'payroll-expenses') },
  { path: 'payroll/finance-expenses', element: page(<ExpensesAdmin />, 'finance-expenses') },

  // Engagement & Helpdesk
  { path: 'helpdesk', element: page(<Helpdesk />, 'helpdesk') },
  { path: 'engagement/helpdesk', element: page(<Helpdesk />, 'engagement-helpdesk') },
  { path: 'feed', element: page(<Feed />, 'feed') },
  { path: 'engagement/feed', element: page(<Feed />, 'engagement-feed') },

  ...MODULE_STUBS.filter((stub) => !['payroll', 'expenses', 'pay', 'helpdesk', 'feed', 'office-expenses'].includes(stub.path)).map((stub) => ({
    path: stub.path,
    element: page(<ModulePage path={stub.path} />, stub.path),
  })),
  ...Object.keys(MODULE_ALIASES).filter((alias) => !['payroll', 'expenses', 'pay', 'helpdesk', 'feed', 'office-expenses'].includes(alias)).map((alias) => ({
    path: alias,
    element: page(<ModulePage path={alias} />, alias),
  })),
  ...(env.uiKitEnabled ? [{ path: 'ui-kit', element: page(<UiKitPage />, 'ui-kit') }] : []),
]

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: (
      <RequireAuth>
        <PlusShell />
      </RequireAuth>
    ),
    children: shellChildren,
  },
  { path: '*', element: <NotFoundPage /> },
]

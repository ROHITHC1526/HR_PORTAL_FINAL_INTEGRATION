import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/api/client'
import { getHealth, type Health } from '@/api/health'
import { Icon } from './Icon'
import { initials } from './data'
import { SuiteDashboard } from '@/features/dashboard/SuiteDashboard'
import PayrollView from './payroll'
import ExpenseView from './expense'
import CompanyFeedPage from '@/pages/engagement/CompanyFeedPage'
import SalaryStructurePage from '@/pages/payroll/SalaryStructurePage'
import OfficeExpensePage from '@/pages/payroll/OfficeExpensePage'
import HelpdeskQueuePage from '@/pages/engagement/HelpdeskQueuePage'
import PayrollAdminPage from '@/pages/payroll/PayrollAdminPage'
import ExpenseFinancePage from '@/pages/payroll/ExpenseFinancePage'

type UserRecord = { pid: string; email: string; name: string; role: string; status: string; created_at: string }
type UserPage = { results?: UserRecord[]; items?: UserRecord[]; data?: UserRecord[] }

function Card({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`pp-card pp-card-pad ${className}`}><div className="pp-card-head"><div><h2 className="pp-card-title">{title}</h2>{subtitle && <p className="pp-card-subtitle">{subtitle}</p>}</div>{action}</div>{children}</section>
}

function ApiStatus() {
  const { data, isLoading, isError } = useQuery<Health>({ queryKey: ['health'], queryFn: getHealth, staleTime: 30_000, retry: 1 })
  const healthy = !isLoading && !isError && data?.status === 'ok'
  return <span className={`pp-pill ${healthy ? 'ok' : 'warn'}`}><span className="pp-status-dot" />{isLoading ? 'Checking API' : healthy ? 'API connected' : 'API unavailable'}</span>
}

export const Home = SuiteDashboard
export const SuiteDash = SuiteDashboard

export function SimpleView({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-[#10192A]/90 border border-[#1E2D4A] shadow-sm">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{sub}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Module connected</span>
        </div>
      </div>
    </div>
  )
}

export function Employees() {
  const { can } = useAuth()
  const enabled = can('users:manage')
  const query = useQuery<UserPage>({ queryKey: ['admin-users'], queryFn: () => api<UserPage>('/admin/users'), enabled, retry: 1 })
  if (!enabled) return <SimpleView title="People directory" sub="Employee directory is restricted to HR administrators." />
  const people = query.data?.results ?? query.data?.items ?? query.data?.data ?? []
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-[#10192A]/90 border border-[#1E2D4A]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Portal Accounts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live user accounts from the authentication backend</p>
          </div>
          <ApiStatus />
        </div>
        {query.isError ? (
          <div className="text-xs text-rose-400">Could not load accounts: {(query.error as Error).message}</div>
        ) : query.isLoading ? (
          <div className="text-xs text-slate-400">Loading accounts...</div>
        ) : people.length === 0 ? (
          <div className="text-xs text-slate-400">No accounts returned by backend.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr><th className="py-2.5">Person</th><th>Role</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {people.map((person) => (
                  <tr key={person.pid} className="hover:bg-slate-900/40">
                    <td className="py-3 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-purple-600/80 flex items-center justify-center text-[10px] font-bold text-white">
                        {initials(person.name)}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{person.name}</div>
                        <div className="text-[11px] text-slate-400">{person.email}</div>
                      </div>
                    </td>
                    <td>{person.role.replace('_', ' ')}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${person.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {person.status}
                      </span>
                    </td>
                    <td>{new Date(person.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export const Directory = Employees
export const People = Employees
export const Recruitment = () => <SimpleView title="Recruit" sub="Candidate pipelines, interviews and hiring activity" />
export { ApprovalsInboxView as Approvals } from './views/ApprovalsInboxView'
export { ReportsAnalyticsView as Reports } from './views/ReportsAnalyticsView'
export const Settings = () => <SimpleView title="Settings" sub="Workspace preferences and account options" />
export const LeaveAdmin = () => <SimpleView title="Leave" sub="Team leave calendar and requests" />
export const MyLeave = () => <SimpleView title="My leave" sub="Leave balance, requests and history" />

// Production-level Tailwind Payroll & Expense Views matching images (with full RBAC)
export const Payroll = PayrollView
export const PayrollDash = PayrollView
export const Expenses = ExpenseView
export const ExpensesAdmin = ExpenseView
export const MyExpenses = ExpenseView
export const MyPay = PayrollView

// Supporting domain features
export const SignDocs = () => <SimpleView title="Sign" sub="Documents awaiting signature" />
export const Feed = CompanyFeedPage
export const Learn = () => <SimpleView title="Learn" sub="Learning paths and employee development" />
export const Roster = () => <SimpleView title="Shift" sub="Shift schedule and attendance" />
export const Helpdesk = HelpdeskQueuePage
export const OfficeExpense = OfficeExpensePage
export const PayrollAdmin = PayrollAdminPage
export const SalaryStructures = SalaryStructurePage
export const FinanceExpenses = ExpenseFinancePage
export const MonthlyPayroll = PayrollView
export const PayslipRecords = PayrollView
export const SalaryRevisions = SalaryStructurePage
export const PfEsiCompliance = PayrollAdminPage
export const StatutoryCompliance = PayrollAdminPage
export const PayrollRuns = PayrollAdminPage
export const Benefits = PayrollView

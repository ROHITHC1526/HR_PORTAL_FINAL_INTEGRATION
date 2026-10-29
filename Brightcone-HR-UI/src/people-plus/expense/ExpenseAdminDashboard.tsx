import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileCheck } from 'lucide-react'
import { ExpenseStatCards } from './ExpenseStatCards'
import { ExpensePendingClaimsCard } from './ExpensePendingClaimsCard'
import { ExpenseCategorySpendCard } from './ExpenseCategorySpendCard'

export const ExpenseAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [statsKey, setStatsKey] = useState(0)

  const handleExport = () => {
    alert('Exporting Q3/Q4 corporate expense audit ledger (CSV/Excel)...')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top accent line matching Image 2 */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 w-full rounded-full opacity-80" />

      {/* Hero Banner matching Image 2 */}
      <div className="relative rounded-2xl border border-amber-700/30 bg-gradient-to-r from-[#2c1303] via-[#4d2206] to-[#250f02] p-6 lg:p-8 shadow-xl overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                EXPENSE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Expense dashboard
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              Claims waiting on you, spend by category and reimbursements due.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/60 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm cursor-pointer"
            >
              <Download size={16} className="text-slate-300" />
              <span>Export</span>
            </button>
            <button
              onClick={() => navigate('/expense/claims')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <FileCheck size={17} className="text-amber-700" />
              <span>Review claims</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards matching Image 2 */}
      <ExpenseStatCards key={statsKey} />

      {/* 2-Column Main Section: Pending Claims + Spend By Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ExpensePendingClaimsCard onClaimUpdated={() => setStatsKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-5">
          <ExpenseCategorySpendCard />
        </div>
      </div>

      {/* Recent claims Table matching Image 2 */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent claims</h3>
          <button
            onClick={() => navigate('/expense/claims')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            See all claims
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              <tr>
                <th className="py-2.5 px-3">EMPLOYEE</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">AMOUNT</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      RV
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Rahul Varma</div>
                      <div className="text-[11px] text-slate-400">Backend Engineer</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">Meals</td>
                <td className="py-3 px-3 text-slate-500 dark:text-slate-400">Oct 1, 2026</td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">₹2,350</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default ExpenseAdminDashboard

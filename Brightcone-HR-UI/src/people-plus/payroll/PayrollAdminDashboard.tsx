import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Eye } from 'lucide-react'
import { PayrollStatCards } from './PayrollStatCards'
import { PayrollTrendsChart } from './PayrollTrendsChart'
import { PayrollRunStepper } from './PayrollRunStepper'

export const PayrollAdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner matching Image 1 */}
      <div className="relative rounded-2xl border border-emerald-700/30 bg-gradient-to-r from-[#021f17] via-[#043327] to-[#011812] p-6 lg:p-8 shadow-xl overflow-hidden">
        {/* Subtle grid background texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                PAYROLL
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Payroll dashboard
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              October 2026 run, cost trends and statutory deadlines at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/payroll/admin?tab=register')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/60 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-slate-300" />
              <span>Salary register</span>
            </button>
            <button
              onClick={() => navigate('/payroll/admin')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Eye size={17} className="text-emerald-700" />
              <span>View payroll run</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards matching Image 1 */}
      <PayrollStatCards />

      {/* 2-Column Main Section: Line Chart + Stepper matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PayrollTrendsChart />
        </div>
        <div className="lg:col-span-5">
          <PayrollRunStepper />
        </div>
      </div>

      {/* Bottom Grid: Monthly cost by department + Statutory deadlines matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly cost by department */}
        <div className="lg:col-span-6 bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
            Monthly cost by department
          </h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24 shrink-0">
              Engineering
            </span>
            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
              ₹11.5L
            </span>
          </div>
        </div>

        {/* Right: Statutory deadlines */}
        <div className="lg:col-span-6 bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Statutory deadlines
            </h3>
            <button
              onClick={() => navigate('/payroll/statutory')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open compliance
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">
                10
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Professional tax, Telangana
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PayrollAdminDashboard

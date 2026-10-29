import React from 'react'
import { Check } from 'lucide-react'

export const PayrollRunStepper: React.FC = () => {
  const steps = [
    'Sync attendance & leave',
    'Add bonuses & deductions',
    'Review variances',
    'Approve payroll',
    'Disburse & publish payslips',
  ]

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">October 2026 run</h3>
      </div>

      <div className="space-y-4 my-auto">
        {steps.map((title, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {title}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Completed
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default PayrollRunStepper

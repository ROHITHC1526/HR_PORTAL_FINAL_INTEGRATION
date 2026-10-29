import React from 'react'
import { Banknote, Check, FileText, Calendar } from 'lucide-react'

interface PayrollStatCardsProps {
  grossPay?: string
  growthText?: string
  netPayout?: string
  employeesCount?: string
  deductions?: string
  nextPayDate?: string
  runStepText?: string
}

export const PayrollStatCards: React.FC<PayrollStatCardsProps> = ({
  grossPay = '₹49,42,467',
  growthText = '-76.9% vs September',
  netPayout = '₹38,85,467',
  employeesCount = '14 employees paid on Oct 12',
  deductions = '₹10,57,000',
  nextPayDate = 'Oct 31',
  runStepText = 'Payroll completed',
}) => {
  const cards = [
    {
      icon: Banknote,
      label: 'Gross pay, October',
      value: grossPay,
      subText: growthText,
      subColor: 'text-slate-500 dark:text-slate-400',
    },
    {
      icon: Check,
      label: 'Net payout',
      value: netPayout,
      subText: employeesCount,
      subColor: 'text-slate-500 dark:text-slate-400',
    },
    {
      icon: FileText,
      label: 'Deductions',
      value: deductions,
      subText: 'PF, professional tax and TDS',
      subColor: 'text-slate-500 dark:text-slate-400',
    },
    {
      icon: Calendar,
      label: 'Next pay date',
      value: nextPayDate,
      subText: runStepText,
      subColor: 'text-slate-500 dark:text-slate-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-200 shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{c.label}</span>
            </div>
            <div>
              <div className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2 font-['Sora']">
                {c.value}
              </div>
              <div className={`text-xs ${c.subColor}`}>{c.subText}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default PayrollStatCards

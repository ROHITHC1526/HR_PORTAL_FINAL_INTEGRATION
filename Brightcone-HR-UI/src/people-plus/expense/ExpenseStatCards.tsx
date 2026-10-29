import React from 'react'
import { Inbox, Check, Wallet, FileSpreadsheet } from 'lucide-react'

interface ExpenseStatCardsProps {
  awaitingAmount?: string
  awaitingCount?: string
  approvedNotPaid?: string
  reimbursedQuarter?: string
  avgClaim?: string
  totalClaimsCount?: string
}

export const ExpenseStatCards: React.FC<ExpenseStatCardsProps> = ({
  awaitingAmount = '₹2,350',
  awaitingCount = '1 claim',
  approvedNotPaid = '₹48,200',
  reimbursedQuarter = '₹20,099',
  avgClaim = '₹17,662',
  totalClaimsCount = '4 claims filed',
}) => {
  const cards = [
    {
      icon: Inbox,
      label: 'Awaiting approval',
      value: awaitingAmount,
      subText: awaitingCount,
      subColor: 'text-rose-500 font-semibold',
    },
    {
      icon: Check,
      label: 'Approved, not yet paid',
      value: approvedNotPaid,
      subText: 'Paid with the next payroll',
      subColor: 'text-slate-400',
    },
    {
      icon: Wallet,
      label: 'Reimbursed',
      value: reimbursedQuarter,
      subText: 'This quarter',
      subColor: 'text-slate-400',
    },
    {
      icon: FileSpreadsheet,
      label: 'Average claim',
      value: avgClaim,
      subText: totalClaimsCount,
      subColor: 'text-slate-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-200 shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{c.label}</span>
            </div>
            <div>
              <div className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
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
export default ExpenseStatCards

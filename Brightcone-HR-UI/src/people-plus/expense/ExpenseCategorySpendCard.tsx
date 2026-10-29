import React from 'react'

export const ExpenseCategorySpendCard: React.FC = () => {
  const categories = [
    { name: 'Travel', amount: '₹48.2k', pct: 78, barColor: 'bg-amber-500' },
    { name: 'Client entertainment', amount: '₹18.6k', pct: 36, barColor: 'bg-amber-600' },
    { name: 'Meals', amount: '₹2.4k', pct: 10, barColor: 'bg-amber-700' },
    { name: 'Internet', amount: '₹1.5k', pct: 6, barColor: 'bg-amber-800' },
  ]

  return (
    <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Spend by category</h3>
          <span className="text-xs text-slate-400">Current quarter</span>
        </div>

        <div className="space-y-4 my-2">
          {categories.map((c) => (
            <div key={c.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{c.name}</span>
                <span className="text-white font-bold">{c.amount}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.barColor} transition-all duration-500`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>Claims above ₹25,000 also need Finance approval</span>
        </p>
      </div>
    </div>
  )
}

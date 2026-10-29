import React from 'react';
import { PieChart } from 'lucide-react';
import type { LeaveBalanceItem } from '../../types';

interface LeaveBalancesCardProps {
  balances: LeaveBalanceItem[];
  year: number;
  employeeName?: string;
  isLoading?: boolean;
}

export const LeaveBalancesCard: React.FC<LeaveBalancesCardProps> = ({
  balances,
  year,
  employeeName,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#F8FAFD] dark:bg-[#091224] rounded-2xl border border-[#E3E8F2] dark:border-[#172649] p-4" />
        ))}
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] text-center text-xs text-[#5B6787] dark:text-[#8D9BB8]">
        <PieChart className="w-8 h-8 text-[#647496] mx-auto mb-2 opacity-50" />
        <p className="font-semibold text-[#0E1730] dark:text-white">No Leave Quotas Configured</p>
        <p className="mt-1">
          No active leave quotas found for year {year}. Configure leave quotas in Manage &gt; Leave Quotas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6787] dark:text-[#8D9BB8] flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#0B6FDB] dark:text-[#0BA6CC]" />
          <span>Leave Balances ({year})</span>
          {employeeName && (
            <span className="text-[#0E1730] dark:text-white font-semibold normal-case">· {employeeName}</span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => {
          const usagePercent =
            b.entitled_days > 0 ? Math.min(100, Math.round((b.consumed_days / b.entitled_days) * 100)) : 0;

          return (
            <div
              key={b.leave_type_id}
              className="p-4 rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] hover:border-[#0B6FDB]/40 dark:hover:border-[#1E3A6E] shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#0E1730] dark:text-white truncate">{b.leave_type_name}</h4>
                    <span className="text-[11px] font-mono text-[#0B6FDB] dark:text-[#0BA6CC]">{b.leave_type_code}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      b.is_paid
                        ? 'bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] border border-[#10B981]/30'
                        : 'bg-[#647496]/20 text-[#475569] dark:text-[#CBD5E1] border border-[#647496]/30'
                    }`}
                  >
                    {b.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>

                {/* Big Remaining Days Metric */}
                <div className="my-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#0E1730] dark:text-white">{b.remaining_days}</span>
                    <span className="text-xs text-[#5B6787] dark:text-[#8D9BB8]">days remaining</span>
                  </div>
                </div>

                {/* Progress bar */}
                {b.is_paid && (
                  <div className="w-full bg-[#E3E8F2] dark:bg-[#060D1A] h-1.5 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 85
                          ? 'bg-[#EF4444]'
                          : usagePercent > 50
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Metrics footer */}
              <div className="pt-2 border-t border-[#E3E8F2] dark:border-[#152347] grid grid-cols-3 gap-1 text-[10px] text-center">
                <div>
                  <span className="text-[#647496] dark:text-[#647496] block">Entitled</span>
                  <span className="font-semibold text-[#0E1730] dark:text-white">{b.entitled_days}</span>
                </div>
                <div>
                  <span className="text-[#647496] dark:text-[#647496] block">Consumed</span>
                  <span className="font-semibold text-[#10B981]">{b.consumed_days}</span>
                </div>
                <div>
                  <span className="text-[#647496] dark:text-[#647496] block">Pending</span>
                  <span className="font-semibold text-[#D97706] dark:text-[#FBBF24]">{b.pending_days}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

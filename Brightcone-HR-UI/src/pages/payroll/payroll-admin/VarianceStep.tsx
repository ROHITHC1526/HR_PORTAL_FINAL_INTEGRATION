import React from "react";
import { AlertTriangle } from "lucide-react";
import { type VarianceItem, formatINR } from "./types";

interface Props {
  variances: VarianceItem[];
}

export const VarianceStep: React.FC<Props> = ({ variances }) => {
  const flaggedCount = variances.filter((v) => v.flagged).length;

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Step 3: Variance Analysis vs Previous Month
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated flags for any compensation movement exceeding ±10% or unexpected LOP deductions.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          {flaggedCount} Flagged Deviations
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-right">Previous Net</th>
              <th className="py-3 px-4 text-right">Current Net</th>
              <th className="py-3 px-4 text-right">Delta (₹)</th>
              <th className="py-3 px-4 text-right">Delta (%)</th>
              <th className="py-3 px-4">Flag & Audit Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {variances.map((v) => (
              <tr
                key={v.employee_id}
                className={v.flagged ? "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"}
              >
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{v.employee_name}</div>
                  <div className="text-[11px] text-slate-500">{v.employee_id}</div>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{v.department}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                  {formatINR(v.previous_net)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {formatINR(v.current_net)}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono font-semibold ${
                    v.variance_amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {v.variance_amount >= 0
                    ? `+${formatINR(v.variance_amount)}`
                    : `-${formatINR(Math.abs(v.variance_amount))}`}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono font-bold ${
                    Math.abs(v.variance_pct) > 10 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {v.variance_pct > 0 ? `+${v.variance_pct}%` : `${v.variance_pct}%`}
                </td>
                <td className="py-3 px-4">
                  {v.flagged ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      {v.reason}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">{v.reason}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

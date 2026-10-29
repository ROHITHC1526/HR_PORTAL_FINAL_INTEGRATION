import React from "react";
import { Plus } from "lucide-react";
import { type PayrollRun, formatINR } from "./types";

interface Props {
  allRuns: PayrollRun[];
  onOpenSuppModal: () => void;
  onExportBankFile: (month: string) => void;
}

export const HistoryTab: React.FC<Props> = ({
  allRuns,
  onOpenSuppModal,
  onExportBankFile,
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Payroll Cycle History & Supplementary Runs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Permanent audit trail of all historical regular and supplementary payroll cycles.
          </p>
        </div>
        <button
          onClick={onOpenSuppModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Supplementary Run
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Cycle Month</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Headcount</th>
              <th className="py-3 px-4 text-right">Gross Pay</th>
              <th className="py-3 px-4 text-right">Deductions</th>
              <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">Net Disbursement</th>
              <th className="py-3 px-4 text-center">Bank File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {allRuns.map((run) => (
              <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {run.month}
                  {run.is_supplementary && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30">
                      Supplementary
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      run.is_locked
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-mono">{run.total_employees}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">{formatINR(run.total_gross)}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400">{formatINR(run.total_deductions)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(run.total_net)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onExportBankFile(run.month)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Export Bank File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

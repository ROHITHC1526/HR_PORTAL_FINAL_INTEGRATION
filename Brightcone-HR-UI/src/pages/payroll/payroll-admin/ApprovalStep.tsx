import React from "react";
import { CheckCircle2 } from "lucide-react";
import { type PayrollRun, formatINR } from "./types";

interface Props {
  activeRun: PayrollRun | null;
  financeApproved: boolean;
  setFinanceApproved: (val: boolean) => void;
  financeComments: string;
  setFinanceComments: (val: string) => void;
}

export const ApprovalStep: React.FC<Props> = ({
  activeRun,
  financeApproved,
  setFinanceApproved,
  financeComments,
  setFinanceComments,
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 4: Two-Tier Leadership Sign-off
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Mandatory dual authorization required prior to bank transmission and employee slip generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Tier 1: HR Operations Sign-off
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            "Attendance ledger, loss of pay cuts, approved leaves and variable payouts verified with manager approvals."
          </p>
          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">Ananya Rao (Head of People)</span>
            <span>Signed on Oct 28, 14:10</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Tier 2: Finance & Treasury Sign-off
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                financeApproved
                  ? "bg-emerald-600 text-white flex items-center gap-1 shadow-sm"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
              }`}
            >
              {financeApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
              {financeApproved ? "Approved" : "Pending Sign-off"}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Audit Notes / Bank Escrow Reference:</label>
            <textarea
              value={financeComments}
              onChange={(e) => setFinanceComments(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="Add reconciliation notes..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={financeApproved}
                onChange={(e) => setFinanceApproved(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Authorize net disbursal of {formatINR(activeRun?.total_net || 3885467)}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

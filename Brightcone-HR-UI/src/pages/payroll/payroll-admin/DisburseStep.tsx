import React from "react";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { type PayrollRun, formatINR } from "./types";

interface Props {
  activeRun: PayrollRun | null;
  onOpenPublishModal: () => void;
}

export const DisburseStep: React.FC<Props> = ({ activeRun, onOpenPublishModal }) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 5: Final Disbursal & Month Lock
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Publish payslips to employee self-service portals and seal the accounting period.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Disbursement Pre-flight Verification</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Both leadership sign-offs have been received. Bank transfer file is generated. Publishing will lock this cycle permanently to preserve audit compliance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Headcount</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{activeRun?.total_employees || 14} Employees</div>
          </div>
          <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Net Transfer Amount</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{formatINR(activeRun?.total_net || 3885467)}</div>
          </div>
          <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Statutory Remittance</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{formatINR(activeRun?.total_deductions || 1057000)}</div>
          </div>
        </div>
      </div>

      {!activeRun?.is_locked ? (
        <div className="flex justify-end">
          <button
            onClick={onOpenPublishModal}
            className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Publish Payslips & Lock Month Permanently
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            This payroll month was published and locked on {activeRun?.disbursed_at || "31 Oct 2026"}. Payslips are accessible to all employees.
          </span>
        </div>
      )}
    </div>
  );
};

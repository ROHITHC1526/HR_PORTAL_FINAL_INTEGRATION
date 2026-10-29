import React from "react";
import { Sparkles, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { SalaryRevision } from "./types";

interface Props {
  revisions: SalaryRevision[];
  onApproveRevision: (revId: string) => void;
}

export const RevisionsTab: React.FC<Props> = ({
  revisions,
  onApproveRevision,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-brand-soft/30 border border-brand/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-brand shrink-0" />
          <div>
            <strong className="text-txt font-semibold block">
              Automatic Increment Pipeline Active
            </strong>
            <span className="text-txt-muted">
              Approving a revision automatically updates the employee's active salary structure and logs an immutable entry to the Increment History timeline.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Proposal ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Current Gross</th>
                <th className="p-3.5">Proposed Gross</th>
                <th className="p-3.5">Increment %</th>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Committee Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {revisions.map((rev) => (
                <tr key={rev.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="p-3.5 pl-5 font-mono font-semibold text-txt">{rev.id}</td>
                  <td className="p-3.5 font-medium text-txt">{rev.employee_name}</td>
                  <td className="p-3.5 font-sora text-txt-muted">
                    ₹{rev.current_gross.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora font-semibold text-txt">
                    ₹{rev.proposed_gross.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{rev.increment_percent}%
                    </span>
                  </td>
                  <td className="p-3.5 text-txt-faint">{rev.effective_date}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted font-medium">
                      {rev.reason}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        rev.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    {rev.status === "Approved" ? (
                      <span className="text-[11px] text-txt-faint inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => onApproveRevision(rev.id)}
                        className="px-3 py-1 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold shadow-sm transition-all text-xs"
                      >
                        Approve Revision
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

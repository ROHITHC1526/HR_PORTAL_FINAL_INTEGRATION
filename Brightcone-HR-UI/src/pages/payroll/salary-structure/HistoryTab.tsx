import React from "react";
import { ShieldCheck } from "lucide-react";
import type { IncrementRecord } from "./types";

interface Props {
  history: IncrementRecord[];
}

export const HistoryTab: React.FC<Props> = ({ history }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-sora font-semibold text-sm text-txt">
          Employee Compensation Increment Audit Trail
        </h3>
        <span className="text-xs text-txt-faint">
          Auto-fed by approved revisions and performance promotions
        </span>
      </div>

      <div className="space-y-3">
        {history.map((record) => (
          <div
            key={record.id}
            className="p-4 rounded-2xl bg-surface border border-line shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-cyan text-white text-xs font-bold flex items-center justify-center shrink-0">
                {record.employee_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-xs text-txt">{record.employee_name}</h4>
                  <span className="px-2 py-0.2 rounded-md bg-surface-secondary border border-line text-[10px] text-txt-muted font-medium">
                    {record.change_type}
                  </span>
                  <span className="text-[11px] text-txt-faint">Effective: {record.effective_date}</span>
                </div>
                <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                  {record.notes}
                </p>
                <div className="text-[11px] text-txt-faint mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                  <span>{record.approved_by}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start sm:items-end flex-col justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-faint line-through">
                  ₹{record.previous_gross.toLocaleString("en-IN")}
                </span>
                <span className="font-sora font-bold text-sm text-txt">
                  ₹{record.revised_gross.toLocaleString("en-IN")}/mo
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  +₹{record.increment_amount.toLocaleString("en-IN")} (+{record.increment_percentage}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { Search, CheckCircle2 } from "lucide-react";
import type { SalaryStructure } from "./types";

interface Props {
  structures: SalaryStructure[];
  search: string;
  onSearchChange: (val: string) => void;
}

export const StructuresTab: React.FC<Props> = ({
  structures,
  search,
  onSearchChange,
}) => {
  const filtered = structures.filter(
    (s) =>
      s.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee, structure ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
          />
        </div>
        <div className="text-xs text-txt-faint">
          Active structures supersede automatically on new revision creation.
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Structure ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">Monthly Gross</th>
                <th className="p-3.5">Basic (50%)</th>
                <th className="p-3.5">HRA (25%)</th>
                <th className="p-3.5">Employee PF</th>
                <th className="p-3.5">Net Take-Home</th>
                <th className="p-3.5">Annual CTC</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-surface-secondary/50 transition-colors ${
                    !s.is_active ? "opacity-60 bg-surface-secondary/20" : ""
                  }`}
                >
                  <td className="p-3.5 pl-5 font-mono font-semibold text-txt">{s.id}</td>
                  <td className="p-3.5 font-medium text-txt flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-soft text-brand text-[10px] font-bold flex items-center justify-center">
                      {s.employee_name[0]}
                    </div>
                    <span>{s.employee_name}</span>
                  </td>
                  <td className="p-3.5 text-txt-muted">{s.department}</td>
                  <td className="p-3.5 text-txt-faint">{s.effective_from}</td>
                  <td className="p-3.5 font-sora font-semibold text-txt">
                    ₹{s.gross_monthly.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora text-txt-muted">
                    ₹{s.basic.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora text-txt-muted">
                    ₹{s.hra.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora text-txt-muted">
                    ₹{s.employee_pf.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{s.net_take_home.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 font-sora text-txt font-medium">
                    ₹{s.annual_ctc.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3.5 pr-5">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-secondary border border-line text-txt-faint"
                        title={`Superseded by ${s.superseded_by || "revision"}`}
                      >
                        Superseded
                      </span>
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

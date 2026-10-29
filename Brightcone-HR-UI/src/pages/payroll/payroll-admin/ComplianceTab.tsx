import React from "react";
import { Download } from "lucide-react";
import { formatINR } from "./types";

interface Props {
  onDownloadPack: () => void;
  onMarkFiled: (name: string) => void;
  onDownloadChallan: (name: string) => void;
}

export const ComplianceTab: React.FC<Props> = ({
  onDownloadPack,
  onMarkFiled,
  onDownloadChallan,
}) => {
  const complianceData = [
    { name: "Provident Fund (ECR)", period: "Sep 2026", amt: 136800, due: "15 Oct 2026", status: "Pending" },
    { name: "Employee State Insurance (ESI)", period: "Sep 2026", amt: 0, due: "15 Oct 2026", status: "Completed" },
    { name: "Professional Tax (Telangana)", period: "Sep 2026", amt: 7600, due: "10 Oct 2026", status: "Pending" },
    { name: "TDS (Form 24Q) - Q2", period: "Q2 FY 2026-27", amt: 245000, due: "31 Oct 2026", status: "Pending" },
    { name: "Labour Welfare Fund (LWF)", period: "H1 2026", amt: 228, due: "15 Jul 2026", status: "Completed" },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Statutory Filings & Challans Tracker
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track regulatory return filings, generate Electronic Challan cum Return (ECR) files and verify compliance deadlines.
          </p>
        </div>
        <button
          onClick={onDownloadPack}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          Download Audit Pack
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Statutory Head</th>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4 text-right">Liability Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {complianceData.map((item) => (
              <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.period}</td>
                <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(item.amt)}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.due}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      item.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {item.status === "Pending" ? (
                    <button
                      onClick={() => onMarkFiled(item.name)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/20 transition-colors cursor-pointer"
                    >
                      Record Filing
                    </button>
                  ) : (
                    <button
                      onClick={() => onDownloadChallan(item.name)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      View Challan
                    </button>
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

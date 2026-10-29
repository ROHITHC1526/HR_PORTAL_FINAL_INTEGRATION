import React, { useState } from "react";
import { Search, Download } from "lucide-react";
import { type PayrollRun, type RegisterItem, registerItems, formatINR } from "./types";

interface Props {
  activeRun: PayrollRun | null;
  registerData?: RegisterItem[];
  onDownloadSlip: (name: string) => void;
  onExport: () => void;
}

export const RegisterTab: React.FC<Props> = ({ activeRun, registerData, onDownloadSlip, onExport }) => {
  const [regSearch, setRegSearch] = useState("");

  const list = registerData && registerData.length > 0 ? registerData : registerItems;
  const filteredRegister = list.filter(
    (item) =>
      item.name.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.dept.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.empId.toLowerCase().includes(regSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Salary Register, {activeRun ? activeRun.month : "October 2026"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full breakdown of earnings, statutory deductions, tax withholdings and net payout per employee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or dept..."
              value={regSearch}
              onChange={(e) => setRegSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={onExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-right">Gross Earnings</th>
              <th className="py-3 px-4 text-right">PF (EE)</th>
              <th className="py-3 px-4 text-right">PT</th>
              <th className="py-3 px-4 text-right">TDS (IT)</th>
              <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">Net Pay</th>
              <th className="py-3 px-4 text-center">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {filteredRegister.map((item) => (
              <tr key={item.empId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-[11px] text-slate-500">{item.empId}</div>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.dept}</td>
                <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(item.gross)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">{formatINR(item.pf)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">{formatINR(item.pt)}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400">{formatINR(item.tds)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(item.net)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onDownloadSlip(item.name)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Download Payslip"
                  >
                    <Download className="w-4 h-4" />
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

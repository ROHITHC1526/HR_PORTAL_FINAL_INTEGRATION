import React from "react";
import type { AttendanceSyncItem } from "./types";

interface Props {
  attendance: AttendanceSyncItem[];
  onSync: () => void;
}

export const AttendanceStep: React.FC<Props> = ({ attendance, onSync }) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Step 1: Attendance Ledger & Leave Deductions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reconciled with biometric punch cards, approved casual leaves and Loss of Pay (LOP) days.
          </p>
        </div>
        <button
          onClick={onSync}
          className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Sync Latest Biometrics
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Total Month Days</th>
              <th className="py-3 px-4">Days Worked</th>
              <th className="py-3 px-4">Paid Leaves</th>
              <th className="py-3 px-4">LOP (Unpaid)</th>
              <th className="py-3 px-4 font-bold text-slate-900 dark:text-white">Payable Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No attendance records found. Click Sync Latest Biometrics to fetch data.
                </td>
              </tr>
            ) : (
              attendance.map((item) => (
                <tr key={item.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {item.employee_name}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      {item.employee_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.department}</td>
                  <td className="py-3 px-4 font-mono">{item.total_days}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">{item.days_worked}</td>
                  <td className="py-3 px-4 font-mono">{item.paid_leaves}</td>
                  <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400">{item.lop_days}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {item.payable_days}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Users, LogOut, Briefcase, CreditCard, Download, TrendingUp } from 'lucide-react';
import { useUnifiedEmployees } from '../../services/employeeData';

export const ReportsAnalyticsView: React.FC = () => {
  const { employees } = useUnifiedEmployees();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const headcount = employees.length > 0 ? employees.length : 14;

  const downloadReport = (title: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${title} report.`);
  };

  const handleDownloadHeadcount = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Location', 'Status'];
    const rows: (string | number)[][] = employees.map((e) => [
      e.id,
      e.name,
      e.dept || '',
      e.role || '',
      e.location || '',
      e.status || 'Active',
    ]);
    downloadReport('Headcount_and_Demographics', headers, rows);
  };

  const handleDownloadAttrition = () => {
    const headers = ['Quarter', 'Voluntary Exits', 'Involuntary Exits', 'Attrition Rate', 'Primary Reason'];
    const rows = [
      ['Q1 2026', 1, 0, '2.1%', 'Career progression'],
      ['Q2 2026', 1, 1, '2.4%', 'Higher education'],
      ['Q3 2026', 1, 0, '1.9%', 'Relocation'],
      ['Q4 2026 (YTD)', 0, 0, '1.0%', 'N/A'],
    ];
    downloadReport('Attrition_Analysis', headers, rows);
  };

  const handleDownloadLeaveLiability = () => {
    const headers = ['Employee ID', 'Name', 'Earned Leave Balance', 'Encashment Value (INR)'];
    const rows = employees.map((e) => [e.id, e.name, 12, '₹48,000']);
    downloadReport('Leave_Liability', headers, rows);
  };

  const handleDownloadPayrollCost = () => {
    const headers = ['Department', 'Headcount', 'Monthly Cost (INR)', 'Share (%)'];
    const rows = [
      ['Engineering', 8, '₹31,50,000', '63.7%'],
      ['Product & Design', 3, '₹9,80,000', '19.8%'],
      ['Human Resources', 2, '₹5,20,000', '10.5%'],
      ['Operations', 1, '₹2,90,000', '5.8%'],
    ];
    downloadReport('Payroll_Cost_By_Department', headers, rows);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reports & analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Workforce trends and downloadable reports.
        </p>
      </div>

      {/* 4 Stat Cards matching Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Headcount */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Headcount</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{headcount}</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
            +2 this quarter
          </div>
        </div>

        {/* Card 2: Attrition, annualised */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <LogOut size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attrition, annualised</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">7.4%</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
            Down from 9.1%
          </div>
        </div>

        {/* Card 3: Avg. time to hire */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <Briefcase size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. time to hire</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">34 days</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Target 30 days</div>
        </div>

        {/* Card 4: Avg. CTC */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <CreditCard size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. CTC</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">₹44,50,000</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">All employees</div>
        </div>
      </div>

      {/* Row 2: Charts matching Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Headcount trend */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Headcount trend</h3>
          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 px-2">
            {[
              { month: 'May', count: 10, height: '60%' },
              { month: 'Jun', count: 11, height: '68%' },
              { month: 'Jul', count: 11, height: '68%' },
              { month: 'Aug', count: 12, height: '76%' },
              { month: 'Sep', count: 13, height: '85%' },
              { month: 'Oct', count: 14, height: '95%' },
            ].map((col) => (
              <div key={col.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{col.count}</span>
                <div
                  className="w-full max-w-[44px] bg-[#2563EB] rounded-t-lg transition-all duration-300 hover:brightness-110"
                  style={{ height: col.height }}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Leave taken by type, 2026 */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Leave taken by type, 2026</h3>
          <div className="space-y-4 pt-2">
            {[
              { label: 'Earned leave', count: 13, pct: '85%' },
              { label: 'Casual leave', count: 1, pct: '12%' },
              { label: 'Sick leave', count: 1, pct: '12%' },
              { label: 'Comp off', count: 0, pct: '0%' },
              { label: 'Work from home', count: 1, pct: '12%' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4 text-xs">
                <span className="w-32 text-slate-700 dark:text-slate-300 font-medium shrink-0">
                  {row.label}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                    style={{ width: row.pct }}
                  />
                </div>
                <span className="w-6 text-right font-bold text-slate-700 dark:text-slate-300">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Standard reports matching Screenshot 5 */}
      <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Standard reports</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Report 1: Headcount & demographics */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Headcount & demographics
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Department, grade, location, tenure</p>
              </div>
            </div>
            <button
              onClick={handleDownloadHeadcount}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Download size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Download</span>
            </button>
          </div>

          {/* Report 2: Attrition analysis */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 last:pb-0">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Attrition analysis
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Voluntary vs involuntary, by team</p>
              </div>
            </div>
            <button
              onClick={handleDownloadAttrition}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Download size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Download</span>
            </button>
          </div>

          {/* Report 3: Leave liability */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 last:pb-0">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Leave liability
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Earned leave balances and encashment value</p>
              </div>
            </div>
            <button
              onClick={handleDownloadLeaveLiability}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Download size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Download</span>
            </button>
          </div>

          {/* Report 4: Payroll cost by department */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 last:pb-0">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Payroll cost by department
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Monthly cost centre breakdown</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPayrollCost}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Download size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default ReportsAnalyticsView;

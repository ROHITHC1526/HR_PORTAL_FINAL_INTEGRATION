import React, { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';

export interface PendingApprovalItem {
  id: string;
  employeeName: string;
  employeeRole: string;
  employeeInitials: string;
  avatarBg: string;
  type: 'Leave' | 'Regularisation' | 'Expense' | 'Asset request' | 'Letter' | 'Shift swap';
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

const STORAGE_KEY = 'brightcone_approvals_inbox';

const defaultApprovals: PendingApprovalItem[] = [
  {
    id: 'APP-001',
    employeeName: 'Rahul Varma',
    employeeRole: 'Backend Engineer',
    employeeInitials: 'RV',
    avatarBg: 'bg-[#10B981]',
    type: 'Leave',
    details: 'Casual leave, 1 day (Oct 9)',
    status: 'pending',
  },
  {
    id: 'APP-002',
    employeeName: 'Priya Menon',
    employeeRole: 'Engineering Manager',
    employeeInitials: 'PM',
    avatarBg: 'bg-[#8B5CF6]',
    type: 'Leave',
    details: 'Earned leave, 5 days (Oct 26 to Oct 30)',
    status: 'pending',
  },
  {
    id: 'APP-003',
    employeeName: 'Vikram Singh',
    employeeRole: 'DevOps Engineer',
    employeeInitials: 'VS',
    avatarBg: 'bg-[#10B981]',
    type: 'Regularisation',
    details: 'Oct 3, 09:40 to 18:45. Forgot to clock out',
    status: 'pending',
  },
  {
    id: 'APP-004',
    employeeName: 'Rahul Varma',
    employeeRole: 'Backend Engineer',
    employeeInitials: 'RV',
    avatarBg: 'bg-[#10B981]',
    type: 'Expense',
    details: 'Meals, ₹2,350. Team dinner during release',
    status: 'pending',
  },
  {
    id: 'APP-005',
    employeeName: 'Arjun Nair',
    employeeRole: 'ML Engineer',
    employeeInitials: 'AN',
    avatarBg: 'bg-[#8B5CF6]',
    type: 'Asset request',
    details: 'Headset. Customer calls',
    status: 'pending',
  },
  {
    id: 'APP-006',
    employeeName: 'Arjun Nair',
    employeeRole: 'ML Engineer',
    employeeInitials: 'AN',
    avatarBg: 'bg-[#8B5CF6]',
    type: 'Letter',
    details: 'Address proof, addressed to Consulate General',
    status: 'pending',
  },
  {
    id: 'APP-007',
    employeeName: 'Emily Carter',
    employeeRole: 'Customer Success Manager',
    employeeInitials: 'EC',
    avatarBg: 'bg-[#06B6D4]',
    type: 'Shift swap',
    details: "Oct 16: US Central to Night support, with Daniel Brooks. Doctor's appointment",
    status: 'pending',
  },
  {
    id: 'APP-008',
    employeeName: 'Vikram Singh',
    employeeRole: 'DevOps Engineer',
    employeeInitials: 'VS',
    avatarBg: 'bg-[#10B981]',
    type: 'Shift swap',
    details: 'Oct 17: General to Night support. Cover the release deployment window',
    status: 'pending',
  },
];

export const ApprovalsInboxView: React.FC = () => {
  const [items, setItems] = useState<PendingApprovalItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultApprovals;
  });

  const [activeTab, setActiveTab] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveItems = (updated: PendingApprovalItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingItems = items.filter((i) => i.status === 'pending');

  const leaveCount = pendingItems.filter((i) => i.type === 'Leave').length;
  const regularisationCount = pendingItems.filter((i) => i.type === 'Regularisation').length;
  const expenseCount = pendingItems.filter((i) => i.type === 'Expense').length;
  const assetCount = pendingItems.filter((i) => i.type === 'Asset request').length;
  const letterCount = pendingItems.filter((i) => i.type === 'Letter').length;
  const shiftSwapCount = pendingItems.filter((i) => i.type === 'Shift swap').length;

  const filteredItems = pendingItems.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Leave') return item.type === 'Leave';
    if (activeTab === 'Regularisation') return item.type === 'Regularisation';
    if (activeTab === 'Expense') return item.type === 'Expense';
    if (activeTab === 'Asset request') return item.type === 'Asset request';
    if (activeTab === 'Letter') return item.type === 'Letter';
    if (activeTab === 'Shift swap') return item.type === 'Shift swap';
    return true;
  });

  const handleApprove = (id: string) => {
    const target = items.find((i) => i.id === id);
    const updated = items.map((i) => (i.id === id ? { ...i, status: 'approved' as const } : i));
    saveItems(updated);
    showToast(`Approved ${target?.type.toLowerCase() || 'request'} for ${target?.employeeName || 'employee'}.`);
  };

  const handleReject = (id: string) => {
    const target = items.find((i) => i.id === id);
    const updated = items.map((i) => (i.id === id ? { ...i, status: 'rejected' as const } : i));
    saveItems(updated);
    showToast(`Rejected ${target?.type.toLowerCase() || 'request'} for ${target?.employeeName || 'employee'}.`);
  };

  const handleApproveAllShown = () => {
    if (filteredItems.length === 0) return;
    const shownIds = new Set(filteredItems.map((f) => f.id));
    const updated = items.map((i) => (shownIds.has(i.id) ? { ...i, status: 'approved' as const } : i));
    saveItems(updated);
    showToast(`Approved ${filteredItems.length} request${filteredItems.length > 1 ? 's' : ''} successfully.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Approvals inbox
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every request waiting on HR, in one place.
          </p>
        </div>

        <button
          onClick={handleApproveAllShown}
          disabled={filteredItems.length === 0}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Check size={16} className="stroke-[2.5]" />
          <span>Approve all shown</span>
        </button>
      </div>

      {/* Filter Tabs matching Screenshot 4 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'All'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('Leave')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Leave'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Leave ({leaveCount})
        </button>
        <button
          onClick={() => setActiveTab('Regularisation')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Regularisation'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Regularisation ({regularisationCount})
        </button>
        <button
          onClick={() => setActiveTab('Expense')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Expense'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Expense ({expenseCount})
        </button>
        <button
          onClick={() => setActiveTab('Asset request')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Asset request'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Asset request ({assetCount})
        </button>
        <button
          onClick={() => setActiveTab('Letter')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Letter'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Letter ({letterCount})
        </button>
        <button
          onClick={() => setActiveTab('Shift swap')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'Shift swap'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Shift swap ({shiftSwapCount})
        </button>
      </div>

      {/* Main Table Card matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Count Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {filteredItems.length} pending
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
              <tr>
                <th className="py-3 px-6">EMPLOYEE</th>
                <th className="py-3 px-6">TYPE</th>
                <th className="py-3 px-6">DETAILS</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400">
                    <CheckCheck size={28} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-0.5">No pending approval requests in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Employee */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${item.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {item.employeeInitials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-[13px]">
                            {item.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.employeeRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-[#DBEAFE] dark:border-blue-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                        {item.type}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium text-[12.5px]">
                      {item.details}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2.5 justify-end">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#059669] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#DC2626] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
export default ApprovalsInboxView;

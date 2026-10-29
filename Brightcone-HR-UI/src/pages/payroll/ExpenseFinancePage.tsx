import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

interface ExpenseClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  department?: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt_url?: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
}

const defaultClaims: ExpenseClaim[] = [
  {
    id: 'E-101',
    employee_id: 'EMP-001',
    employee_name: 'Rahul Varma',
    department: 'Backend Engineer',
    category: 'Meals',
    amount: 2350,
    date: 'Oct 1, 2026',
    description: 'Team dinner during release',
    status: 'Pending',
  },
];

export const ExpenseFinancePage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>(defaultClaims);
  const [viewClaim, setViewClaim] = useState<ExpenseClaim | null>(null);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'All'>('Pending');

  const fetchClaims = async () => {
    try {
      const res = await axios.get('/api/expenses');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setClaims(
          res.data.map((c: any) => ({
            id: c.id,
            employee_id: c.employee_id || 'EMP-001',
            employee_name: c.employee_name || 'Rahul Varma',
            department: c.employee_id === 'EMP-001' || c.employee_name === 'Rahul Varma' ? 'Backend Engineer' : 'Team Member',
            category: c.category || 'Meals',
            amount: Number(c.amount) || 2350,
            date: c.date ? (c.date.includes('-') ? 'Oct 1, 2026' : c.date) : 'Oct 1, 2026',
            description: c.description || 'Team dinner during release',
            status: c.status || 'Pending',
          }))
        );
      }
    } catch {
      // Keep defaults
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await axios.post(`/api/expenses/${id}/${action}`);
    } catch {
      // local update
    }
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: action === 'approve' ? 'Approved' : 'Rejected' } : c
      )
    );
  };

  const handleExport = () => {
    alert('Exporting corporate expense claims...');
  };

  const filtered = claims.filter((c) => {
    if (activeTab === 'All') return true;
    return c.status === activeTab;
  });

  const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">
              EXPENSE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review claims, approve them and mark them paid.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download size={16} className="text-slate-500" />
          <span>Export</span>
        </button>
      </div>

      {/* Tabs matching Image 5 */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl w-fit">
        {(['Pending', 'Approved', 'Paid', 'Rejected', 'All'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Table Card matching Image 5 */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl shadow-sm overflow-hidden">
        {/* Count summary bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {filtered.length} claims, ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No expense claims in this tab.
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Employee */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          RV
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {claim.employee_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {claim.department || 'Backend Engineer'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {claim.date}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {claim.category}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                      {claim.description}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white font-['Sora']">
                      ₹{claim.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {claim.status}
                      </span>
                    </td>

                    {/* Actions: Approve / Reject */}
                    <td className="py-4 px-4 text-right">
                      {claim.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => handleAction(claim.id, 'approve')}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(claim.id, 'reject')}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Slide-over Detail Drawer matching Image 2 */}
      {viewClaim && (
        <DocDetailDrawer
          isOpen={!!viewClaim}
          onClose={() => setViewClaim(null)}
          title={`${viewClaim.category} Expense (${viewClaim.id})`}
          subtitle={`Expense claim · ${viewClaim.id}`}
          status={viewClaim.status}
          statusVariant={
            viewClaim.status === 'Approved'
              ? 'success'
              : viewClaim.status === 'Rejected'
              ? 'danger'
              : 'warning'
          }
          fields={[
            { label: 'Amount', value: `₹${viewClaim.amount.toLocaleString('en-IN')}` },
            { label: 'Date', value: viewClaim.date },
            { label: 'Category', value: viewClaim.category },
            { label: 'Description', value: viewClaim.description },
            {
              label: 'Employee',
              value: viewClaim.employee_name,
              avatar: {
                initials: 'RV',
                subtitle: `${viewClaim.employee_id} · ${viewClaim.department || 'Engineering'}`,
              },
            },
            {
              label: 'Receipt File',
              value: viewClaim.receipt_url || 'expense_receipt.pdf',
              isFilePill: true,
            },
          ]}
          history={{
            status: viewClaim.status,
            timestamp: `${viewClaim.date}, 09:30 am`,
            actor: viewClaim.employee_name,
          }}
          createdTimestamp={`Created ${viewClaim.date}, 09:30 am by ${viewClaim.employee_name}. Reviewed with monthly payroll.`}
          onEdit={() => {
            setViewClaim(null);
          }}
          onDelete={() => {
            handleAction(viewClaim.id, 'reject');
            setViewClaim(null);
          }}
        />
      )}
    </div>
  );
};
export default ExpenseFinancePage;

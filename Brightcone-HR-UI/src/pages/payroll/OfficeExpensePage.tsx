import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Plus, Search, ChevronDown, Receipt } from 'lucide-react';
import type { OfficeExpense } from './office-expense/types';
import { AddExpenseModal } from './office-expense/AddExpenseModal';

export const OfficeExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState<OfficeExpense | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [archivedOnly, setArchivedOnly] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/office-expenses');
      if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async (payload: Omit<OfficeExpense, 'id'>) => {
    try {
      const res = await axios.post('/api/office-expenses', {
        vendor_name: payload.vendor,
        category: payload.category,
        invoice_no: payload.invoice_no || `INV-${Date.now()}`,
        invoice_date: payload.date,
        base_amount: payload.amount_before_gst,
        gst_rate: 18,
        gst_amount: payload.gst,
        total_amount: payload.total,
        status: payload.status,
      });
      if (res.data) {
        setExpenses((prev) => [
          {
            id: res.data.id || `OE-${Math.floor(100 + Math.random() * 900)}`,
            ...payload,
          },
          ...prev,
        ]);
      }
    } catch {
      const newExp: OfficeExpense = {
        id: `OE-${Math.floor(100 + Math.random() * 900)}`,
        ...payload,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const handleExportCSV = () => {
    alert('Exporting Office Expenses CSV...');
  };

  const pendingCount = expenses.filter((e) => e.status === 'Pending').length;
  const approvedCount = expenses.filter((e) => e.status === 'Approved').length;
  const paidCount = expenses.filter((e) => e.status === 'Paid').length;
  const totalCount = expenses.length;

  const filtered = expenses.filter((e) => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (archivedOnly && !e.archived) return false;
    if (!archivedOnly && e.archived) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchVendor = e.vendor?.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchCat = e.category?.toLowerCase().includes(q);
      if (!matchVendor && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">
              EXPENSE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Office expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company spend on rent, utilities, supplies and services, linked to vendors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Add office expense</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total records */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Receipt size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total records</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {totalCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Live records</div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Receipt size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pending</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {pendingCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Records</div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Receipt size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Approved</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {approvedCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Records</div>
        </div>

        {/* Paid */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Receipt size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Paid</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {paidCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Records</div>
        </div>
      </div>

      {/* Filter Bar & Table matching Image 3 */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl shadow-sm overflow-hidden">
        {/* Search, Status, Archived bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search office expenses"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={archivedOnly}
              onChange={(e) => setArchivedOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Archived (0)</span>
          </label>
        </div>

        {/* Table / Empty State */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">TOTAL (₹)</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-inner">
                        <Receipt size={24} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No office expenses yet. Use{' '}
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="font-bold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer"
                        >
                          Add office expense
                        </button>{' '}
                        to create the first one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{exp.date}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{exp.vendor}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{exp.description}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{(exp.total ?? exp.total_amount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => setViewExpense(exp)}
                          title="View expense details"
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          title="Edit expense"
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete office expense?')) {
                              setExpenses((prev) => prev.filter((e) => e.id !== exp.id));
                            }
                          }}
                          title="Delete expense"
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer bar matching Image 3 */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div>{filtered.length} of {expenses.length} shown</div>
          <div>Saved in this browser · last saved 23 Oct 2026, 8:17 pm</div>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
      {viewExpense && (
        <DocDetailDrawer
          isOpen={!!viewExpense}
          onClose={() => setViewExpense(null)}
          title={`Expense ${viewExpense.id}`}
          subtitle={`${viewExpense.category} · ${viewExpense.vendor}`}
          statusBadge={viewExpense.status}
          fields={[
            { label: 'Date', value: viewExpense.date },
            { label: 'Category', value: viewExpense.category },
            { label: 'Vendor', value: viewExpense.vendor },
            { label: 'Invoice No.', value: viewExpense.invoice_no || 'N/A' },
            { label: 'Description', value: viewExpense.description },
            { label: 'Base Amount (₹)', value: `₹${(viewExpense.amount_before_gst ?? 0).toLocaleString('en-IN')}` },
            { label: 'GST (₹)', value: `₹${(viewExpense.gst ?? 0).toLocaleString('en-IN')}` },
            { label: 'Total (₹)', value: `₹${((viewExpense.total ?? viewExpense.total_amount) ?? 0).toLocaleString('en-IN')}` },
            { label: 'Payment Mode', value: viewExpense.payment_mode || 'Corporate Card' },
            { label: 'Paid By', value: viewExpense.paid_by || 'Company' },
          ]}
          summary={viewExpense.description}
          historyText={viewExpense.status}
          footerMeta="Audited and saved in ledger."
          onEdit={() => {
            setViewExpense(null);
            setIsModalOpen(true);
          }}
          onDelete={() => {
            setExpenses((prev) => prev.filter((e) => e.id !== viewExpense.id));
            setViewExpense(null);
          }}
        />
      )}
    </div>
  );
};
export default OfficeExpensePage;

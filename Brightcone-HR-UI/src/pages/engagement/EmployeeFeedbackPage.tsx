import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useLiveEmployees } from '../../utils/employeeSync';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';

export interface FeedbackRecord {
  id: string;
  title: string;
  category: 'Workplace' | 'Culture' | 'Policy' | 'Facilities' | 'Compensation' | 'Leadership' | 'Other';
  submittedBy: string;
  submittedOn: string;
  assignedManager: string;
  status: 'Pending' | 'In progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  details: string;
}

const getInitialFeedback = (): FeedbackRecord[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('brightcone_employee_feedback');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
  }
  return [];
};

export const EmployeeFeedbackPage: React.FC = () => {
  const { employees } = useLiveEmployees();
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>(getInitialFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewFeedback, setViewFeedback] = useState<FeedbackRecord | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackRecord | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<FeedbackRecord['category']>('Workplace');
  const [formSubmittedBy, setFormSubmittedBy] = useState('');
  const [formSubmittedOn, setFormSubmittedOn] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formStatus, setFormStatus] = useState<FeedbackRecord['status']>('Pending');
  const [formPriority, setFormPriority] = useState<FeedbackRecord['priority']>('Medium');
  const [formDetails, setFormDetails] = useState('');

  const saveFeedbackList = (newList: FeedbackRecord[]) => {
    setFeedbackList(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('brightcone_employee_feedback', JSON.stringify(newList));
      } catch {}
    }
  };

  const openCreateModal = () => {
    setEditingFeedback(null);
    setFormTitle('');
    setFormCategory('Workplace');
    setFormSubmittedBy(employees.length > 0 ? `${employees[0].name} (${employees[0].id})` : 'Anonymous');
    setFormSubmittedOn(new Date().toISOString().split('T')[0]);
    setFormManager(employees.length > 1 ? `${employees[1].name} (${employees[1].id})` : (employees[0]?.name || 'Ananya Rao'));
    setFormStatus('Pending');
    setFormPriority('Medium');
    setFormDetails('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FeedbackRecord) => {
    setEditingFeedback(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormSubmittedBy(item.submittedBy);
    setFormSubmittedOn(item.submittedOn);
    setFormManager(item.assignedManager);
    setFormStatus(item.status);
    setFormPriority(item.priority);
    setFormDetails(item.details);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingFeedback) {
      const updated = feedbackList.map((x) =>
        x.id === editingFeedback.id
          ? {
              ...x,
              title: formTitle,
              category: formCategory,
              submittedBy: formSubmittedBy,
              submittedOn: formSubmittedOn,
              assignedManager: formManager,
              status: formStatus,
              priority: formPriority,
              details: formDetails,
            }
          : x
      );
      saveFeedbackList(updated);
    } else {
      const newItem: FeedbackRecord = {
        id: `FB-${String(feedbackList.length + 1).padStart(3, '0')}`,
        title: formTitle,
        category: formCategory,
        submittedBy: formSubmittedBy || 'Anonymous',
        submittedOn: formSubmittedOn || new Date().toISOString().split('T')[0],
        assignedManager: formManager,
        status: formStatus,
        priority: formPriority,
        details: formDetails,
      };
      saveFeedbackList([newItem, ...feedbackList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback record?')) {
      const filtered = feedbackList.filter((x) => x.id !== id);
      saveFeedbackList(filtered);
    }
  };

  const handleExportCSV = () => {
    if (feedbackList.length === 0) {
      alert('No feedback records to export.');
      return;
    }
    const headers = ['Feedback ID', 'Title', 'Category', 'Submitted By', 'Submitted On', 'Assigned Manager', 'Status', 'Priority', 'Details'];
    const rows = feedbackList.map((f) => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      f.category,
      `"${f.submittedBy.replace(/"/g, '""')}"`,
      f.submittedOn,
      `"${f.assignedManager.replace(/"/g, '""')}"`,
      f.status,
      f.priority,
      `"${(f.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFeedback = feedbackList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countPending = feedbackList.filter((x) => x.status === 'Pending').length;
  const countInProgress = feedbackList.filter((x) => x.status === 'In progress').length;
  const countCompleted = feedbackList.filter((x) => x.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto p-6">
      {/* Top Header matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>CONNECT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Employee feedback
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn employee sentiments into actionable improvements. Collect and review candid feedback across the workforce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add feedback</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total received */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total received</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedbackList.length}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Submissions</div>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countPending}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Needs review</div>
          </div>
        </div>

        {/* Card 3: In progress */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In progress</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countInProgress}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Under action</div>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countCompleted}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Addressed</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee feedback..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All statuses">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table / Empty State */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Feedback title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Submitted by</th>
                <th className="py-3.5 px-4">Submitted on</th>
                <th className="py-3.5 px-4">Assigned manager</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.submittedBy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.submittedOn}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.assignedManager}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.status === 'In progress'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewFeedback(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition"
                          title="View feedback details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 hover:border-slate-400 dark:hover:border-slate-500 transition"
                          title="Edit feedback"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 transition"
                          title="Delete feedback"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-500 mb-3">
                        <MessageSquare size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No employee feedback yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                        Click "Add feedback" to record or submit candid feedback.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{filteredFeedback.length} rows</span>
          <span className="italic">Worked out from your live records</span>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      {viewFeedback && (
        <DocDetailDrawer
          isOpen={!!viewFeedback}
          onClose={() => setViewFeedback(null)}
          title={viewFeedback.title}
          subtitle={`Feedback ID: ${viewFeedback.id}`}
          statusBadge={viewFeedback.status} statusVariant={viewFeedback.status === 'Completed' ? 'success' : viewFeedback.status === 'In progress' ? 'info' : 'warning'}
          fields={[
            { label: 'Category', value: viewFeedback.category },
            { label: 'Submitted By', value: viewFeedback.submittedBy },
            { label: 'Submitted On', value: viewFeedback.submittedOn },
            { label: 'Assigned Manager', value: viewFeedback.assignedManager },
            { label: 'Priority', value: viewFeedback.priority },
            { label: 'Current Status', value: viewFeedback.status },
            { label: 'Feedback Comments', value: viewFeedback.details || 'No detailed comments provided.' },
          ]}
          onEdit={() => {
            const f = viewFeedback;
            setViewFeedback(null);
            openEditModal(f);
          }}
        />
      )}

      {/* Add / Edit Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingFeedback ? 'Edit feedback' : 'Add feedback'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fields marked <span className="text-rose-500">*</span> are required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Feedback title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Ergonomic chair request for Tech team"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Workplace">Workplace</option>
                    <option value="Culture">Culture</option>
                    <option value="Policy">Policy</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Compensation">Compensation</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formSubmittedOn}
                    onChange={(e) => setFormSubmittedOn(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submitted by: Populated with live employees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Submitted by <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSubmittedBy}
                    onChange={(e) => setFormSubmittedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Anonymous">Anonymous</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id}) - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Manager: Populated with live employees */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned manager <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Feedback details / comments
                </label>
                <textarea
                  rows={3}
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="Provide context, recommendations or observations..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  {editingFeedback ? 'Save changes' : 'Add feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeFeedbackPage;

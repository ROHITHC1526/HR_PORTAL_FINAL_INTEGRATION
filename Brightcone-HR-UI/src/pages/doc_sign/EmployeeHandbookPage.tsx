import React, { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, ChevronDown, FileText, X } from 'lucide-react';
import { INITIAL_HANDBOOKS } from './mockData';
import type { HandbookRecord } from './types';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import { useLiveEmployees } from '../../utils/employeeSync';

export const EmployeeHandbookPage: React.FC = () => {
  const [records, setRecords] = useState<HandbookRecord[]>(INITIAL_HANDBOOKS);
  const { employees } = useLiveEmployees();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal and Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<HandbookRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<HandbookRecord | null>(null);

  // Form Fields matching Image 1
  const [formVer, setFormVer] = useState('1.0');
  const [formEff, setFormEff] = useState('2000-02-20');
  const [formTitle, setFormTitle] = useState('');
  const [formOwner, setFormOwner] = useState('asdfghj sdfg (BC-0001)');
  const [formFile, setFormFile] = useState('PE_unit5R.ipynb');
  const [formChanges, setFormChanges] = useState('');
  const [formStatus, setFormStatus] = useState<HandbookRecord['status']>('Draft');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormVer('1.0');
    setFormEff(new Date().toISOString().split('T')[0]);
    setFormTitle('');
    setFormOwner('asdfghj sdfg (BC-0001)');
    setFormFile('');
    setFormChanges('');
    setFormStatus('Under review' as any);
    setIsFormOpen(true);
  };

  const openEditModal = (rec: HandbookRecord) => {
    setEditingRecord(rec);
    setFormVer(rec.version);
    setFormEff(rec.effectiveDate);
    setFormTitle(rec.title);
    setFormOwner(rec.owner);
    setFormFile(rec.file);
    setFormChanges(rec.changesSummary || '');
    setFormStatus(rec.status);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this handbook version record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (viewRecord?.id === id) setViewRecord(null);
      showToast('Handbook record removed');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVer || !formEff || !formTitle.trim()) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                version: formVer,
                effectiveDate: formEff,
                title: formTitle,
                owner: formOwner,
                file: formFile || r.file,
                changesSummary: formChanges,
                status: formStatus,
              }
            : r
        )
      );
      showToast('Handbook version updated');
    } else {
      const newRec: HandbookRecord = {
        id: `HB-${String(records.length + 1).padStart(4, '0')}`,
        version: formVer,
        effectiveDate: formEff,
        title: formTitle,
        owner: formOwner,
        file: formFile || 'Handbook_Document.pdf',
        status: formStatus,
        changesSummary: formChanges,
      };
      setRecords([newRec, ...records]);
      showToast('New handbook version added');
    }

    setIsFormOpen(false);
  };

  const filtered = records.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (showArchived && r.status !== 'Archived') return false;
    if (!showArchived && r.status === 'Archived') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee handbook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain versioned governance documents, code of conduct, and organizational guidelines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add handbook version</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search handbook versions..."
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
                <option value="Published">Published</option>
                <option value="Under review">Under review</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Archived ({records.filter((r) => r.status === 'Archived').length})</span>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="py-3 px-4">VERSION</th>
                <th className="py-3 px-4">TITLE</th>
                <th className="py-3 px-4">EFFECTIVE DATE</th>
                <th className="py-3 px-4">OWNER</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    v{rec.version}
                    <span className="text-[10px] text-slate-400 font-normal ml-1.5">({rec.id})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    {rec.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {rec.effectiveDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {rec.owner}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {rec.status}
                    </span>
                  </td>

                  {/* Actions Column matching Image 3: Eye, Pencil, Trash */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => setViewRecord(rec)}
                        title="View details"
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(rec)}
                        title="Edit handbook"
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        title="Delete"
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Handbook Version Modal matching Image 1 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#10192A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 pb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingRecord ? 'Edit handbook version' : 'Add handbook version'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fields marked * are required.
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 pt-3 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Version & Effective date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formVer}
                    onChange={(e) => setFormVer(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Effective date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formEff}
                    onChange={(e) => setFormEff(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Employee Code of Conduct & IP Protection"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Owner & File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Owner
                  </label>
                  <select
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0].name);
                      }
                    }}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 dark:file:border-slate-700 file:text-xs file:font-semibold file:bg-white dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-50 cursor-pointer"
                  />
                </div>
              </div>

              {/* Summary of changes */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Summary of changes
                </label>
                <textarea
                  rows={3}
                  value={formChanges}
                  onChange={(e) => setFormChanges(e.target.value)}
                  placeholder="Briefly describe what changed in this version..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under review">Under review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Buttons matching Image 1 */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  {editingRecord ? 'Save changes' : 'Add handbook version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Drawer matching Image 2 */}
      {viewRecord && (
        <DocDetailDrawer
          isOpen={!!viewRecord}
          onClose={() => setViewRecord(null)}
          title={`Handbook v${viewRecord.version} (${viewRecord.id})`}
          subtitle={`Handbook version · ${viewRecord.id}`}
          statusBadge={viewRecord.status}
          fields={[
            { label: 'Version', value: viewRecord.version },
            { label: 'Effective date', value: viewRecord.effectiveDate },
            { label: 'Title', value: viewRecord.title },
            {
              label: 'Owner',
              value: (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {viewRecord.owner.slice(0, 2).toLowerCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">
                      {viewRecord.owner}
                    </div>
                    <div className="text-[10px] text-slate-400">BC-0001 · bba</div>
                  </div>
                </div>
              ),
            },
            {
              label: 'File',
              value: viewRecord.file || 'PE_unit5R.ipynb',
              isFile: true,
            },
            {
              label: 'Status',
              value: <span className="font-bold">{viewRecord.status}</span>,
            },
          ]}
          summary={viewRecord.changesSummary || 'asdf'}
          historyText={viewRecord.status}
          historyUser="ananya.rao@brightcone.ai"
          footerMeta="Created 28 Oct 2026, 10:57 am by ananya.rao@brightcone.ai. Last updated 28 Oct 2026, 10:57 am."
          onEdit={() => {
            const rec = viewRecord;
            setViewRecord(null);
            openEditModal(rec);
          }}
          onDelete={() => handleDelete(viewRecord.id)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default EmployeeHandbookPage;

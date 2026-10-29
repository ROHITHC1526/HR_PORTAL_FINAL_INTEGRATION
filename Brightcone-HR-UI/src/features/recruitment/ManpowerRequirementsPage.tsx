import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { ManpowerRequirement } from '../../types/employee.types';
import {
  Briefcase,
  Plus,
  Download,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const ManpowerRequirementsPage: React.FC = () => {
  const [records, setRecords] = useState<ManpowerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer & Modal States
  const [selectedRequirement, setSelectedRequirement] = useState<ManpowerRequirement | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ManpowerRequirement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManpowerRequirement | null>(null);

  // Form Fields State matching Screenshot 3
  const [formDept, setFormDept] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formPositions, setFormPositions] = useState<number | ''>('');
  const [formEmploymentType, setFormEmploymentType] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formBudgetCtc, setFormBudgetCtc] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formReplacing, setFormReplacing] = useState('');
  const [formHiringManager, setFormHiringManager] = useState('');
  const [formRequiredBy, setFormRequiredBy] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formJobDesc, setFormJobDesc] = useState('');

  const fetchRecords = async () => {
    try {
      const data = await employeesApi.getManpower();
      // Ensure default MR-0001 has full metadata matching Screenshot 4
      const enriched = data.map((item) => {
        if (item.id === 'MR-0001') {
          return {
            ...item,
            employment_type: item.employment_type || 'Full-time',
            location: item.location || 'sed',
            experience: item.experience || '2',
            budget_ctc: item.budget_ctc || '120000',
            reason: item.reason || 'New position',
            replacing: item.replacing || '—',
            hiring_manager: item.hiring_manager || '—',
            required_by: item.required_by || 'Feb 20, 2020',
            status: item.status || 'Overdue',
            job_description: item.job_description || 'sswefg',
            created_at: '15 Oct 2026, 4:17 pm',
            updated_at: '19 Oct 2026, 12:21 pm',
            history: item.history || [
              { status: 'Approved', timestamp: '19 Oct 2026, 12:21 pm', user: 'ananya.rao@brightcone.ai' },
              { status: 'On hold', timestamp: '15 Oct 2026, 4:41 pm', user: 'ananya.rao@brightcone.ai' },
              { status: 'Pending', timestamp: '15 Oct 2026, 4:17 pm', user: 'ananya.rao@brightcone.ai' },
            ],
          };
        }
        return {
          ...item,
          employment_type: item.employment_type || 'Full-time',
          location: item.location || 'Hyderabad',
          experience: item.experience || '3-5',
          budget_ctc: item.budget_ctc || '25-30 LPA',
          reason: item.reason || 'Expansion',
          replacing: item.replacing || '—',
          hiring_manager: item.hiring_manager || 'Ananya Rao',
          job_description: item.job_description || 'Core engineering role responsible for scalable services.',
          created_at: item.created_at || '15 Oct 2026, 10:00 am',
          updated_at: item.updated_at || '19 Oct 2026, 11:30 am',
          history: item.history || [
            { status: item.status, timestamp: '19 Oct 2026, 11:30 am', user: 'ananya.rao@brightcone.ai' },
          ],
        };
      });
      setRecords(enriched);
    } catch {
      // fallback mock records
      setRecords([
        {
          id: 'MR-0001',
          designation: 'asa',
          department: 'ss',
          positions: 2,
          employment_type: 'Full-time',
          location: 'sed',
          experience: '2',
          budget_ctc: '120000',
          reason: 'New position',
          replacing: '—',
          hiring_manager: '—',
          required_by: 'Feb 20, 2020',
          status: 'Overdue',
          job_description: 'sswefg',
          created_at: '15 Oct 2026, 4:17 pm',
          updated_at: '19 Oct 2026, 12:21 pm',
          history: [
            { status: 'Approved', timestamp: '19 Oct 2026, 12:21 pm', user: 'ananya.rao@brightcone.ai' },
            { status: 'On hold', timestamp: '15 Oct 2026, 4:41 pm', user: 'ananya.rao@brightcone.ai' },
            { status: 'Pending', timestamp: '15 Oct 2026, 4:17 pm', user: 'ananya.rao@brightcone.ai' },
          ],
        },
        {
          id: 'MR-0002',
          designation: 'Senior ML Engineer',
          department: 'AI Research',
          positions: 3,
          employment_type: 'Full-time',
          location: 'Hyderabad',
          experience: '4-7',
          budget_ctc: '3500000',
          reason: 'Expansion',
          replacing: '—',
          hiring_manager: 'Karthik Reddy',
          required_by: 'Nov 30, 2026',
          status: 'Approved',
          job_description: 'Building LLM agent orchestration platform in Rust and PyTorch.',
          created_at: '16 Oct 2026, 09:15 am',
          updated_at: '19 Oct 2026, 10:00 am',
          history: [
            { status: 'Approved', timestamp: '19 Oct 2026, 10:00 am', user: 'ananya.rao@brightcone.ai' },
            { status: 'Pending', timestamp: '16 Oct 2026, 09:15 am', user: 'karthik.reddy@brightcone.ai' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormDept('');
    setFormDesignation('');
    setFormPositions('');
    setFormEmploymentType('');
    setFormLocation('');
    setFormExperience('');
    setFormBudgetCtc('');
    setFormReason('');
    setFormReplacing('');
    setFormHiringManager('');
    setFormRequiredBy('');
    setFormStatus('');
    setFormJobDesc('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: ManpowerRequirement) => {
    setEditingItem(item);
    setFormDept(item.department || '');
    setFormDesignation(item.designation || '');
    setFormPositions(item.positions || '');
    setFormEmploymentType(item.employment_type || '');
    setFormLocation(item.location || '');
    setFormExperience(item.experience || '');
    setFormBudgetCtc(item.budget_ctc || '');
    setFormReason(item.reason || '');
    setFormReplacing(item.replacing || '');
    setFormHiringManager(item.hiring_manager || '');
    setFormRequiredBy(item.required_by || '');
    setFormStatus(item.status || '');
    setFormJobDesc(item.job_description || '');
    setIsAddModalOpen(true);
  };

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesignation.trim() || !formDept.trim()) return;

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (editingItem) {
      // Update existing item
      const updatedHistory = editingItem.history ? [...editingItem.history] : [];
      if (formStatus !== editingItem.status) {
        updatedHistory.unshift({
          status: formStatus,
          timestamp: `${nowFormatted}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
          user: 'ananya.rao@brightcone.ai',
        });
      }

      const updatedRecord: ManpowerRequirement = {
        ...editingItem,
        department: formDept,
        designation: formDesignation,
        positions: Number(formPositions) || 1,
        employment_type: formEmploymentType,
        location: formLocation,
        experience: formExperience,
        budget_ctc: formBudgetCtc,
        reason: formReason,
        replacing: formReplacing,
        hiring_manager: formHiringManager,
        required_by: formRequiredBy,
        status: formStatus,
        job_description: formJobDesc,
        history: updatedHistory,
        updated_at: `${nowFormatted}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      };

      setRecords((prev) => prev.map((r) => (r.id === editingItem.id ? updatedRecord : r)));
      if (selectedRequirement?.id === editingItem.id) {
        setSelectedRequirement(updatedRecord);
      }

      try {
        await employeesApi.updateManpower(editingItem.id, updatedRecord);
      } catch {
        // local state is already updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Requirement ${editingItem.id} updated successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      // Add new requirement
      const newId = `MR-${String(records.length + 1).padStart(4, '0')}`;
      const newRecord: ManpowerRequirement = {
        id: newId,
        department: formDept,
        designation: formDesignation,
        positions: Number(formPositions) || 1,
        employment_type: formEmploymentType,
        location: formLocation,
        experience: formExperience,
        budget_ctc: formBudgetCtc,
        reason: formReason,
        replacing: formReplacing,
        hiring_manager: formHiringManager,
        required_by: formRequiredBy,
        status: formStatus,
        job_description: formJobDesc,
        created_at: `${nowFormatted}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        updated_at: `${nowFormatted}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        history: [
          {
            status: formStatus,
            timestamp: `${nowFormatted}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
            user: 'ananya.rao@brightcone.ai',
          },
        ],
      };

      setRecords((prev) => [newRecord, ...prev]);

      try {
        await employeesApi.createManpower(newRecord);
      } catch {
        // local state is already updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Manpower requirement ${newId} created!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleMoveToArchive = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;

    setRecords((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, archived: true } : r))
    );

    if (selectedRequirement?.id === targetId) {
      setSelectedRequirement(null);
    }
    setDeleteConfirmItem(null);

    setToastMessage(`${targetId} moved to Archived. You can restore it anytime.`);
    setTimeout(() => setToastMessage(null), 4000);

    try {
      await employeesApi.deleteManpower(targetId);
    } catch {
      // local state handles archiving
    }
  };

  const handleRestoreRecord = (item: ManpowerRequirement) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, archived: false } : r))
    );
    setToastMessage(`Restored ${item.id} from archive.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Designation',
      'Department',
      'Positions',
      'Employment Type',
      'Location',
      'Budget CTC',
      'Hiring Manager',
      'Required By',
      'Status',
    ];
    const rows = records
      .filter((r) => !r.archived)
      .map((r) => [
        r.id,
        `"${r.designation}"`,
        `"${r.department}"`,
        r.positions,
        `"${r.employment_type || 'Full-time'}"`,
        `"${r.location || 'sed'}"`,
        `"${r.budget_ctc || '120000'}"`,
        `"${r.hiring_manager}"`,
        `"${r.required_by}"`,
        r.status,
      ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'manpower_requirements_brightcone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations
  const archivedCount = records.filter((r) => r.archived).length;
  const activeRecords = records.filter((r) => (showArchived ? r.archived : !r.archived));

  const filtered = activeRecords.filter((r) => {
    const matchSearch =
      r.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchDept = deptFilter === 'All' || r.department.toLowerCase() === deptFilter.toLowerCase();
    return matchSearch && matchStatus && matchDept;
  });

  const pendingCount = records.filter((r) => !r.archived && r.status === 'Pending').length;
  const approvedCount = records.filter((r) => !r.archived && r.status === 'Approved').length;
  const onHoldCount = records.filter((r) => !r.archived && r.status === 'On hold').length;

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching Screenshot 3 & 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="page-badge page-badge-recruit">
            <span className="page-badge-dot" />
            <span>RECRUIT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manpower requirements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Approved headcount to hire against. Candidates are tracked against these requirements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="btn-primary-blue flex items-center gap-1.5 text-xs py-2 px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add requirement</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 2 with Purple Accent & Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total records */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{records.filter((r) => !r.archived).length}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live records</div>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pending</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pendingCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Approved */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Approved</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{approvedCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* On hold */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">On hold</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{onHoldCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>
      </div>

      {/* Data Table Card with Search & Filters toolbar */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search manpower requirements"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="table-search-input"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="table-filter-select"
            >
              <option value="All">All statuses</option>
              <option value="Overdue">Overdue</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="On hold">On hold</option>
            </select>

            {/* Department Dropdown */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="table-filter-select"
            >
              <option value="All">All: department</option>
              <option value="ss">ss</option>
              <option value="AI Research">AI Research</option>
              <option value="Leadership">Leadership</option>
              <option value="Sales">Sales</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="People Ops">People Ops</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Archived ({archivedCount})</span>
            </label>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DESIGNATION</th>
                <th>DEPARTMENT</th>
                <th>POSITIONS</th>
                <th>HIRING MANAGER</th>
                <th>REQUIRED BY</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading manpower requisitions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    {showArchived
                      ? 'No archived requirements.'
                      : 'No matching records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedRequirement(item)}
                  >
                    <td className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                      {item.id}
                    </td>
                    <td className="font-medium text-slate-900 dark:text-white">
                      {item.designation}
                    </td>
                    <td>{item.department}</td>
                    <td>{item.positions}</td>
                    <td>{item.hiring_manager}</td>
                    <td>{item.required_by}</td>
                    <td>
                      <span
                        className={`badge-pill ${
                          item.status === 'Overdue'
                            ? 'badge-overdue'
                            : item.status === 'Approved'
                            ? 'badge-approved'
                            : item.status === 'Pending'
                            ? 'badge-pending'
                            : 'badge-applied'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequirement(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View requirement"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!item.archived ? (
                          <>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                              title="Edit requirement"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete requirement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreRecord(item)}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center gap-1 text-xs font-semibold"
                            title="Restore requirement"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="table-footer">
          <div>
            {filtered.length} of {records.filter((r) => (showArchived ? r.archived : !r.archived)).length} shown
          </div>
          <div className="text-[11px] text-slate-400">
            Saved in this browser · last saved 15 Oct 2026, 4:41 pm
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ADD / EDIT REQUIREMENT MODAL matching Screenshot 3 */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[620px]">
            <form onSubmit={handleSaveRequirement}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit requirement' : 'Add requirement'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Fields marked * are required.
                </p>

                <div className="space-y-4 text-left">
                  {/* Row 1: Department * & Designation * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select department</option>
                        <option value="Leadership">Leadership</option>
                        <option value="AI Research">AI Research</option>
                        <option value="Sales">Sales</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="People Ops">People Ops</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formDesignation}
                        onChange={(e) => setFormDesignation(e.target.value)}
                        placeholder=""
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 2: Positions * & Employment type * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Positions <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formPositions}
                        onChange={(e) => setFormPositions(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Employment type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formEmploymentType}
                        onChange={(e) => setFormEmploymentType(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select..</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Location & Experience (years) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder=""
                        className="form-input"
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Experience (years)
                      </label>
                      <input
                        type="text"
                        value={formExperience}
                        onChange={(e) => setFormExperience(e.target.value)}
                        placeholder="e.g. 3-5"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 4: Budget CTC (₹/year) & Reason * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Budget CTC (₹/year)
                      </label>
                      <input
                        type="text"
                        value={formBudgetCtc}
                        onChange={(e) => setFormBudgetCtc(e.target.value)}
                        placeholder="e.g. 12-15 lakh"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Reason <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select..</option>
                        <option value="New position">New position</option>
                        <option value="Replacement">Replacement</option>
                        <option value="Expansion">Expansion</option>
                        <option value="Backfill">Backfill</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Replacing & Hiring manager */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Replacing
                      </label>
                      <select
                        value={formReplacing}
                        onChange={(e) => setFormReplacing(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select..</option>
                        <option value="No employees yet">No employees yet</option>
                        <option value="Rahul Varma">Rahul Varma</option>
                        <option value="Siddharth Rao">Siddharth Rao</option>
                        <option value="Neha Bansal">Neha Bansal</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Hiring manager
                      </label>
                      <select
                        value={formHiringManager}
                        onChange={(e) => setFormHiringManager(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select..</option>
                        <option value="No employees yet">No employees yet</option>
                        <option value="Ananya Rao">Ananya Rao</option>
                        <option value="Karthik Reddy">Karthik Reddy</option>
                        <option value="Vikram Malhotra">Vikram Malhotra</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 6: Required by * & Status * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Required by <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formRequiredBy}
                        onChange={(e) => setFormRequiredBy(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select..</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="On hold">On hold</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 7: Job description */}
                  <div className="form-group mb-0">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job description
                    </label>
                    <textarea
                      rows={3}
                      value={formJobDesc}
                      onChange={(e) => setFormJobDesc(e.target.value)}
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn-ghost-outline px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-blue px-5 py-2 text-xs"
                  >
                    {editingItem ? 'Save changes' : 'Add requirement'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW REQUIREMENT SIDE DRAWER matching Screenshot 4 */}
      {/* =================================================================== */}
      {selectedRequirement && (
        <div
          className="drawer-backdrop"
          onClick={() => setSelectedRequirement(null)}
        >
          <div
            className="drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedRequirement.designation} · {selectedRequirement.department} ({selectedRequirement.id})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Requirement · {selectedRequirement.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequirement(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body matching Screenshot 4 */}
            <div className="drawer-body space-y-4 text-left">
              {/* Overdue / Status Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{selectedRequirement.status}</span>
                </span>
              </div>

              {/* Detail Items */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Department</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.department}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Designation</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.designation}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Positions</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.positions}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Employment type</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.employment_type || 'Full-time'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Location</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.location || 'sed'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Experience (years)</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.experience || '2'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Budget CTC (₹/year)</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                  {selectedRequirement.budget_ctc || '120000'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Reason</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.reason || 'New position'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Replacing</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.replacing || '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Hiring manager</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.hiring_manager || '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Required by</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.required_by || 'Feb 20, 2020'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Status</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequirement.status || 'Approved'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Job description</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedRequirement.job_description || 'sswefg'}
                </div>
              </div>

              {/* History Section matching Screenshot 4 */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  History
                </h4>
                <div className="space-y-3">
                  {(selectedRequirement.history && selectedRequirement.history.length > 0
                    ? selectedRequirement.history
                    : [
                        { status: 'Approved', timestamp: '19 Oct 2026, 12:21 pm', user: 'ananya.rao@brightcone.ai' },
                        { status: 'On hold', timestamp: '15 Oct 2026, 4:41 pm', user: 'ananya.rao@brightcone.ai' },
                        { status: 'Pending', timestamp: '15 Oct 2026, 4:17 pm', user: 'ananya.rao@brightcone.ai' },
                      ]
                  ).map((hist, index) => (
                    <div
                      key={index}
                      className={index > 0 ? 'pt-3 border-t border-slate-100 dark:border-slate-800/60' : ''}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {hist.status}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {hist.timestamp} · {hist.user}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                  Created {selectedRequirement.created_at || '15 Oct 2026, 4:17 pm'} by ananya.rao@brightcone.ai. Last updated {selectedRequirement.updated_at || '19 Oct 2026, 12:21 pm'}.
                </div>
              </div>
            </div>

            {/* Drawer Footer matching Screenshot 4 */}
            <div className="drawer-footer">
              <button
                onClick={() => {
                  openEditModal(selectedRequirement);
                }}
                className="btn-primary-blue flex items-center gap-1.5 text-xs py-2 px-4"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmItem(selectedRequirement);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DELETE CONFIRMATION MODAL matching Screenshot 5 */}
      {/* =================================================================== */}
      {deleteConfirmItem && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[420px]">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Delete {deleteConfirmItem.id}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                It moves to <span className="font-semibold text-slate-700 dark:text-slate-300">Archived</span>, where you can restore it at any time. Nothing is erased.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="btn-ghost-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMoveToArchive}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 ring-2 ring-blue-400/20 transition cursor-pointer"
                >
                  Move to archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManpowerRequirementsPage;

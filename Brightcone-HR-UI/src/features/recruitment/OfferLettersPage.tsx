import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../../api/recruitment.api';
import { employeesApi } from '../../api/employees.api';
import { OfferLetter } from '../../types/recruitment.types';
import {
  Send,
  Plus,
  Download,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

export const OfferLettersPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferLetter[]>([
    {
      id: 'OFF-001',
      candidate_name: 'Siddharth Rao',
      designation: 'Full-Stack Developer',
      annual_ctc: '₹22,00,000',
      joining_date: 'Nov 15, 2026',
      valid_till: 'Oct 25, 2026',
      status: 'Draft',
      archived: true, // 1 archived matching Screenshot 5
      created_at: '15 Oct 2026, 11:00 am',
    },
  ]);
  const [candidateOptions, setCandidateOptions] = useState<{ id: string | number; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<OfferLetter | null>(null);
  const [editingItem, setEditingItem] = useState<OfferLetter | null>(null);

  // Form State
  const [formCandidate, setFormCandidate] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formAnnualCtc, setFormAnnualCtc] = useState('');
  const [formJoiningDate, setFormJoiningDate] = useState('');
  const [formOfferDate, setFormOfferDate] = useState('');
  const [formValidTill, setFormValidTill] = useState('');
  const [formApprovedBy, setFormApprovedBy] = useState('ananya.rao@brightcone.ai');
  const [formOfferLetterFile, setFormOfferLetterFile] = useState('—');
  const [formStatus, setFormStatus] = useState('');

  const loadData = async () => {
    try {
      const [backendOffers, cands, trackers] = await Promise.all([
        recruitmentApi.getOffers().catch(() => []),
        recruitmentApi.getCandidates().catch(() => []),
        employeesApi.getCandidateTrackers().catch(() => []),
      ]);

      if (backendOffers && backendOffers.length > 0) {
        setOffers(backendOffers);
      }

      const list: { id: string | number; name: string; role: string }[] = [];
      const names = new Set<string>();

      cands.forEach((c) => {
        if (!names.has(c.name)) {
          names.add(c.name);
          list.push({ id: c.id, name: c.name, role: c.job_title });
        }
      });

      trackers.forEach((t) => {
        if (!names.has(t.full_name)) {
          names.add(t.full_name);
          list.push({ id: t.id, name: t.full_name, role: t.applied_for });
        }
      });

      if (list.length === 0) {
        list.push(
          { id: '1', name: 'rohith (CAN-0001)', role: 'me' },
          { id: '2', name: 'Rahul Varma', role: 'Senior ML Engineer' },
          { id: '3', name: 'Siddharth Rao', role: 'Full-Stack Developer' },
          { id: '4', name: 'Neha Bansal', role: 'QA Automation Lead' },
          { id: '5', name: 'Aarav Sharma', role: 'AI Systems Architect' }
        );
      }
      setCandidateOptions(list);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'Pending approval':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'Declined':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Accepted':
        return 'bg-emerald-500';
      case 'Sent':
        return 'bg-blue-500';
      case 'Draft':
        return 'bg-slate-400';
      case 'Pending approval':
        return 'bg-amber-500';
      case 'Declined':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  const formatCtcDisplay = (val?: string) => {
    if (!val) return '—';
    if (val.startsWith('₹')) return val;
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return val;
    return '₹' + num.toLocaleString('en-IN');
  };

  const formatDateDisplay = (val?: string) => {
    if (!val || val === '—') return '—';
    if (val.includes('-') && val.length === 10) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return val;
  };

  const formatMetaDisplay = (val?: string) => {
    if (!val || val.trim() === '' || val === '—') return '—';
    return val;
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormCandidate('');
    setFormDesignation('');
    setFormDepartment('');
    setFormAnnualCtc('');
    setFormJoiningDate('');
    setFormOfferDate('');
    setFormValidTill('');
    setFormApprovedBy('ananya.rao@brightcone.ai');
    setFormOfferLetterFile('');
    setFormStatus('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: OfferLetter) => {
    setEditingItem(item);
    setFormCandidate(item.candidate_name);
    setFormDesignation(item.designation);
    setFormDepartment(item.department || 'emg');
    const rawCtc = item.annual_ctc ? item.annual_ctc.replace(/[^0-9]/g, '') : '';
    setFormAnnualCtc(rawCtc || item.annual_ctc || '');
    setFormJoiningDate(item.joining_date);
    setFormOfferDate(item.offer_date || item.joining_date || '');
    setFormValidTill(item.valid_till);
    setFormApprovedBy(
      item.approved_by && item.approved_by !== '—'
        ? item.approved_by
        : (item.status === 'Approved' ? 'ananya.rao@brightcone.ai' : 'ananya.rao@brightcone.ai')
    );
    setFormOfferLetterFile(item.offer_letter_file || '');
    setFormStatus(item.status);
    setSelectedOffer(null);
    setIsAddModalOpen(true);
  };

  const handleCandidateChange = (candName: string) => {
    setFormCandidate(candName);
    const found = candidateOptions.find((c) => c.name === candName);
    if (found && found.role) {
      setFormDesignation(found.role);
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCandidate.trim() || !formDesignation.trim()) return;

    const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

    const statusToUse = formStatus || (editingItem ? editingItem.status : 'Pending approval');
    const approvedByToUse = formApprovedBy && formApprovedBy !== '—' && formApprovedBy.trim() !== ''
      ? formApprovedBy.trim()
      : (statusToUse === 'Approved' ? 'ananya.rao@brightcone.ai' : 'ananya.rao@brightcone.ai');

    if (editingItem) {
      const historyList = [
        {
          status: statusToUse,
          timestamp: nowFormatted,
          user: 'ananya.rao@brightcone.ai',
        },
        ...(editingItem.history || []),
      ];

      const updated: OfferLetter = {
        ...editingItem,
        candidate_name: formCandidate,
        designation: formDesignation,
        department: formDepartment,
        annual_ctc: formAnnualCtc,
        joining_date: formJoiningDate,
        offer_date: formOfferDate || formJoiningDate,
        valid_till: formValidTill,
        approved_by: approvedByToUse,
        offer_letter_file: formOfferLetterFile,
        status: statusToUse,
        updated_at: nowFormatted,
        history: historyList,
      };

      setOffers((prev) => prev.map((o) => (o.id === editingItem.id ? updated : o)));
      if (selectedOffer?.id === editingItem.id) {
        setSelectedOffer(updated);
      }

      try {
        await recruitmentApi.updateOffer(editingItem.id, updated);
      } catch {
        // local state is updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Offer letter for "${formCandidate}" updated!`);
      setTimeout(() => setToastMessage(null), 3500);
      loadData();
    } else {
      const newId = `OF-${String(offers.length + 1).padStart(4, '0')}`;
      const newOffer: OfferLetter = {
        id: newId,
        candidate_name: formCandidate,
        designation: formDesignation,
        department: formDepartment,
        annual_ctc: formAnnualCtc,
        joining_date: formJoiningDate,
        offer_date: formOfferDate || formJoiningDate,
        valid_till: formValidTill,
        approved_by: approvedByToUse,
        offer_letter_file: formOfferLetterFile || '—',
        status: statusToUse,
        archived: false,
        created_at: nowFormatted,
        updated_at: nowFormatted,
        history: [
          {
            status: statusToUse,
            timestamp: nowFormatted,
            user: 'ananya.rao@brightcone.ai',
          },
        ],
      };

      setOffers((prev) => [newOffer, ...prev]);

      try {
        await recruitmentApi.createOffer(newOffer);
      } catch {
        // local state is updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Offer letter ${newId} created for "${formCandidate}"!`);
      setTimeout(() => setToastMessage(null), 3500);
      loadData();
    }
  };

  const handleMoveToArchive = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;

    setOffers((prev) =>
      prev.map((o) => (o.id === targetId ? { ...o, archived: true } : o))
    );

    if (selectedOffer?.id === targetId) {
      setSelectedOffer(null);
    }
    setDeleteConfirmItem(null);

    setToastMessage(`Offer ${targetId} moved to Archived.`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await recruitmentApi.deleteOffer(targetId);
    } catch {
      // local state handles archiving
    }
  };

  const handleRestoreRecord = (item: OfferLetter) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === item.id ? { ...o, archived: false } : o))
    );
    setToastMessage(`Restored offer ${item.id} from archive.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Candidate', 'Designation', 'Annual CTC', 'Joining Date', 'Valid Till', 'Status'];
    const rows = offers
      .filter((o) => !o.archived)
      .map((o) => [
        o.id,
        `"${o.candidate_name}"`,
        `"${o.designation}"`,
        `"${o.annual_ctc}"`,
        `"${o.joining_date}"`,
        `"${o.valid_till}"`,
        o.status,
      ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'offer_letters_brightcone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations matching Screenshot 5
  const archivedCount = offers.filter((o) => o.archived).length;
  const activeOffers = offers.filter((o) => (showArchived ? o.archived : !o.archived));

  const filtered = activeOffers.filter((o) => {
    const matchSearch =
      o.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalActive = offers.filter((o) => !o.archived).length;
  const pendingApprovalCount = offers.filter((o) => !o.archived && o.status === 'Pending approval').length;
  const sentCount = offers.filter((o) => !o.archived && o.status === 'Sent').length;
  const acceptedCount = offers.filter((o) => !o.archived && o.status === 'Accepted').length;

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="page-badge page-badge-recruit">
            <span className="page-badge-dot" />
            <span>RECRUIT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Offer letters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Offers from draft to acceptance. Overdue when the offer passes its valid-till date unanswered.
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
            <span>Add offer</span>
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
              <Send className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalActive}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{archivedCount} archived</div>
          </div>
        </div>

        {/* Pending approval */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pending approval</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pendingApprovalCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Sent */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sent</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{sentCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Accepted */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Accepted</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{acceptedCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>
      </div>

      {/* Data Table Card with Search & Filters toolbar matching Screenshot 5 */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search offer letters"
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
              <option value="Pending approval">Pending approval</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Draft">Draft</option>
              <option value="Overdue">Overdue</option>
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

        {/* Enterprise Data Table matching Screenshot 5 */}
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CANDIDATE</th>
                <th>DESIGNATION</th>
                <th>ANNUAL CTC (₹)</th>
                <th>JOINING DATE</th>
                <th>VALID TILL</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Loading offer letters...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                /* Empty state matching Screenshot 5 */
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-sm">
                        <Send className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {showArchived
                          ? 'No archived offer letters.'
                          : (
                            <>
                              No offer letters yet. Use{' '}
                              <button
                                onClick={openAddModal}
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                Add offer
                              </button>{' '}
                              to create the first one.
                            </>
                          )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedOffer(item)}
                  >
                    <td className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                      {item.id}
                    </td>
                    <td className="font-semibold text-slate-900 dark:text-white">
                      {item.candidate_name}
                    </td>
                    <td>{item.designation}</td>
                    <td className="font-mono text-xs font-semibold">{item.annual_ctc}</td>
                    <td>{item.joining_date}</td>
                    <td>{item.valid_till}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(item.status)}`} />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOffer(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View offer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!item.archived ? (
                          <>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                              title="Edit offer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete offer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreRecord(item)}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center gap-1 text-xs font-semibold"
                            title="Restore offer"
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

        {/* Footer info matching Screenshot 5 */}
        <div className="table-footer">
          <div>
            {filtered.length} of {offers.filter((o) => (showArchived ? o.archived : !o.archived)).length} shown
          </div>
          <div className="text-[11px] text-slate-400">
            Saved in this browser · last saved 19 Oct 2026, 1:38 pm
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ADD / EDIT OFFER MODAL matching Screenshot 2 */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[560px] p-6 sm:p-7">
            <form onSubmit={handleSaveOffer}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingItem ? 'Edit offer' : 'Add offer'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {editingItem
                    ? `${editingItem.id} · last updated ${editingItem.updated_at || editingItem.created_at || '21 Oct 2026, 12:59 pm'}`
                    : 'Create a new offer letter'}
                </p>
              </div>

              <div className="space-y-4 text-left">
                {/* Candidate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Candidate <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCandidate}
                    onChange={(e) => handleCandidateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select...</option>
                    {candidateOptions.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Annual CTC (₹) & Joining date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Annual CTC (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formAnnualCtc}
                      onChange={(e) => setFormAnnualCtc(e.target.value)}
                      placeholder="2032020"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Joining date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Offer date & Valid till */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Offer date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formOfferDate}
                      onChange={(e) => setFormOfferDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Valid till <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formValidTill}
                      onChange={(e) => setFormValidTill(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Approved by & Offer letter file */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Approved by
                    </label>
                    <select
                      value={formApprovedBy}
                      onChange={(e) => setFormApprovedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="ananya.rao@brightcone.ai">ananya.rao@brightcone.ai (People Ops Lead)</option>
                      <option value="Naresh Vemparala">Naresh Vemparala (Founder & CEO)</option>
                      <option value="Priya Menon">Priya Menon (Engineering Manager)</option>
                      <option value="Rahul Varma">Rahul Varma (Lead)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Offer letter file
                    </label>
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-slate-900">
                      <input
                        type="file"
                        id="offer_file_upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormOfferLetterFile(file.name);
                        }}
                      />
                      <label
                        htmlFor="offer_file_upload"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-md cursor-pointer border border-slate-300 dark:border-slate-600 font-medium transition"
                      >
                        Choose File
                      </label>
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                        {formOfferLetterFile && formOfferLetterFile !== '—' ? formOfferLetterFile : 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown - Exact options requested */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden transition"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending approval">Pending approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW OFFER DRAWER matching Screenshot 1 */}
      {/* =================================================================== */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0E1833] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-6">
              {/* Top Row: Icon + Close button */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-xs">
                  <Send className="w-6 h-6 text-slate-800 dark:text-slate-200 -rotate-12 translate-x-0.5" />
                </div>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header Title */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedOffer.id}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Offer · {selectedOffer.id}
                </p>
              </div>

              {/* Status Badge Pill */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(selectedOffer.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDotClass(selectedOffer.status)}`} />
                  <span>{selectedOffer.status}</span>
                </span>
              </div>

              {/* Fields List matching Screenshot 1 */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Candidate</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedOffer.candidate_name}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Designation</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedOffer.designation}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Department</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedOffer.department || 'emg'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Annual CTC (₹)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatCtcDisplay(selectedOffer.annual_ctc)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Joining date</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDateDisplay(selectedOffer.joining_date)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Offer date</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDateDisplay(selectedOffer.offer_date || selectedOffer.joining_date)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Valid till</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDateDisplay(selectedOffer.valid_till)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Approved by</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedOffer.approved_by && selectedOffer.approved_by !== '—' && selectedOffer.approved_by.trim() !== ''
                      ? selectedOffer.approved_by
                      : (selectedOffer.status === 'Approved' ? 'ananya.rao@brightcone.ai' : '—')}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Offer letter file</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {formatMetaDisplay(selectedOffer.offer_letter_file)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Status</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedOffer.status}
                  </div>
                </div>

                {/* History Section matching Screenshot 1 */}
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    History
                  </h4>
                  {selectedOffer.history && selectedOffer.history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOffer.history.map((h, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {h.status}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            {h.timestamp} · {h.user}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {selectedOffer.status}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {selectedOffer.created_at || '21 Oct 2026, 12:59 pm'} · ananya.rao@brightcone.ai
                      </div>
                    </div>
                  )}
                </div>

                {/* Creation & Update note */}
                <div className="pt-4 text-[11px] text-slate-400 leading-relaxed">
                  Created {selectedOffer.created_at || '21 Oct 2026, 12:59 pm'} by ananya.rao@brightcone.ai. Last updated {selectedOffer.updated_at || selectedOffer.created_at || '21 Oct 2026, 12:59 pm'}.
                </div>
              </div>
            </div>

            {/* Bottom Actions matching Screenshot 1 */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-[#0E1833]">
              <button
                onClick={() => openEditModal(selectedOffer)}
                className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white flex items-center gap-2 text-xs font-semibold py-2.5 px-6 rounded-xl shadow-md cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirmItem(selectedOffer)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
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

export default OfferLettersPage;

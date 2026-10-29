import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../../api/recruitment.api';
import { employeesApi } from '../../api/employees.api';
import { Candidate, Interview } from '../../types/recruitment.types';
import { CandidateTracker } from '../../types/employee.types';
import {
  Calendar,
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

export const InterviewSchedulingPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateTrackers, setCandidateTrackers] = useState<CandidateTracker[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Interview | null>(null);
  const [editingItem, setEditingItem] = useState<Interview | null>(null);

  // Form State matching Screenshots 2, 3, 4
  const [formCandidate, setFormCandidate] = useState('');
  const [formRound, setFormRound] = useState('');
  const [formMode, setFormMode] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formInterviewer, setFormInterviewer] = useState('');
  const [formVenueLink, setFormVenueLink] = useState('');
  const [formRating, setFormRating] = useState('');
  const [formResult, setFormResult] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [formStatus, setFormStatus] = useState('');

const INT_HISTORY_KEY = 'brightcone_int_history_v3';

const getStoredInterviewHistory = (
  id: number,
  status: string,
  createdAt?: string,
  updatedAt?: string
) => {
  try {
    const raw = localStorage.getItem(INT_HISTORY_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map[id] && Array.isArray(map[id]) && map[id].length > 0) {
        return map[id];
      }
    }
  } catch {}

  return [
    {
      status: status || 'Scheduled',
      timestamp: updatedAt || '19 Oct 2026, 3:53 pm',
      user: 'ananya.rao@brightcone.ai',
    },
    {
      status: 'Scheduled',
      timestamp: createdAt || '19 Oct 2026, 1:38 pm',
      user: 'ananya.rao@brightcone.ai',
    },
  ];
};

const saveInterviewHistory = (id: number, history: any[]) => {
  try {
    const raw = localStorage.getItem(INT_HISTORY_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[id] = history;
    localStorage.setItem(INT_HISTORY_KEY, JSON.stringify(map));
  } catch {}
};

  const loadData = async () => {
    try {
      const [intvs, cands, trackers] = await Promise.all([
        recruitmentApi.getInterviews().catch(() => []),
        recruitmentApi.getCandidates().catch(() => []),
        employeesApi.getCandidateTrackers().catch(() => []),
      ]);
      const enriched = intvs.map((i) => ({
        ...i,
        history: i.history && i.history.length > 0
          ? i.history
          : getStoredInterviewHistory(i.id, i.status, i.created_at, i.updated_at),
      }));
      setInterviews(enriched);
      setCandidates(cands);
      setCandidateTrackers(trackers);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Consolidate candidate list from both candidates & candidateTrackers
  const allCandidateOptions = React.useMemo(() => {
    const names = new Set<string>();
    const list: { id: string | number; name: string; role: string; email: string }[] = [];

    candidates.forEach((c) => {
      if (!names.has(c.name)) {
        names.add(c.name);
        list.push({ id: c.id, name: c.name, role: c.job_title, email: c.email });
      }
    });

    candidateTrackers.forEach((t) => {
      if (!names.has(t.full_name)) {
        names.add(t.full_name);
        list.push({ id: t.id, name: t.full_name, role: t.applied_for, email: t.email });
      }
    });

    if (list.length === 0) {
      list.push(
        { id: '1', name: 'Rahul Varma', role: 'Senior ML Engineer', email: 'rahul.varma@brightcone.ai' },
        { id: '2', name: 'Siddharth Rao', role: 'Full-Stack Developer', email: 'siddharth.rao@example.com' },
        { id: '3', name: 'Neha Bansal', role: 'QA Automation Lead', email: 'neha.bansal@example.com' },
        { id: '4', name: 'Aarav Sharma', role: 'AI Systems Architect', email: 'aarav.sharma@example.com' }
      );
    }
    return list;
  }, [candidates, candidateTrackers]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormCandidate('');
    setFormRound('');
    setFormMode('');
    setFormDate('');
    setFormTime('');
    setFormInterviewer('');
    setFormVenueLink('');
    setFormRating('');
    setFormResult('');
    setFormFeedback('');
    setFormStatus('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: Interview) => {
    setEditingItem(item);
    setFormCandidate(item.candidate_name || '');
    setFormRound(item.round || '');
    setFormMode(item.mode || '');
    setFormDate(item.interview_date || '');
    setFormTime(item.time || '');
    setFormInterviewer(item.interviewer || '');
    setFormVenueLink(item.venue_link || '');
    setFormRating(item.rating ? String(item.rating) : '');
    setFormResult(item.result || '');
    setFormFeedback(item.feedback || item.notes || '');
    setFormStatus(item.status || 'Scheduled');
    setIsAddModalOpen(true);
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCandidate.trim() || !formDate.trim() || !formTime.trim()) {
      alert('Please fill all required fields marked *');
      return;
    }

    const candObj = allCandidateOptions.find((c) => c.name === formCandidate);
    const nowFormatted = `${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    if (editingItem) {
      const currentHistory = editingItem.history && editingItem.history.length > 0
        ? [...editingItem.history]
        : [
            { status: editingItem.status || 'Scheduled', timestamp: editingItem.created_at || nowFormatted, user: 'ananya.rao@brightcone.ai' }
          ];

      const statusToUse = formStatus || editingItem.status || 'Scheduled';
      let entryTitle = statusToUse;
      if (formStatus && formStatus !== editingItem.status) {
        entryTitle = formStatus;
      } else if (formDate !== editingItem.interview_date || formTime !== editingItem.time) {
        entryTitle = `Rescheduled: ${formDate} (${formTime})`;
      } else if (formRound !== editingItem.round) {
        entryTitle = `Round updated: ${formRound}`;
      } else if (formResult && formResult !== editingItem.result) {
        entryTitle = `Result: ${formResult}`;
      } else if (formInterviewer !== editingItem.interviewer) {
        entryTitle = `Interviewer: ${formInterviewer}`;
      } else {
        entryTitle = `${statusToUse} (Updated)`;
      }

      currentHistory.unshift({
        status: entryTitle,
        timestamp: nowFormatted,
        user: 'ananya.rao@brightcone.ai',
      });

      const updated: Interview = {
        ...editingItem,
        candidate_name: formCandidate,
        round: formRound || 'Technical 1',
        mode: formMode || 'Video call',
        interview_date: formDate,
        time: formTime,
        interviewer: formInterviewer,
        venue_link: formVenueLink,
        rating: formRating ? parseInt(formRating) : undefined,
        result: formResult || 'Pending',
        feedback: formFeedback,
        notes: formFeedback,
        status: formStatus || 'Scheduled',
        updated_at: nowFormatted,
        history: currentHistory,
      };

      saveInterviewHistory(editingItem.id, currentHistory);
      setInterviews((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      if (selectedInterview?.id === editingItem.id) {
        setSelectedInterview(updated);
      }

      try {
        await recruitmentApi.updateInterview(editingItem.id, updated);
      } catch {
        // local state is updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Interview for "${formCandidate}" updated successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      const newInterview: Interview = {
        id: interviews.length + 1,
        candidate_id: typeof candObj?.id === 'number' ? candObj.id : 1,
        candidate_name: formCandidate,
        candidate_email: candObj?.email || `${formCandidate.toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
        job_title: candObj?.role || 'Senior Engineer',
        round: formRound || 'Technical 1',
        mode: formMode || 'Video call',
        interview_date: formDate,
        time: formTime,
        interviewer: formInterviewer,
        venue_link: formVenueLink,
        rating: formRating ? parseInt(formRating) : undefined,
        result: formResult || 'Pending',
        feedback: formFeedback,
        notes: formFeedback,
        status: formStatus || 'Scheduled',
        archived: false,
        created_at: nowFormatted,
        updated_at: nowFormatted,
        history: [
          { status: formStatus || 'Scheduled', timestamp: nowFormatted, user: 'ananya.rao@brightcone.ai' },
        ],
      };

      saveInterviewHistory(newInterview.id, newInterview.history || []);
      setInterviews((prev) => [newInterview, ...prev]);

      try {
        await recruitmentApi.scheduleInterview({
          candidate_id: newInterview.candidate_id,
          candidate_name: newInterview.candidate_name,
          interview_date: formDate,
          interviewer: formInterviewer,
          interview_type: formRound || 'Technical Screening',
          round: formRound,
          mode: formMode,
          time: formTime,
          venue_link: formVenueLink,
          rating: formRating ? parseInt(formRating) : undefined,
          result: formResult,
          feedback: formFeedback,
          notes: formFeedback,
          status: formStatus,
          created_at: nowFormatted,
          updated_at: nowFormatted,
          history: newInterview.history,
        });
      } catch {
        // local state is updated
      }

      setIsAddModalOpen(false);
      setToastMessage(`Interview for "${formCandidate}" scheduled successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleMoveToArchive = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;
    const nowFormatted = `${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    const currentHistory = deleteConfirmItem.history && deleteConfirmItem.history.length > 0
      ? [...deleteConfirmItem.history]
      : [];
    currentHistory.unshift({
      status: 'Archived',
      timestamp: nowFormatted,
      user: 'ananya.rao@brightcone.ai',
    });
    saveInterviewHistory(targetId, currentHistory);

    setInterviews((prev) =>
      prev.map((i) => (i.id === targetId ? { ...i, archived: true, history: currentHistory } : i))
    );

    if (selectedInterview?.id === targetId) {
      setSelectedInterview(null);
    }
    setDeleteConfirmItem(null);

    setToastMessage(`Interview #${targetId} moved to Archived.`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await recruitmentApi.deleteInterview(targetId);
    } catch {
      // local state handles archiving
    }
  };

  const handleRestoreRecord = (item: Interview) => {
    const nowFormatted = `${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    const currentHistory = item.history && item.history.length > 0
      ? [...item.history]
      : [];
    currentHistory.unshift({
      status: 'Restored',
      timestamp: nowFormatted,
      user: 'ananya.rao@brightcone.ai',
    });
    saveInterviewHistory(item.id, currentHistory);

    setInterviews((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, archived: false, history: currentHistory } : i))
    );
    setToastMessage(`Restored interview #${item.id} from archive.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['Candidate', 'Round', 'Mode', 'Date', 'Time', 'Interviewer', 'Result', 'Status'];
    const rows = interviews
      .filter((i) => !i.archived)
      .map((i) => [
        `"${i.candidate_name}"`,
        `"${i.round || i.interview_type || 'Technical'}"`,
        `"${i.mode || 'Video call'}"`,
        `"${i.interview_date}"`,
        `"${i.time || '11:00 AM'}"`,
        `"${i.interviewer}"`,
        `"${i.result || 'Pending'}"`,
        `"${i.status}"`,
      ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'interviews_brightcone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations
  const archivedCount = interviews.filter((i) => i.archived).length;
  const activeInterviews = interviews.filter((i) => (showArchived ? i.archived : !i.archived));

  const filtered = activeInterviews.filter((i) => {
    const matchSearch =
      i.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.round && i.round.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const scheduledCount = interviews.filter((i) => !i.archived && i.status === 'Scheduled').length;
  const completedCount = interviews.filter((i) => !i.archived && i.status === 'Completed').length;
  const rescheduledCount = interviews.filter((i) => !i.archived && i.status === 'Rescheduled').length;

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="page-badge page-badge-recruit">
            <span className="page-badge-dot" />
            <span>RECRUIT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interview scheduling
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interview rounds with panel, time, feedback and result.
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
            <span>Add interview</span>
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
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{interviews.filter((i) => !i.archived).length}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live records</div>
          </div>
        </div>

        {/* Scheduled */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Scheduled</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{scheduledCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Completed */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completed</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{completedCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Rescheduled */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Rescheduled</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{rescheduledCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>
      </div>

      {/* Data Table Card with Search & Filters Toolbar */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input matching Screenshot 1 */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search interview scheduling"
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
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
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

        {/* Enterprise Data Table matching Screenshot 1 */}
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>ROUND</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>INTERVIEWER</th>
                <th>RESULT</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Loading interview scheduling...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                /* Empty state matching Screenshot 1 */
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {showArchived
                          ? 'No archived interviews.'
                          : (
                            <>
                              No interview scheduling yet. Use{' '}
                              <button
                                onClick={openAddModal}
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                Add interview
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
                    onClick={() => setSelectedInterview(item)}
                  >
                    <td className="font-semibold text-slate-900 dark:text-white">
                      <div>{item.candidate_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.job_title}</div>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.round || item.interview_type || 'Technical'}
                      </span>
                      {item.mode && (
                        <span className="text-[10px] text-slate-400 block">{item.mode}</span>
                      )}
                    </td>
                    <td>{item.interview_date}</td>
                    <td>{item.time || '11:00 AM'}</td>
                    <td>{item.interviewer}</td>
                    <td>
                      <span
                        className={`badge-pill ${
                          item.result === 'Pass'
                            ? 'badge-approved'
                            : item.result === 'Fail'
                            ? 'badge-overdue'
                            : item.result === 'On hold'
                            ? 'badge-pending'
                            : 'badge-applied'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{item.result || 'Pending'}</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          item.status === 'Completed'
                            ? 'badge-approved'
                            : item.status === 'Scheduled'
                            ? 'badge-applied'
                            : item.status === 'Rescheduled'
                            ? 'badge-pending'
                            : 'badge-overdue'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInterview(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View interview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!item.archived ? (
                          <>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                              title="Edit interview"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete interview"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreRecord(item)}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center gap-1 text-xs font-semibold"
                            title="Restore interview"
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

        {/* Footer info matching Screenshot 1 */}
        <div className="table-footer">
          <div>
            {filtered.length} of {interviews.filter((i) => (showArchived ? i.archived : !i.archived)).length} shown
          </div>
          <div className="text-[11px] text-slate-400">
            Saved in this browser · last saved 19 Oct 2026, 12:47 pm
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ADD / EDIT INTERVIEW MODAL matching Screenshots 2, 3, 4 */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[580px]">
            <form onSubmit={handleSaveInterview}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit interview' : 'Add interview'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  Fields marked * are required.
                </p>

                <div className="space-y-4 text-left">
                  {/* Candidate Dropdown - populated from previously uploaded candidates! */}
                  <div className="form-group mb-0">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Candidate <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCandidate}
                      onChange={(e) => setFormCandidate(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Select...</option>
                      {allCandidateOptions.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Round & Mode (Dropdown matching Screenshots 3 & 4) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Round <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formRound}
                        onChange={(e) => setFormRound(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="HR screening">HR screening</option>
                        <option value="Technical 1">Technical 1</option>
                        <option value="Technical 2">Technical 2</option>
                        <option value="Managerial">Managerial</option>
                        <option value="Final / founder">Final / founder</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Mode <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formMode}
                        onChange={(e) => setFormMode(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="In person">In person</option>
                        <option value="Video call">Video call</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Interviewer & Venue or meeting link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Interviewer
                      </label>
                      <select
                        value={formInterviewer}
                        onChange={(e) => setFormInterviewer(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select interviewer...</option>
                        <option value="No employees yet">No employees yet</option>
                        <option value="Ananya Rao">Ananya Rao</option>
                        <option value="Vikram Malhotra">Vikram Malhotra</option>
                        <option value="Karthik Reddy">Karthik Reddy</option>
                        <option value="Daniel Brooks">Daniel Brooks</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Venue or meeting link
                      </label>
                      <input
                        type="text"
                        value={formVenueLink}
                        onChange={(e) => setFormVenueLink(e.target.value)}
                        placeholder="e.g. Google Meet or Room 302"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Rating (1-5) & Result */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Rating (1–5)
                      </label>
                      <select
                        value={formRating}
                        onChange={(e) => setFormRating(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        <option value="1">1 - Needs improvement</option>
                        <option value="2">2 - Basic</option>
                        <option value="3">3 - Competent</option>
                        <option value="4">4 - Strong</option>
                        <option value="5">5 - Exceptional</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Result
                      </label>
                      <select
                        value={formResult}
                        onChange={(e) => setFormResult(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="On hold">On hold</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="form-group mb-0">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={formFeedback}
                      onChange={(e) => setFormFeedback(e.target.value)}
                      placeholder="Candidate evaluation notes..."
                      className="form-textarea"
                    />
                  </div>

                  {/* Status */}
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
                      <option value="">Select status...</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
                    {editingItem ? 'Save changes' : 'Add interview'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW INTERVIEW SIDE DRAWER */}
      {/* =================================================================== */}
      {selectedInterview && (
        <div
          className="drawer-backdrop"
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className="drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                  <Calendar className="w-6 h-6 text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    INT-{String(selectedInterview.id).padStart(4, '0')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Interview · INT-{String(selectedInterview.id).padStart(4, '0')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInterview(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="drawer-body space-y-4 text-left">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedInterview.status === 'Completed'
                    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40'
                    : selectedInterview.status === 'Scheduled'
                    ? 'text-sky-700 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40'
                    : selectedInterview.status === 'Cancelled'
                    ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40'
                    : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedInterview.status === 'Completed' ? 'bg-emerald-500' : selectedInterview.status === 'Scheduled' ? 'bg-sky-500' : 'bg-rose-500'
                  }`} />
                  <span>{selectedInterview.status || 'Scheduled'}</span>
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Candidate</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.candidate_name} (CAN-{String(selectedInterview.candidate_id || 1).padStart(4, '0')})
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Round</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.round || selectedInterview.interview_type || 'Technical 1'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Mode</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.mode || 'Video call'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Date</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.formatted_date || selectedInterview.interview_date || 'Mar 20, 2000'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Time</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.time || '10:10'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Interviewer</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.interviewer || '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Venue or meeting link</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 break-all">
                  {selectedInterview.venue_link || '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Rating (1–5)</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.rating ? selectedInterview.rating : '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Result</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.result || 'Pending'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Feedback</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.feedback || selectedInterview.notes || '—'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Status</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInterview.status || 'Scheduled'}
                </div>
              </div>

              {/* History Section matching Screenshot 3 */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  History
                </h4>
                <div className="space-y-3">
                  {((selectedInterview.history && selectedInterview.history.length > 0)
                    ? selectedInterview.history
                    : [
                        { status: selectedInterview.status || 'Completed', timestamp: selectedInterview.updated_at || '19 Oct 2026, 1:38 pm', user: 'ananya.rao@brightcone.ai' },
                        { status: 'Scheduled', timestamp: selectedInterview.created_at || '19 Oct 2026, 1:38 pm', user: 'ananya.rao@brightcone.ai' },
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
                  Created {selectedInterview.created_at || '19 Oct 2026, 1:38 pm'} by ananya.rao@brightcone.ai. Last updated {selectedInterview.updated_at || '19 Oct 2026, 3:53 pm'}.
                </div>
              </div>
            </div>

            <div className="drawer-footer flex items-center justify-start gap-3">
              <button
                onClick={() => openEditModal(selectedInterview)}
                className="btn-primary-blue flex items-center gap-1.5 text-xs py-2 px-5 cursor-pointer shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirmItem(selectedInterview)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
                Delete interview for {deleteConfirmItem.candidate_name}?
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

export default InterviewSchedulingPage;

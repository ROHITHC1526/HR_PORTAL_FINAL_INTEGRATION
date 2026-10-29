import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '../../api/employees.api';
import { recruitmentApi } from '../../api/recruitment.api';
import { CandidateTracker, CandidateHistoryItem, ManpowerRequirement } from '../../types/employee.types';
import { Job } from '../../types/recruitment.types';
import {
  Users,
  User,
  Plus,
  Download,
  Search,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  X,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

export const CandidateTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateTracker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [manpower, setManpower] = useState<ManpowerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  // Modals & Flyout State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateTracker | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateTracker | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete & Archive Confirmation Modal State
  const [deleteModalCandidate, setDeleteModalCandidate] = useState<CandidateTracker | null>(null);
  const [deleteModalMode, setDeleteModalMode] = useState<'archive' | 'permanent'>('archive');

  // Form State for Add / Edit Candidate (matching Image 2)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [appliedFor, setAppliedFor] = useState('');
  const [source, setSource] = useState('');
  const [totalExperience, setTotalExperience] = useState<number | ''>('');
  const [currentCtc, setCurrentCtc] = useState<number | ''>('');
  const [expectedCtc, setExpectedCtc] = useState<number | ''>('');
  const [noticePeriod, setNoticePeriod] = useState<number | ''>('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [consentToStoreData, setConsentToStoreData] = useState('');
  const [stage, setStage] = useState('');

const CAND_HISTORY_KEY = 'brightcone_cand_history_v3';

const getStoredCandidateHistory = (
  id: string,
  currentStage: string,
  createdAt?: string,
  updatedAt?: string
): CandidateHistoryItem[] => {
  try {
    const raw = localStorage.getItem(CAND_HISTORY_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map[id] && Array.isArray(map[id]) && map[id].length > 0) {
        return map[id];
      }
    }
  } catch {}

  const list: CandidateHistoryItem[] = [];
  if (currentStage && currentStage !== 'Applied') {
    list.push({
      stage: currentStage,
      timestamp: updatedAt || '19 Oct 2026, 3:51 pm',
      user: 'ananya.rao@brightcone.ai',
    });
  }
  list.push({
    stage: 'Applied',
    timestamp: createdAt || '19 Oct 2026, 12:43 pm',
    user: 'ananya.rao@brightcone.ai',
  });
  return list;
};

const saveCandidateHistory = (id: string, history: CandidateHistoryItem[]) => {
  try {
    const raw = localStorage.getItem(CAND_HISTORY_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[id] = history;
    localStorage.setItem(CAND_HISTORY_KEY, JSON.stringify(map));
  } catch {}
};

  const fetchCandidates = async () => {
    try {
      const data = await employeesApi.getCandidateTrackers();
      const enriched = data.map((c) => ({
        ...c,
        history: c.history && c.history.length > 0
          ? c.history
          : getStoredCandidateHistory(c.id, c.stage, c.created_at, c.updated_at),
      }));
      setCandidates(enriched);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchJobsAndRequisitions = async () => {
    try {
      const [jobsData, manpowerData] = await Promise.all([
        recruitmentApi.getJobs().catch(() => []),
        employeesApi.getManpower().catch(() => []),
      ]);
      setJobs(jobsData);
      setManpower(manpowerData);
    } catch (err) {
      console.error('Failed to load jobs/requisitions:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobsAndRequisitions();
  }, []);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setAppliedFor('');
    setSource('');
    setTotalExperience('');
    setCurrentCtc('');
    setExpectedCtc('');
    setNoticePeriod('');
    setCurrentLocation('');
    setResumeName('');
    setConsentToStoreData('');
    setStage('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cand: CandidateTracker) => {
    setEditingCandidate(cand);
    setFullName(cand.full_name);
    setEmail(cand.email);
    setPhone(cand.phone);
    setAppliedFor(cand.applied_for);
    setSource(cand.source);
    setTotalExperience(cand.total_experience);
    setCurrentCtc(cand.current_ctc || '');
    setExpectedCtc(cand.expected_ctc || '');
    setNoticePeriod(cand.notice_period || '');
    setCurrentLocation(cand.current_location || '');
    setResumeName(cand.resume && cand.resume !== '—' ? cand.resume : '');
    setConsentToStoreData(cand.consent_to_store_data || 'Yes');
    setStage(cand.stage);
    setIsEditModalOpen(true);
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill in all required fields (Full name, Email, Phone).');
      return;
    }
    if (!source) {
      alert('Please select a Source.');
      return;
    }
    if (!consentToStoreData) {
      alert('Please select Consent to store data.');
      return;
    }
    if (!stage) {
      alert('Please select a Stage.');
      return;
    }

    try {
      await employeesApi.createCandidateTracker({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        applied_for: appliedFor.trim() || (jobs[0]?.title ?? 'General Candidate'),
        source: source || 'LinkedIn',
        total_experience: Number(totalExperience) || 0,
        current_ctc: Number(currentCtc) || 0,
        expected_ctc: Number(expectedCtc) || 0,
        notice_period: Number(noticePeriod) || 0,
        current_location: currentLocation.trim() || '—',
        resume: resumeName || '—',
        consent_to_store_data: consentToStoreData || 'Yes',
        stage: stage || 'Applied',
        archived: false,
      });
      setIsAddModalOpen(false);
      resetForm();
      setToastMessage(`Candidate "${fullName}" added to tracker and saved to Database!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCandidates();
    } catch (err) {
      alert('Failed to add candidate: ' + err);
    }
  };

  const handleSaveEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

      const newStage = stage || editingCandidate.stage;
      const prevHistory = editingCandidate.history && editingCandidate.history.length > 0
        ? editingCandidate.history
        : [
            ...(editingCandidate.stage !== 'Applied'
              ? [{
                  stage: editingCandidate.stage,
                  timestamp: editingCandidate.updated_at || '19 Oct 2026, 12:43 pm',
                  user: 'ananya.rao@brightcone.ai',
                }]
              : []),
            {
              stage: 'Applied',
              timestamp: editingCandidate.created_at || '19 Oct 2026, 12:43 pm',
              user: 'ananya.rao@brightcone.ai',
            },
          ];

      const historyTitle = newStage !== editingCandidate.stage
        ? newStage
        : `${newStage} · Details updated`;

      const historyList = [
        {
          stage: historyTitle,
          timestamp: nowFormatted,
          user: 'ananya.rao@brightcone.ai',
        },
        ...prevHistory,
      ];
      saveCandidateHistory(editingCandidate.id, historyList);

      const updated: CandidateTracker = {
        ...editingCandidate,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        applied_for: appliedFor.trim(),
        source: source || editingCandidate.source,
        total_experience: Number(totalExperience) || 0,
        current_ctc: Number(currentCtc) || 0,
        expected_ctc: Number(expectedCtc) || 0,
        notice_period: Number(noticePeriod) || 0,
        current_location: currentLocation.trim(),
        resume: resumeName || '—',
        consent_to_store_data: consentToStoreData || 'Yes',
        stage: newStage,
        updated_at: nowFormatted,
        history: historyList,
      };

      await employeesApi.updateCandidateTracker(editingCandidate.id, updated);
      setIsEditModalOpen(false);
      setEditingCandidate(null);
      if (selectedCandidate?.id === editingCandidate.id) {
        setSelectedCandidate(updated);
      }
      setToastMessage(`Candidate "${fullName}" updated successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCandidates();
    } catch (err) {
      alert('Failed to update candidate: ' + err);
    }
  };

  const openArchiveModal = (cand: CandidateTracker) => {
    setDeleteModalCandidate(cand);
    setDeleteModalMode('archive');
  };

  const openPermanentDeleteModal = (cand: CandidateTracker) => {
    setDeleteModalCandidate(cand);
    setDeleteModalMode('permanent');
  };

  // Move to Archive (Soft delete / Cancel)
  const handleArchiveCandidate = async (cand: CandidateTracker) => {
    try {
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

      const updatedHistory = [
        {
          stage: 'Archived',
          timestamp: nowFormatted,
          user: 'ananya.rao@brightcone.ai',
        },
        ...(cand.history || []),
      ];
      saveCandidateHistory(cand.id, updatedHistory);

      const updated: CandidateTracker = {
        ...cand,
        archived: true,
        updated_at: nowFormatted,
        history: updatedHistory,
      };
      await employeesApi.updateCandidateTracker(cand.id, updated);
      if (selectedCandidate?.id === cand.id) {
        setSelectedCandidate(null);
      }
      setDeleteModalCandidate(null);
      setToastMessage(`Candidate "${cand.full_name}" moved to Archive.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCandidates();
    } catch (err) {
      alert('Failed to archive candidate: ' + err);
    }
  };

  // Restore from Archive (Matching Image 1)
  const handleRestoreCandidate = async (cand: CandidateTracker) => {
    try {
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

      const updatedHistory = [
        {
          stage: 'Restored',
          timestamp: nowFormatted,
          user: 'ananya.rao@brightcone.ai',
        },
        ...(cand.history || []),
      ];
      saveCandidateHistory(cand.id, updatedHistory);

      const updated: CandidateTracker = {
        ...cand,
        archived: false,
        updated_at: nowFormatted,
        history: updatedHistory,
      };
      await employeesApi.updateCandidateTracker(cand.id, updated);
      if (selectedCandidate?.id === cand.id) {
        setSelectedCandidate(updated);
      }
      setToastMessage(`Candidate "${cand.full_name}" restored to active tracker!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCandidates();
    } catch (err) {
      alert('Failed to restore candidate: ' + err);
    }
  };

  // Permanent Delete for all
  const handlePermanentDelete = async (id: string, name: string) => {
    try {
      await employeesApi.deleteCandidateTracker(id);
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(null);
      }
      setDeleteModalCandidate(null);
      setToastMessage(`Candidate "${name}" permanently deleted for all.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCandidates();
    } catch (err) {
      alert('Failed to delete candidate: ' + err);
    }
  };

  // Convert to Employee -> Saves to People Dashboard & redirects to Joining Formalities!
  const handleConvertToEmployee = async (cand: CandidateTracker) => {
    try {
      const newEmp = await employeesApi.convertCandidateToEmployee(cand.id);
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

      const prevHistory = cand.history && cand.history.length > 0
        ? cand.history
        : [
            ...(cand.stage !== 'Applied'
              ? [{
                  stage: cand.stage,
                  timestamp: cand.updated_at || '19 Oct 2026, 12:43 pm',
                  user: 'ananya.rao@brightcone.ai',
                }]
              : []),
            {
              stage: 'Applied',
              timestamp: cand.created_at || '19 Oct 2026, 12:43 pm',
              user: 'ananya.rao@brightcone.ai',
            },
          ];

      const updatedHistory = [
        {
          stage: 'Hired',
          timestamp: nowFormatted,
          user: 'ananya.rao@brightcone.ai',
        },
        ...prevHistory,
      ];
      saveCandidateHistory(cand.id, updatedHistory);

      const updatedCand: CandidateTracker = {
        ...cand,
        stage: 'Hired',
        employee_id: newEmp.id,
        updated_at: nowFormatted,
        history: updatedHistory,
      };

      try {
        await employeesApi.updateCandidateTracker(cand.id, updatedCand);
      } catch {
        // local update
      }

      setToastMessage(
        `"${cand.full_name}" converted to Employee (${newEmp.id}) under People Dashboard! Redirecting to Joining Formalities...`
      );
      if (selectedCandidate?.id === cand.id) {
        setSelectedCandidate(null);
      }
      setTimeout(() => {
        navigate('/recruit/joining', {
          state: {
            convertedEmployeeId: newEmp.id,
            convertedName: cand.full_name,
            role: cand.applied_for,
          },
        });
      }, 700);
      fetchCandidates();
    } catch (err) {
      alert('Failed to convert candidate: ' + err);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Applied For',
      'Source',
      'Experience (Years)',
      'Current CTC',
      'Expected CTC',
      'Notice Period (Days)',
      'Location',
      'Stage',
      'Archived',
    ];
    const rows = candidates.map((c) => [
      c.id,
      `"${c.full_name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.applied_for}"`,
      `"${c.source}"`,
      c.total_experience,
      c.current_ctc || 0,
      c.expected_ctc,
      c.notice_period || 0,
      `"${c.current_location || ''}"`,
      c.stage,
      c.archived ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'candidate_tracker_brightcone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStageBadgeStyle = (stg: string) => {
    const lower = stg.toLowerCase();
    if (lower === 'rejected') {
      return 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900';
    }
    if (lower === 'interview' || lower === 'screening') {
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900';
    }
    if (lower === 'selected' || lower === 'offered' || lower === 'joined' || lower === 'hired') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
    }
    if (lower === 'on hold') {
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
    }
    return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
  };

  // Filter calculations: Split active vs archived
  const archivedCount = candidates.filter((c) => Boolean(c.archived)).length;

  const filtered = candidates.filter((c) => {
    const isArchivedMatch = showArchived ? Boolean(c.archived) : !c.archived;
    if (!isArchivedMatch) return false;

    const matchSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applied_for.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStage = stageFilter === 'All' || c.stage.toLowerCase() === stageFilter.toLowerCase();
    return matchSearch && matchStage;
  });

  const activeCandidates = candidates.filter((c) => !c.archived);
  const appliedCount = activeCandidates.filter((c) => c.stage === 'Applied').length;
  const interviewCount = activeCandidates.filter((c) => c.stage === 'Interview' || c.stage === 'Screening').length;
  const offeredCount = activeCandidates.filter((c) => c.stage === 'Offered' || c.stage === 'Selected' || c.stage === 'Joined' || c.stage === 'Hired').length;

  return (
    <div className="space-y-6 animate-fadeIn font-['Sora',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D68BD] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="page-badge page-badge-recruit">
            <span className="page-badge-dot" />
            <span>RECRUIT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Candidate tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every applicant and their stage. “Convert to employee” generates their Employee ID, moves them to Offer Letters, and sets up onboarding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-blue flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add candidate</span>
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
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{candidates.length}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live records</div>
          </div>
        </div>

        {/* Applied */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Applied</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{appliedCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Active records</div>
          </div>
        </div>

        {/* Interview */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Interview</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{interviewCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Active records</div>
          </div>
        </div>

        {/* Offered */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Offered</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{offeredCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Active records</div>
          </div>
        </div>
      </div>

      {/* Table Card with Toolbar (Matching Image 1) */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate tracker"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="table-search-input"
              />
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="table-filter-select"
            >
              <option value="All">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Offered">Offered</option>
              <option value="Joined">Joined</option>
              <option value="Rejected">Rejected</option>
              <option value="On hold">On hold</option>
            </select>
          </div>

          {/* Archived Checkbox matching Image 1 */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Archived ({archivedCount})</span>
            </label>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>FULL NAME</th>
                <th>APPLIED FOR</th>
                <th>SOURCE</th>
                <th>TOTAL EXPERIENCE (YEARS)</th>
                <th>EXPECTED CTC (₹/YEAR)</th>
                <th>STAGE</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading candidates...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {showArchived
                          ? 'No archived candidates.'
                          : 'No candidate tracker yet. Use Add candidate to create the first one.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cand) => (
                  <tr key={cand.id}>
                    <td className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                      {cand.id}
                    </td>
                    <td className="font-semibold text-slate-900 dark:text-white">
                      {cand.full_name}
                    </td>
                    <td>{cand.applied_for}</td>
                    <td>{cand.source}</td>
                    <td>{cand.total_experience}</td>
                    <td>₹{(cand.expected_ctc || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStageBadgeStyle(cand.stage)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{cand.stage}</span>
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If in Archived view -> Show Eye, Restore button matching Image 1, and Delete for all */}
                        {showArchived ? (
                          <>
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRestoreCandidate(cand)}
                              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Restore candidate from archive"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => openPermanentDeleteModal(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Delete for all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          /* Active View -> Convert, Eye, Edit, Archive/Delete */
                          <>
                            {(cand.stage === 'Offered' || cand.stage === 'Hired' || cand.stage === 'Joined') && (
                              <button
                                onClick={() => handleConvertToEmployee(cand)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Convert to employee"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Convert</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="View Candidate Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Edit Candidate"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openArchiveModal(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Delete / Move to Archive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info matching Image 1 */}
        <div className="table-footer">
          <div>{filtered.length} of {candidates.length} shown</div>
          <div className="text-[11px] text-slate-400">
            Saved in this browser · last saved 19 Oct 2026, 6:36 pm
          </div>
        </div>
      </div>

      {/* =========================================================================
          CANDIDATE DETAILS FLYOUT DRAWER (Matching Image 4 & 5)
          ========================================================================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCandidate(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#0B132B] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-200">

              {/* Header with Close X */}
              <div>
                <div className="flex items-center justify-end p-4 pb-0">
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-7 pt-2 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <User className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {selectedCandidate.full_name} ({selectedCandidate.id})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Candidate · {selectedCandidate.id}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStageBadgeStyle(selectedCandidate.stage)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{selectedCandidate.stage}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Attributes Body (Matching Image 4) */}
              <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Full name</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.full_name}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Email</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.email || '—'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Phone</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.phone || '—'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Applied for</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.applied_for}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Source</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.source}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Total experience (years)</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.total_experience}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Current CTC (₹/year)</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    ₹{(selectedCandidate.current_ctc || 2000000).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Expected CTC (₹/year)</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    ₹{(selectedCandidate.expected_ctc || 50000000).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Notice period (days)</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.notice_period || 8}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Current location</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.current_location || 'vi'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Resume</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.resume || '—'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Consent to store data</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.consent_to_store_data || 'Yes'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Stage</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.stage}</div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Employee ID</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{selectedCandidate.employee_id || '—'}</div>
                </div>

                {/* History Section matching Screenshot 2 */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">History</h3>
                  <div className="space-y-3.5 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
                    {selectedCandidate.history && selectedCandidate.history.length > 0 ? (
                      selectedCandidate.history.map((hist, idx) => (
                        <div key={idx} className="relative pl-3">
                          <span
                            className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0B132B] ${
                              idx === 0 ? 'bg-indigo-500' : 'bg-slate-400'
                            }`}
                          />
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{hist.stage}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{hist.timestamp} · {hist.user}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        {selectedCandidate.stage !== 'Applied' && (
                          <div className="relative pl-3">
                            <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-[#0B132B]" />
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{selectedCandidate.stage}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{selectedCandidate.updated_at || '19 Oct 2026, 3:51 pm'} · ananya.rao@brightcone.ai</div>
                          </div>
                        )}
                        <div className="relative pl-3">
                          <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white dark:border-[#0B132B]" />
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Applied</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{selectedCandidate.created_at || '19 Oct 2026, 12:43 pm'} · ananya.rao@brightcone.ai</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-3">
                  Created {selectedCandidate.created_at || '19 Oct 2026, 12:43 pm'} by ananya.rao@brightcone.ai. Last updated {selectedCandidate.updated_at || '19 Oct 2026, 3:51 pm'}.
                </div>
              </div>

              {/* Bottom Actions matching Image 5 */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/50 dark:bg-[#070e20]">
                {selectedCandidate.archived ? (
                  <>
                    <button
                      onClick={() => handleRestoreCandidate(selectedCandidate)}
                      className="btn-primary-blue flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Candidate</span>
                    </button>
                    <button
                      onClick={() => openPermanentDeleteModal(selectedCandidate)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B132B] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete for all</span>
                    </button>
                  </>
                ) : (
                  <>
                    {(selectedCandidate.stage === 'Offered' || selectedCandidate.stage === 'Hired' || selectedCandidate.stage === 'Joined') && (
                      <button
                        onClick={() => handleConvertToEmployee(selectedCandidate)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        title="Convert to employee"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Convert to employee</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleOpenEditModal(selectedCandidate);
                        setSelectedCandidate(null);
                      }}
                      className="btn-primary-blue flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openArchiveModal(selectedCandidate)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B132B] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Move to archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD CANDIDATE MODAL (Exact match to Image 2)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-slate-800 p-7 shadow-2xl z-10 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Add candidate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fields marked * are required.
              </p>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-4">
              {/* Row 1: Full name * | Email * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Phone * | Applied for (Gets jobs from database!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applied for
                  </label>
                  <select
                    value={appliedFor}
                    onChange={(e) => setAppliedFor(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select...</option>
                    {jobs.length > 0 && (
                      <optgroup label="Open Job Postings">
                        {jobs.map((job) => (
                          <option key={`job-${job.id}`} value={job.title}>
                            {job.title} ({job.department})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {manpower.length > 0 && (
                      <optgroup label="Manpower Requisitions">
                        {manpower.map((m) => (
                          <option key={`mr-${m.id}`} value={`${m.designation} · ${m.department} (${m.id})`}>
                            {m.designation} · {m.department} ({m.id})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 3: Source * (Image 2) | Total experience (years) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Careers page">Careers page</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Referral">Referral</option>
                    <option value="Agency">Agency</option>
                    <option value="Campus">Campus</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total experience (years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Current CTC (₹/year) | Expected CTC (₹/year) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current CTC (₹/year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected CTC (₹/year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Notice period (days) | Current location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notice period (days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current location
                  </label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder=""
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Resume */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resume
                </label>
                <div className="w-full border border-slate-200 dark:border-[#1D2B52] rounded-xl p-2 bg-white dark:bg-[#0E1833] flex items-center gap-2">
                  <input
                    type="file"
                    id="resume-file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeName(e.target.files[0].name);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Row 7: Consent to store data * | Stage * (Image 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consent to store data <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={consentToStoreData}
                    onChange={(e) => setConsentToStoreData(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Offered">Offered</option>
                    <option value="Joined">Joined</option>
                    <option value="Rejected">Rejected</option>
                    <option value="On hold">On hold</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons (Matching Image 2) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1D68BD] hover:bg-[#155296] text-white transition cursor-pointer shadow-sm"
                >
                  Add candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CANDIDATE MODAL
          ========================================================================= */}
      {isEditModalOpen && editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-slate-800 p-7 shadow-2xl z-10 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Edit Candidate ({editingCandidate.id})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update candidate details and recruitment stage
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCandidate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applied for (Role/Job)
                  </label>
                  <select
                    value={appliedFor}
                    onChange={(e) => setAppliedFor(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value={appliedFor}>{appliedFor || 'Select...'}</option>
                    {jobs.map((job) => (
                      <option key={`edit-job-${job.id}`} value={job.title}>
                        {job.title} ({job.department})
                      </option>
                    ))}
                    {manpower.map((m) => (
                      <option key={`edit-mr-${m.id}`} value={`${m.designation} · ${m.department} (${m.id})`}>
                        {m.designation} · {m.department} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Careers page">Careers page</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Referral">Referral</option>
                    <option value="Agency">Agency</option>
                    <option value="Campus">Campus</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Offered">Offered</option>
                    <option value="Joined">Joined</option>
                    <option value="Rejected">Rejected</option>
                    <option value="On hold">On hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current CTC (₹/year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected CTC (₹/year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notice period (days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current location
                  </label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1D68BD] hover:bg-[#155296] text-white transition cursor-pointer shadow-sm"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE / ARCHIVE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteModalCandidate(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${deleteModalMode === 'archive'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                  }`}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {deleteModalMode === 'archive' ? 'Move to archive?' : 'Delete candidate for all?'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteModalCandidate.full_name} ({deleteModalCandidate.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {deleteModalMode === 'archive' ? (
                <>
                  Are you sure you want to remove candidate <strong>{deleteModalCandidate.full_name}</strong>? They will be moved to the <strong>Archive</strong> and can be restored anytime.
                </>
              ) : (
                <>
                  Permanently delete candidate <strong>{deleteModalCandidate.full_name}</strong> ({deleteModalCandidate.id}) for all? This will remove them permanently from the database and <strong>cannot be undone</strong>.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              {deleteModalMode === 'archive' ? (
                <button
                  type="button"
                  onClick={() => handleArchiveCandidate(deleteModalCandidate)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-sm"
                >
                  Move to archive
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handlePermanentDelete(deleteModalCandidate.id, deleteModalCandidate.full_name)
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-sm"
                >
                  Delete for all
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTrackerPage;

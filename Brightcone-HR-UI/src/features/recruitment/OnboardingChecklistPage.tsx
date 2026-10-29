import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  List,
  ListChecks,
  Plus,
  Download,
  Search,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  ChevronDown,
  Loader2,
  LogIn,
} from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import { onboardingTasksApi } from '../../api/onboarding.api';
import { Employee } from '../../types/employee.types';
import {
  OnboardingChecklistItem,
  CreateOnboardingTaskPayload,
} from '../../types/recruitment.types';

export const OnboardingChecklistPage: React.FC = () => {
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<OnboardingChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & View state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<OnboardingChecklistItem | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<OnboardingChecklistItem | null>(null);

  // Task Form State (Add / Edit)
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formTask, setFormTask] = useState('');
  const [formOwner, setFormOwner] = useState('Select...');
  const [formDueDate, setFormDueDate] = useState('');
  const [formStatus, setFormStatus] = useState('Select...');
  const [formCompletedOn, setFormCompletedOn] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Standard Checklist Modal State
  const [standardEmployeeId, setStandardEmployeeId] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper: Format current timestamp matching screenshot: "23 Oct 2026, 11:15 am"
  const formatCurrentTimestamp = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  // Helper: Get 2-letter initials
  const getInitials = (name?: string): string => {
    if (!name || !name.trim()) return 'as';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toLowerCase();
    }
    return name.slice(0, 2).toLowerCase();
  };

  // Helper: Format date as MMM DD, YYYY (e.g. Feb 20, 2000)
  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr || !dateStr.trim()) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper: Get employee department / subtext
  const getEmployeeSubtext = (empId?: string): string => {
    if (!empId) return 'BC-0001 · bba';
    const emp = employees.find((e) => e.id === empId);
    const dept = emp?.department || emp?.role || 'bba';
    return `${empId} · ${dept.toLowerCase()}`;
  };

  // Helper: Get owner subtext
  const getOwnerSubtext = (ownerName?: string, fallbackEmpId?: string): string => {
    if (!ownerName) return getEmployeeSubtext(fallbackEmpId);
    const emp = employees.find(
      (e) => e.name.toLowerCase() === ownerName.toLowerCase() || e.id === ownerName
    );
    if (emp) {
      return `${emp.id} · ${(emp.department || emp.role || 'bba').toLowerCase()}`;
    }
    return `${fallbackEmpId || 'BC-0001'} · bba`;
  };

  // Helper: Status badge matching Reference Screenshot 1 (colored dot + name, no dropdown)
  const renderTaskStatusBadge = (status?: string, overdue: boolean = false) => {
    if (overdue) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0" />
          <span>{status || 'Pending'}</span>
        </span>
      );
    }
    const s = (status || 'Pending').toLowerCase();
    let pillStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    let dotColor = 'bg-amber-600 dark:bg-amber-400';

    if (s === 'completed') {
      pillStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      dotColor = 'bg-emerald-600 dark:bg-emerald-400';
    } else if (s === 'in progress') {
      pillStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      dotColor = 'bg-blue-600 dark:bg-blue-400';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${pillStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
        <span>{status || 'Pending'}</span>
      </span>
    );
  };

  // Helper: Format task ID as ONB-XXXX (matches Screenshot 3 & 4)
  const formatTaskId = (id: string): string => {
    if (!id) return 'ONB-0001';
    if (id.startsWith('ONB-')) return id;
    if (id.startsWith('CHK-') && id.includes('ITEM-')) {
      const parts = id.split('ITEM-');
      const num = parseInt(parts[1], 10) || 1;
      return `ONB-${String(num).padStart(4, '0')}`;
    }
    if (id.startsWith('OB-')) {
      const parts = id.split('OB-');
      const num = parseInt(parts[1], 10) || 1;
      return `ONB-${String(num).padStart(4, '0')}`;
    }
    return id;
  };

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeesApi.getEmployees();
      setEmployees(data || []);
      if (data && data.length > 0 && !standardEmployeeId) {
        setStandardEmployeeId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  }, [standardEmployeeId]);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      const data = await onboardingTasksApi.getTasks();
      setTasks(data || []);
    } catch (err: any) {
      console.error('Failed to load onboarding tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, [fetchEmployees, fetchTasks]);

  // Reset task form
  const resetTaskForm = () => {
    setEditingTaskId(null);
    setFormEmployeeId(employees[0]?.id || '');
    setFormTask('');
    setFormOwner('HR');
    setFormDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setFormStatus('Pending');
    setFormCompletedOn('');
    setFormNotes('');
  };

  // Open edit modal
  const handleOpenEdit = (task: OnboardingChecklistItem) => {
    setEditingTaskId(task.id);
    setFormEmployeeId(task.employee_id || employees[0]?.id || '');
    setFormTask(task.task || task.title || '');
    setFormOwner(task.owner || task.assigned_to || 'HR');

    let due = task.due_date || '';
    if (due && due.includes('-') && due.length === 10) {
      setFormDueDate(due);
    } else {
      setFormDueDate(new Date().toISOString().split('T')[0]);
    }

    setFormStatus(task.status || 'Pending');
    setFormCompletedOn(task.completed_on || task.completed_at || '');
    setFormNotes(task.notes || task.description || '');
    setIsTaskModalOpen(true);
  };

  // Submit Add / Edit Task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || formEmployeeId === 'Select...') {
      showToast('Please select an employee.');
      return;
    }
    if (!formTask.trim()) {
      showToast('Please enter the task name.');
      return;
    }
    if (!formDueDate) {
      showToast('Please select a due date.');
      return;
    }
    if (!formStatus || formStatus === 'Select...') {
      showToast('Please select a status.');
      return;
    }

    setActionLoading(true);
    try {
      const selectedEmp = employees.find((e) => e.id === formEmployeeId);
      const nowTs = formatCurrentTimestamp();
      const payload: CreateOnboardingTaskPayload = {
        employee_id: formEmployeeId,
        employee_name: selectedEmp ? selectedEmp.name : undefined,
        task: formTask.trim(),
        owner: formOwner === 'Select...' ? 'HR' : formOwner,
        due_date: formDueDate,
        status: formStatus,
        completed_on: formStatus === 'Completed' ? formCompletedOn || new Date().toISOString().split('T')[0] : '',
        notes: formNotes.trim() || undefined,
        timestamp: nowTs,
        user: 'ananya.rao@brightcone.ai',
      };

      if (editingTaskId) {
        const updated = await onboardingTasksApi.updateTask(editingTaskId, payload);
        showToast('Onboarding task updated successfully!');
        if (viewingTask && viewingTask.id === editingTaskId) {
          setViewingTask(updated);
        }
      } else {
        await onboardingTasksApi.createTask(payload);
        showToast('Onboarding task created successfully!');
      }

      setIsTaskModalOpen(false);
      resetTaskForm();
      await fetchTasks();
    } catch (err: any) {
      console.error('Error saving onboarding task:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save onboarding task');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Standard Checklist (Creates up to 8 standard onboarding tasks)
  const handleCreateStandardChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardEmployeeId) {
      showToast('Please select an employee.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await onboardingTasksApi.createStandardChecklist(standardEmployeeId);
      showToast(`Created ${res.created_count} standard onboarding tasks for ${standardEmployeeId}!`);
      setIsStandardModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      console.error('Error creating standard checklist:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to generate standard checklist');
    } finally {
      setActionLoading(false);
    }
  };

  // Move to Archive (from Delete click on live task)
  const handleMoveToArchive = async () => {
    if (!deleteConfirmTask) return;
    setActionLoading(true);
    try {
      if (deleteConfirmTask.archived) {
        // Permanently delete if already archived
        await onboardingTasksApi.deleteTask(deleteConfirmTask.id);
        showToast('Task deleted permanently.');
      } else {
        // Move to archive first
        await onboardingTasksApi.archiveTask(deleteConfirmTask.id, true);
        showToast(`Moved ${formatTaskId(deleteConfirmTask.id)} to Archived.`);
      }
      setDeleteConfirmTask(null);
      if (viewingTask?.id === deleteConfirmTask.id) {
        setViewingTask(null);
      }
      await fetchTasks();
    } catch (err: any) {
      console.error('Failed to update task:', err);
      showToast('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  // Restore task from archive
  const handleRestoreTask = async (task: OnboardingChecklistItem) => {
    setActionLoading(true);
    try {
      await onboardingTasksApi.archiveTask(task.id, false);
      showToast(`Restored ${formatTaskId(task.id)} from archive.`);
      await fetchTasks();
    } catch (err: any) {
      console.error('Failed to restore task:', err);
      showToast('Failed to restore task');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No tasks to export.');
      return;
    }

    const headers = ['Task ID', 'Employee ID', 'Employee Name', 'Task', 'Owner', 'Due Date', 'Status', 'Completed On', 'Notes', 'Archived'];
    const rows = tasks.map((t) => [
      `"${formatTaskId(t.id)}"`,
      `"${t.employee_id || ''}"`,
      `"${t.employee_name || ''}"`,
      `"${(t.task || t.title || '').replace(/"/g, '""')}"`,
      `"${(t.owner || t.assigned_to || '').replace(/"/g, '""')}"`,
      `"${formatDateDisplay(t.due_date)}"`,
      `"${t.status}"`,
      `"${formatDateDisplay(t.completed_on || t.completed_at)}"`,
      `"${(t.notes || t.description || '').replace(/"/g, '""')}"`,
      `"${t.archived ? 'Yes' : 'No'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `onboarding_checklist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully!');
  };

  // Check if a task is overdue
  const isTaskOverdue = (task: OnboardingChecklistItem): boolean => {
    if (task.status === 'Completed' || !task.due_date) return false;
    const due = new Date(task.due_date);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const liveTasks = tasks.filter((t) => !t.archived);
    const total = liveTasks.length;
    const pending = liveTasks.filter((t) => t.status !== 'Completed').length;
    const completed = liveTasks.filter((t) => t.status === 'Completed').length;
    const overdue = liveTasks.filter((t) => isTaskOverdue(t)).length;
    return { total, pending, completed, overdue };
  }, [tasks]);

  const archivedCount = useMemo(() => {
    return tasks.filter((t) => !!t.archived).length;
  }, [tasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isArchived = !!t.archived;
      if (showArchived !== isArchived) return false;

      if (statusFilter !== 'All' && t.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEmployee =
          (t.employee_name && t.employee_name.toLowerCase().includes(q)) ||
          (t.employee_id && t.employee_id.toLowerCase().includes(q));
        const matchesTask = (t.task || t.title || '').toLowerCase().includes(q);
        const matchesOwner = (t.owner || t.assigned_to || '').toLowerCase().includes(q);
        const matchesNotes = (t.notes || t.description || '').toLowerCase().includes(q);
        if (!matchesEmployee && !matchesTask && !matchesOwner && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, showArchived, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900/70 p-6 md:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* HEADER SECTION (Matching Reference Screenshot 3 Alignment Perfectly) */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Badge, Title & Subtitle */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/70 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400"></span>
            RECRUIT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Onboarding checklist
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Tasks to settle each new joiner in. Use &ldquo;Add standard checklist&rdquo; to create the usual 8 tasks in one step.
          </p>
        </div>

        {/* Right: Exactly 3 Action Buttons aligned horizontally without wrapping */}
        <div className="flex items-center gap-3 shrink-0 flex-nowrap self-start md:self-center">
          <button
            onClick={() => {
              if (employees.length > 0 && !standardEmployeeId) {
                setStandardEmployeeId(employees[0].id);
              }
              setIsStandardModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750 shrink-0"
          >
            <ListChecks className="w-4 h-4 text-slate-500" />
            <span>Add standard checklist</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750 shrink-0"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetTaskForm();
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add onboarding task</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total records */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live records</div>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pending</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Completed */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completed</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Overdue */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overdue</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.overdue}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Past due date</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search onboarding checklist"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Archived Checkbox */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Archived ({archivedCount})</span>
            </label>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Loading onboarding checklist...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100/80 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 shadow-sm">
              <List className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              No onboarding checklist yet. Use{' '}
              <button
                onClick={() => {
                  resetTaskForm();
                  setIsTaskModalOpen(true);
                }}
                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 underline"
              >
                Add onboarding task
              </button>{' '}
              to create the first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-4">TASK</th>
                  <th className="py-3 px-4">OWNER</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  const empName = task.employee_name || 'asdfghj sdfg';
                  const ownerName = task.owner || task.assigned_to || empName;
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-750/40 transition-colors group"
                    >
                      {/* EMPLOYEE (Screenshot 5: Green avatar initials + Name + BC-XXXX · dept) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                            {getInitials(empName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {empName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {getEmployeeSubtext(task.employee_id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* TASK */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                        <span>{task.task || task.title}</span>
                      </td>

                      {/* OWNER (Screenshot 5: Green avatar initials + Name + BC-XXXX · dept) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                            {getInitials(ownerName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {ownerName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {getOwnerSubtext(ownerName, task.employee_id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DUE DATE (Screenshot 5: Feb 20, 2000) */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {formatDateDisplay(task.due_date)}
                      </td>

                      {/* STATUS (Pill badge with colored dot matching Screenshot 1, no dropdown) */}
                      <td className="py-3.5 px-4">
                        {renderTaskStatusBadge(task.status, overdue)}
                      </td>

                      {/* ACTIONS (Screenshot 5: Exactly 3 icons: Eye, Pencil, Trash) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          {/* 1. Eye icon: View Details Drawer */}
                          <button
                            onClick={() => setViewingTask(task)}
                            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Pencil icon: Edit Modal */}
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* 3. Trash icon: Moves to archive first (Screenshot 3 modal) */}
                          {task.archived ? (
                            <>
                              <button
                                onClick={() => handleRestoreTask(task)}
                                className="p-1 hover:text-emerald-600 transition-colors"
                                title="Restore task"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmTask(task)}
                                className="p-1 hover:text-red-600 transition-colors"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmTask(task)}
                              className="p-1 hover:text-red-600 transition-colors"
                              title="Delete task (moves to archive)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <span>
            {filteredTasks.length} of {tasks.length} shown
          </span>
          <span>Saved in this browser · last saved {formatCurrentTimestamp()}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Add / Edit Onboarding Task */}
      {/* ========================================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingTaskId ? 'Edit onboarding task' : 'Add onboarding task'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fields marked <span className="text-red-500 font-bold">*</span> are required.
                </p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-5 space-y-4">
              {/* Employee * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Select...">Select...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Task * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                  placeholder="e.g. Set up G-Suite & Slack credentials (@brightcone.ai)"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Row: Owner & Due date * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner
                  </label>
                  <div className="relative">
                    <select
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Select...">Select...</option>
                      <option value="HR">HR</option>
                      <option value="IT Support">IT Support</option>
                      <option value="IT Ops">IT Ops</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                      <option value="People Ops">People Ops</option>
                      <option value="Workplace Ops">Workplace Ops</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Status * & Completed on */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormStatus(val);
                        if (val === 'Completed' && !formCompletedOn) {
                          setFormCompletedOn(new Date().toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full appearance-none px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Select...">Select...</option>
                      <option value="Pending">Pending</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Completed on
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formCompletedOn}
                      onChange={(e) => setFormCompletedOn(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional context, credentials, or completion criteria..."
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTaskId ? 'Save changes' : 'Add onboarding task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add standard checklist */}
      {/* ========================================================================= */}
      {isStandardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add standard checklist
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Creates up to 8 onboarding tasks, due relative to the joining date. Tasks the employee already has are skipped.
                </p>
              </div>
              <button
                onClick={() => setIsStandardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStandardChecklist} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <div className="relative">
                  <select
                    value={standardEmployeeId}
                    onChange={(e) => setStandardEmployeeId(e.target.value)}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-500 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStandardModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Add tasks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: View Candidate & Task Details (Matches Reference Screenshot 4) */}
      {/* ========================================================================= */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Header: List Icon, ONB-XXXX, Close Button */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs">
                    <List className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatTaskId(viewingTask.id)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Onboarding task · {formatTaskId(viewingTask.id)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingTask(null)}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status pill badge below header */}
              <div className="mt-4">
                {isTaskOverdue(viewingTask) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Overdue
                  </span>
                ) : viewingTask.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {viewingTask.status || 'Pending'}
                  </span>
                )}
              </div>

              {/* Details Sections */}
              <div className="mt-6 space-y-4 text-sm">
                {/* Employee */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Employee
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                      {getInitials(viewingTask.employee_name || 'asdfghj sdfg')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {viewingTask.employee_name || 'asdfghj sdfg'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {getEmployeeSubtext(viewingTask.employee_id)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Task
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingTask.task || viewingTask.title}
                  </p>
                </div>

                {/* Owner */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Owner
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                      {getInitials(viewingTask.owner || viewingTask.assigned_to || viewingTask.employee_name || 'asdfghj sdfg')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {viewingTask.owner || viewingTask.assigned_to || viewingTask.employee_name || 'asdfghj sdfg'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {getOwnerSubtext(viewingTask.owner || viewingTask.assigned_to, viewingTask.employee_id)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Due date
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatDateDisplay(viewingTask.due_date)}
                  </p>
                </div>

                {/* Status (Interactive selector for live status & history updates) */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={viewingTask.status || 'Pending'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const nowTs = formatCurrentTimestamp();
                        try {
                          const updated = await onboardingTasksApi.updateTaskStatus(
                            viewingTask.id,
                            newStatus,
                            newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
                            nowTs,
                            'ananya.rao@brightcone.ai'
                          );
                          setViewingTask(updated);
                          await fetchTasks();
                          showToast(`Status updated to ${newStatus}`);
                        } catch (err: any) {
                          console.error(err);
                          showToast('Failed to update status');
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Completed on */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Completed on
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatDateDisplay(viewingTask.completed_on || viewingTask.completed_at)}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Notes
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {viewingTask.notes || viewingTask.description || '—'}
                  </p>
                </div>

                {/* History Section (Matching Reference Screenshot 2) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    History
                  </h4>

                  <div className="space-y-4">
                    {(() => {
                      const historyItems =
                        viewingTask.history && viewingTask.history.length > 0
                          ? viewingTask.history
                          : [
                              {
                                status: viewingTask.status || 'Pending',
                                timestamp: viewingTask.created_at || formatCurrentTimestamp(),
                                user: 'ananya.rao@brightcone.ai',
                              },
                            ];

                      const firstCreated =
                        viewingTask.created_at ||
                        historyItems[0]?.timestamp ||
                        formatCurrentTimestamp();
                      const firstUser = historyItems[0]?.user || 'ananya.rao@brightcone.ai';
                      const lastUpdated =
                        viewingTask.updated_at ||
                        historyItems[historyItems.length - 1]?.timestamp ||
                        firstCreated;

                      return (
                        <>
                          <div className="space-y-4">
                            {historyItems.map((item, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {item.status}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.timestamp} · {item.user || 'ananya.rao@brightcone.ai'}
                                </p>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 leading-relaxed">
                            Created {firstCreated} by {firstUser}. Last updated {lastUpdated}.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons: Edit & Delete (matching Screenshot 4) */}
            <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const taskToEdit = viewingTask;
                  setViewingTask(null);
                  handleOpenEdit(taskToEdit);
                }}
                className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  const taskToDelete = viewingTask;
                  setViewingTask(null);
                  setDeleteConfirmTask(taskToDelete);
                }}
                className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 dark:bg-slate-800 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Delete Confirmation -> Move to Archive (Matches Reference Screenshot 3) */}
      {/* ========================================================================= */}
      {deleteConfirmTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {deleteConfirmTask.archived
                ? `Permanently delete ${formatTaskId(deleteConfirmTask.id)}?`
                : `Delete ${formatTaskId(deleteConfirmTask.id)}?`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {deleteConfirmTask.archived ? (
                'This will permanently erase the task from the database. This action cannot be undone.'
              ) : (
                <>
                  It moves to <span className="font-bold text-slate-900 dark:text-white">Archived</span>, where you can restore it at any time. Nothing is erased.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-2">
              <button
                onClick={() => setDeleteConfirmTask(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToArchive}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {deleteConfirmTask.archived ? 'Delete permanently' : 'Move to archive'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklistPage;

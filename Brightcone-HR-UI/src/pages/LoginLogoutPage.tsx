import React, { useState, useEffect, useMemo } from 'react';
import {
  LogIn,
  LogOut,
  Clock,
  Download,
  Plus,
  Search,
  Trash2,
  ArchiveRestore,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import type { Employee } from '../types';
import { useLiveEmployees } from '../utils/employeeSync';
import { DocDetailDrawer } from '../components/common/DocDetailDrawer';

import { useCurrentEmployee } from '../utils/useCurrentEmployee';

export interface LoginLogoutRecord {
  id: string;
  employee_id: number;
  employee_name: string;
  employee_email?: string;
  date: string;
  login_time: string;
  logout_time?: string;
  total_hours?: string;
  source: 'Web' | 'Mobile' | 'Biometric' | 'Manual';
  status: 'Completed' | 'Pending' | 'Disputed';
  archived?: boolean;
  notes?: string;
}

const STORAGE_KEY = 'brightcone_login_logout_records';

export const LoginLogoutPage: React.FC<{
  showSuccessToast?: (msg: string) => void;
}> = ({ showSuccessToast }) => {
  const { employees: liveEmps } = useLiveEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { currentEmployee, currentEmployeeId } = useCurrentEmployee(employees);

  const [records, setRecords] = useState<LoginLogoutRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'rec-1',
        employee_id: 1,
        employee_name: 'Naresh Vemparala',
        employee_email: 'naresh@brightcone.ai',
        date: new Date().toISOString().split('T')[0],
        login_time: '09:00',
        logout_time: '18:15',
        total_hours: '9.3 hrs',
        source: 'Web',
        status: 'Completed',
        notes: 'Regular check-in',
      },
      {
        id: 'rec-2',
        employee_id: 2,
        employee_name: 'Ananya Rao',
        employee_email: 'ananya@brightcone.ai',
        date: new Date().toISOString().split('T')[0],
        login_time: '09:30',
        logout_time: '',
        total_hours: 'In progress',
        source: 'Biometric',
        status: 'Pending',
        notes: 'Clocked in at lobby biometric',
      },
      {
        id: 'rec-3',
        employee_id: 3,
        employee_name: 'Vikram Malhotra',
        employee_email: 'vikram@brightcone.ai',
        date: new Date().toISOString().split('T')[0],
        login_time: '08:45',
        logout_time: '17:45',
        total_hours: '9.0 hrs',
        source: 'Mobile',
        status: 'Completed',
        notes: 'Field visit login',
      },
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [isQuickPunchOpen, setIsQuickPunchOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LoginLogoutRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<LoginLogoutRecord | null>(null);

  // Quick punch form
  const [punchEmployeeId, setPunchEmployeeId] = useState<number>(1);
  const [punchType, setPunchType] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');
  const [punchNotes, setPunchNotes] = useState('');

  // Add/Edit form
  const [formEmpId, setFormEmpId] = useState<number>(1);
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formLoginTime, setFormLoginTime] = useState('09:00');
  const [formLogoutTime, setFormLogoutTime] = useState('18:00');
  const [formSource, setFormSource] = useState<LoginLogoutRecord['source']>('Web');
  const [formStatus, setFormStatus] = useState<LoginLogoutRecord['status']>('Completed');
  const [formNotes, setFormNotes] = useState('');

  const [lastSaved, setLastSaved] = useState<string>('28 Oct 2026, 10:59 am');

  useEffect(() => {
    let isMounted = true;
    api.fetchEmployees().then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setEmployees(res.data);
      } else if (liveEmps.length > 0) {
        const mapped: Employee[] = liveEmps.map((le, idx) => ({
          id: idx + 1,
          pid: `EMP-${le.id || idx + 1}`,
          name: le.name,
          email: le.email,
          role: le.role,
          department: le.department,
          avatar_color: '#3B82F6',
          status: le.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          is_active: le.status === 'Active',
          created_at: le.joiningDate || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setEmployees(mapped);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [liveEmps]);

  // Sync punch and form employee with current logged in user
  useEffect(() => {
    if (currentEmployeeId) {
      setPunchEmployeeId(currentEmployeeId);
      setFormEmpId(currentEmployeeId);
    }
  }, [currentEmployeeId]);

  const saveToStorage = (updated: LoginLogoutRecord[]) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setLastSaved(now.toLocaleDateString('en-GB', opts));
    } catch {
      // ignore
    }
  };

  const computeHours = (start?: string, end?: string): string => {
    if (!start || !end) return '-';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '-';
    let mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60;
    const hours = (mins / 60).toFixed(1);
    return `${hours} hrs`;
  };

  const handleQuickPunch = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === punchEmployeeId);
    if (!emp) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    if (punchType === 'LOGIN') {
      const newRec: LoginLogoutRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        employee_id: emp.id,
        employee_name: emp.name,
        employee_email: emp.email,
        date: todayStr,
        login_time: nowTime,
        source: 'Web',
        status: 'Pending',
        notes: punchNotes,
      };
      saveToStorage([newRec, ...records]);
      showSuccessToast?.(`Clock-in recorded for ${emp.name} at ${nowTime}`);
    } else {
      const openIdx = records.findIndex(
        (r) => r.employee_id === emp.id && r.date === todayStr && !r.logout_time && !r.archived
      );
      if (openIdx >= 0) {
        const copy = [...records];
        const existing = copy[openIdx];
        copy[openIdx] = {
          ...existing,
          logout_time: nowTime,
          total_hours: computeHours(existing.login_time, nowTime),
          status: 'Completed',
          notes: punchNotes || existing.notes,
        };
        saveToStorage(copy);
        showSuccessToast?.(`Clock-out recorded for ${emp.name} at ${nowTime}`);
      } else {
        const newRec: LoginLogoutRecord = {
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          employee_id: emp.id,
          employee_name: emp.name,
          employee_email: emp.email,
          date: todayStr,
          login_time: '09:00',
          logout_time: nowTime,
          total_hours: computeHours('09:00', nowTime),
          source: 'Web',
          status: 'Completed',
          notes: punchNotes,
        };
        saveToStorage([newRec, ...records]);
        showSuccessToast?.(`Clock-out recorded for ${emp.name}`);
      }
    }

    setPunchNotes('');
    setIsQuickPunchOpen(false);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === formEmpId);
    if (!emp) return;

    const totalHours = formLogoutTime ? computeHours(formLoginTime, formLogoutTime) : '-';

    if (editingRecord) {
      const updated = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              employee_id: emp.id,
              employee_name: emp.name,
              employee_email: emp.email,
              date: formDate,
              login_time: formLoginTime,
              logout_time: formLogoutTime,
              total_hours: totalHours,
              source: formSource,
              status: formStatus,
              notes: formNotes,
            }
          : r
      );
      saveToStorage(updated);
      showSuccessToast?.('Login record updated successfully');
    } else {
      const newRec: LoginLogoutRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        employee_id: emp.id,
        employee_name: emp.name,
        employee_email: emp.email,
        date: formDate,
        login_time: formLoginTime,
        logout_time: formLogoutTime,
        total_hours: totalHours,
        source: formSource,
        status: formStatus,
        notes: formNotes,
      };
      saveToStorage([newRec, ...records]);
      showSuccessToast?.('Login record created successfully');
    }

    setIsAddEditOpen(false);
    setEditingRecord(null);
  };

  const handleToggleArchive = (id: string) => {
    const rec = records.find((r) => r.id === id);
    const updated = records.map((r) => (r.id === id ? { ...r, archived: !r.archived } : r));
    saveToStorage(updated);
    showSuccessToast?.(
      rec?.archived
        ? `Restored login record for ${rec?.employee_name}`
        : `Moved login record for ${rec?.employee_name} to archive`
    );
  };

  const handleDeletePermanent = (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (confirm(`Permanently delete login record for ${rec?.employee_name}? This cannot be undone.`)) {
      const updated = records.filter((r) => r.id !== id);
      saveToStorage(updated);
      showSuccessToast?.('Login record permanently deleted');
    }
  };

  const openEditModal = (rec: LoginLogoutRecord) => {
    setEditingRecord(rec);
    setFormEmpId(rec.employee_id);
    setFormDate(rec.date);
    setFormLoginTime(rec.login_time);
    setFormLogoutTime(rec.logout_time || '18:00');
    setFormSource(rec.source);
    setFormStatus(rec.status);
    setFormNotes(rec.notes || '');
    setIsAddEditOpen(true);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Employee', 'Date', 'Login Time', 'Logout Time', 'Total Hours', 'Source', 'Status', 'Notes'],
      ...filteredRecords.map((r) => [
        r.employee_name,
        r.date,
        r.login_time,
        r.logout_time || '',
        r.total_hours || '',
        r.source,
        r.status,
        r.notes || '',
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `login_logout_tracking_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast?.('CSV exported successfully');
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchArchived = showArchived ? r.archived : !r.archived;
      if (!matchArchived) return false;

      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = r.employee_name.toLowerCase().includes(q);
        const matchesEmail = r.employee_email?.toLowerCase().includes(q);
        const matchesDate = r.date.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDate) return false;
      }

      return true;
    });
  }, [records, showArchived, statusFilter, search]);

  const liveRecords = records.filter((r) => !r.archived);
  const totalCount = liveRecords.length;
  const pendingCount = liveRecords.filter((r) => r.status === 'Pending').length;
  const completedCount = liveRecords.filter((r) => r.status === 'Completed').length;
  const archivedCount = records.filter((r) => r.archived).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Section matching Screenshot 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B6FDB] dark:text-[#38BDF8] tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B6FDB] dark:bg-[#38BDF8]" />
            Shift
          </div>
          <h1 className="text-2xl font-bold text-[#0E1730] dark:text-white tracking-tight">
            Login &amp; logout tracking
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#889DC7] mt-1">
            Clock-in and clock-out times. Use &quot;Log in / out now&quot; to stamp the current time for an employee.
          </p>
        </div>

        {/* Action Buttons matching Screenshot 4 */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsQuickPunchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0A1326] hover:bg-[#F8FAFD] dark:hover:bg-[#132244] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white transition-all shadow-xs cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#5B6787] dark:text-[#889DC7]" />
            <span>Log in / out now</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0A1326] hover:bg-[#F8FAFD] dark:hover:bg-[#132244] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#5B6787] dark:text-[#889DC7]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setFormDate(new Date().toISOString().split('T')[0]);
              setFormLoginTime('09:00');
              setFormLogoutTime('18:00');
              setFormSource('Web');
              setFormStatus('Completed');
              setFormNotes('');
              setIsAddEditOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB] hover:bg-[#0957B0] text-white transition-all shadow-md shadow-[#0B6FDB]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add login record</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total records */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/10 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0B6FDB] dark:text-[#38BDF8]">
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Total records
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {totalCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Live records</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/10 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0B6FDB] dark:text-[#38BDF8]">
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Pending
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {pendingCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Records</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/10 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0B6FDB] dark:text-[#38BDF8]">
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Completed
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {completedCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Records</p>
          </div>
        </div>
      </div>

      {/* Main Table Container matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[#E3E8F2] dark:border-[#1C3262] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-[#5B6787] dark:text-[#889DC7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search login & logout tracking"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white placeholder-[#8D97B0] focus:outline-hidden focus:ring-2 focus:ring-[#0B6FDB]/20 focus:border-[#0B6FDB]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] cursor-pointer"
            >
              <option value="ALL">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Disputed">Disputed</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-[#5B6787] dark:text-[#889DC7] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-[#CBD5E1] dark:border-[#1C3262] text-[#0B6FDB] focus:ring-0 w-3.5 h-3.5 accent-[#0B6FDB]"
            />
            <span>Archived ({archivedCount})</span>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px] flex flex-col justify-between">
          {filteredRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0B6FDB] dark:text-[#38BDF8] mb-3">
                <LogIn className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-[#5B6787] dark:text-[#889DC7]">
                No login &amp; logout tracking yet. Use{' '}
                <strong className="text-[#0E1730] dark:text-white">Add login record</strong> to create the first one.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3E8F2] dark:border-[#1C3262] bg-[#F8FAFD]/60 dark:bg-[#060D1E]/40 text-[#5B6787] dark:text-[#889DC7] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Logout Time</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#1C3262]">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFD] dark:hover:bg-[#0F1C36] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#0E1730] dark:text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B6FDB] to-[#0BA6CC] text-white flex items-center justify-center text-[10px] font-bold">
                        {r.employee_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{r.employee_name}</div>
                        {r.employee_email && (
                          <div className="text-[10px] text-[#5B6787] dark:text-[#889DC7] font-normal">
                            {r.employee_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5B6787] dark:text-[#889DC7]">{r.date}</td>
                    <td className="py-3 px-4 font-medium text-[#0E1730] dark:text-white">{r.login_time}</td>
                    <td className="py-3 px-4 font-medium text-[#0E1730] dark:text-white">
                      {r.logout_time || '-'}
                    </td>
                    <td className="py-3 px-4 text-[#5B6787] dark:text-[#889DC7]">
                      {r.total_hours || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {r.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === 'Completed'
                            ? 'bg-[#E4F6ED] text-[#13885D] dark:bg-[#0E3326] dark:text-[#62D4A7]'
                            : r.status === 'Pending'
                            ? 'bg-[#FFF4DB] text-[#A66A00] dark:bg-[#3A2C08] dark:text-[#F2C36B]'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Eye icon at left */}
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          title="View details"
                          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] hover:text-[#0B6FDB] dark:hover:text-[#38BDF8]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {r.archived ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(r.id)}
                              title="Restore"
                              className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 hover:text-amber-600"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePermanent(r.id)}
                              title="Delete permanently"
                              className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(r)}
                              title="Edit record"
                              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] hover:text-[#0B6FDB] dark:hover:text-[#38BDF8]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(r.id)}
                              title="Delete (moves to archive)"
                              className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#5B6787] hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer Bar */}
          <div className="px-4 py-3 border-t border-[#E3E8F2] dark:border-[#1C3262] bg-[#F8FAFD]/40 dark:bg-[#060D1E]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5B6787] dark:text-[#889DC7] gap-2">
            <div>
              {filteredRecords.length} of {records.length} shown
            </div>
            <div>Saved in this browser • last saved {lastSaved}</div>
          </div>
        </div>
      </div>

      {/* Doc Detail Drawer */}
      {selectedRecord && (
        <DocDetailDrawer
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.employee_name}
          subtitle={`${selectedRecord.date} • Login & Logout record`}
          statusBadge={selectedRecord.status}
          statusVariant={selectedRecord.status === 'Completed' ? 'success' : 'info'}
          fields={[
            {
              label: 'Employee',
              value: selectedRecord.employee_name,
              avatar: {
                initials: selectedRecord.employee_name.slice(0, 2).toUpperCase(),
                subtitle: selectedRecord.employee_email,
                color: 'bg-[#0B6FDB]',
              },
            },
            { label: 'Date', value: selectedRecord.date },
            { label: 'Login Time', value: selectedRecord.login_time },
            { label: 'Logout Time', value: selectedRecord.logout_time || 'Not logged out' },
            { label: 'Total Duration', value: selectedRecord.total_hours || 'In progress' },
            { label: 'Source Device / App', value: selectedRecord.source },
            { label: 'Status', value: selectedRecord.status },
            { label: 'Notes', value: selectedRecord.notes || 'No remarks entered' },
          ]}
          summary={selectedRecord.notes || undefined}
          history={{
            status: selectedRecord.status,
            timestamp: selectedRecord.date,
            actor: selectedRecord.employee_name,
          }}
          footerMeta={`Record ID: ${selectedRecord.id}`}
          onEdit={() => {
            const rec = selectedRecord;
            setSelectedRecord(null);
            openEditModal(rec);
          }}
          onDelete={() => {
            const rec = selectedRecord;
            setSelectedRecord(null);
            if (rec.archived) {
              handleDeletePermanent(rec.id);
            } else {
              handleToggleArchive(rec.id);
            }
          }}
        />
      )}

      {/* Quick Punch Modal */}
      {isQuickPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0E1833] border border-[#E3E8F2] dark:border-[#1D2B52] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F2] dark:border-[#1D2B52]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0B6FDB]" />
                <h3 className="font-bold text-[#0E1730] dark:text-white text-base">Log In / Out Now</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickPunchOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPunch} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                  Select Employee
                </label>
                <select
                  value={punchEmployeeId}
                  onChange={(e) => setPunchEmployeeId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                  Action
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPunchType('LOGIN')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      punchType === 'LOGIN'
                        ? 'bg-[#0B6FDB] text-white border-[#0B6FDB] shadow-md shadow-[#0B6FDB]/20'
                        : 'border-[#E3E8F2] dark:border-[#1C3262] text-[#5B6787] dark:text-[#889DC7]'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Clock In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPunchType('LOGOUT')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      punchType === 'LOGOUT'
                        ? 'bg-[#0B6FDB] text-white border-[#0B6FDB] shadow-md shadow-[#0B6FDB]/20'
                        : 'border-[#E3E8F2] dark:border-[#1C3262] text-[#5B6787] dark:text-[#889DC7]'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Clock Out</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote login, client meeting"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8F2] dark:border-[#1D2B52]">
                <button
                  type="button"
                  onClick={() => setIsQuickPunchOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E3E8F2] dark:border-[#1C3262] text-[#5B6787] dark:text-[#889DC7] hover:bg-slate-50 dark:hover:bg-[#132244]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#0B6FDB] hover:bg-[#0957B0] text-white shadow-md shadow-[#0B6FDB]/20"
                >
                  Confirm Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Record Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0E1833] border border-[#E3E8F2] dark:border-[#1D2B52] rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F2] dark:border-[#1D2B52]">
              <h3 className="font-bold text-[#0E1730] dark:text-white text-base">
                {editingRecord ? 'Edit Login Record' : 'Add Login Record'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Employee
                  </label>
                  <select
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Login Time
                  </label>
                  <input
                    type="time"
                    value={formLoginTime}
                    onChange={(e) => setFormLoginTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Logout Time
                  </label>
                  <input
                    type="time"
                    value={formLogoutTime}
                    onChange={(e) => setFormLogoutTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Source
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  >
                    <option value="Web">Web Portal</option>
                    <option value="Mobile">Mobile App</option>
                    <option value="Biometric">Biometric Device</option>
                    <option value="Manual">Manual Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E1730] dark:text-white mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional notes or remarks"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8F2] dark:border-[#1D2B52]">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E3E8F2] dark:border-[#1C3262] text-[#5B6787] dark:text-[#889DC7] hover:bg-slate-50 dark:hover:bg-[#132244]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#0B6FDB] hover:bg-[#0957B0] text-white shadow-md shadow-[#0B6FDB]/20"
                >
                  {editingRecord ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginLogoutPage;

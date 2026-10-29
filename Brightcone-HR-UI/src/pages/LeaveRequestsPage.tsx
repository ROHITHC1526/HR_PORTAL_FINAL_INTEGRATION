import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Trash2,
  ArchiveRestore,
  Edit2,
  User,
} from 'lucide-react';
import type { Employee, LeaveType, LeaveRequest, LeaveBalanceItem } from '../types';
import { api } from '../services/api';
import { useLiveEmployees } from '../utils/employeeSync';
import { ApplyLeaveModal } from '../components/leave/ApplyLeaveModal';
import { LeaveReviewModal } from '../components/leave/LeaveReviewModal';
import { LeaveBalancesCard } from '../components/leave/LeaveBalancesCard';
import { DocDetailDrawer } from '../components/common/DocDetailDrawer';
import { useCurrentEmployee } from '../utils/useCurrentEmployee';

interface LeaveRequestsPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const LeaveRequestsPage: React.FC<LeaveRequestsPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const { employees: liveEmps } = useLiveEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { currentEmployee, currentEmployeeId } = useCurrentEmployee(employees);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Views & Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [archivedIds, setArchivedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('brightcone_archived_leave_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set<number>();
  });

  // Data states
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBalancesLoading, setIsBalancesLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRequest | null>(null);
  const [showBalancesCard, setShowBalancesCard] = useState<boolean>(false);

  const saveArchivedIds = (ids: Set<number>) => {
    setArchivedIds(new Set(ids));
    try {
      localStorage.setItem('brightcone_archived_leave_ids', JSON.stringify(Array.from(ids)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.fetchEmployees(), api.fetchLeaveTypes()]).then(([empRes, ltRes]) => {
      if (!isMounted) return;
      if (empRes.data && empRes.data.length > 0) {
        setEmployees(empRes.data);
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
      if (ltRes.data) {
        setLeaveTypes(ltRes.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [liveEmps]);

  // Sync selected employee ID to current logged-in employee on login, logout, or employee change
  useEffect(() => {
    if (currentEmployeeId) {
      setSelectedEmployeeId(currentEmployeeId);
    }
  }, [currentEmployeeId]);

  const loadBalances = useCallback(async () => {
    if (!selectedEmployeeId) return;
    setIsBalancesLoading(true);
    try {
      const res = await api.getLeaveBalances(selectedEmployeeId, selectedYear);
      if (res.data) {
        setBalances(res.data.balances);
      }
    } catch {
      // ignore
    } finally {
      setIsBalancesLoading(false);
    }
  }, [selectedEmployeeId, selectedYear]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const params: any = { year: selectedYear };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await api.fetchLeaveRequests(params);
      if (res.data) {
        setRequests(res.data);
      } else {
        setPageError(res.error || 'Failed to load leave requests');
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error fetching leave requests');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, statusFilter]);

  useEffect(() => {
    loadRequests();
    loadBalances();
  }, [loadRequests, loadBalances]);

  const handleToggleArchive = (req: LeaveRequest) => {
    const updated = new Set(archivedIds);
    if (updated.has(req.id)) {
      updated.delete(req.id);
      saveArchivedIds(updated);
      showSuccessToast?.(`Restored leave request #${req.id} for ${req.employee_name || 'employee'}.`);
    } else {
      updated.add(req.id);
      saveArchivedIds(updated);
      showSuccessToast?.(`Moved leave request #${req.id} for ${req.employee_name || 'employee'} to archive.`);
    }
  };

  const handleDeletePermanent = async (req: LeaveRequest) => {
    if (!window.confirm(`Permanently delete leave request #${req.id} for ${req.employee_name}? This cannot be undone.`)) {
      return;
    }
    try {
      await api.cancelLeaveRequest(req.id);
      const updated = new Set(archivedIds);
      updated.delete(req.id);
      saveArchivedIds(updated);
      showSuccessToast?.(`Leave request #${req.id} permanently deleted.`);
      loadRequests();
      loadBalances();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete leave request.');
    }
  };

  const handleExportCsv = () => {
    if (filteredRequests.length === 0) {
      alert('No records to export');
      return;
    }
    const headers = ['ID', 'Employee', 'Department', 'Leave Type', 'From Date', 'To Date', 'Days', 'Reason', 'Approver', 'Status'];
    const rows = filteredRequests.map((r) => [
      r.id,
      `"${r.employee_name || ''}"`,
      `"${r.employee_department || ''}"`,
      `"${r.leave_type_name || ''}"`,
      r.start_date,
      r.end_date,
      r.total_days,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      `"${r.reviewer_name || 'HR Admin'}"`,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leave_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast?.('Leave requests CSV exported successfully.');
  };

  // Filtered list
  const effectiveSearch = (tableSearch || searchQuery).toLowerCase().trim();
  const visibleRequests = useMemo(() => {
    return requests.filter((r) => {
      const isArchived = archivedIds.has(r.id);
      if (showArchived ? !isArchived : isArchived) return false;

      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      if (effectiveSearch) {
        const matchesName = (r.employee_name || '').toLowerCase().includes(effectiveSearch);
        const matchesDept = (r.employee_department || '').toLowerCase().includes(effectiveSearch);
        const matchesType = (r.leave_type_name || '').toLowerCase().includes(effectiveSearch);
        const matchesReason = (r.reason || '').toLowerCase().includes(effectiveSearch);
        const matchesId = String(r.id).includes(effectiveSearch);
        if (!matchesName && !matchesDept && !matchesType && !matchesReason && !matchesId) return false;
      }
      return true;
    });
  }, [requests, archivedIds, showArchived, statusFilter, effectiveSearch]);

  const filteredRequests = visibleRequests;

  // Stat calculations
  const nonArchivedRequests = requests.filter((r) => !archivedIds.has(r.id));
  const totalCount = nonArchivedRequests.length;
  const pendingCount = nonArchivedRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = nonArchivedRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = nonArchivedRequests.filter((r) => r.status === 'REJECTED').length;
  const archivedCount = archivedIds.size;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#647496]/20 text-[#94A3B8] border border-[#647496]/30">
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Section matching Screenshot 5 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B6FDB] dark:text-[#38BDF8] tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B6FDB] dark:bg-[#38BDF8]" />
            Shift
          </div>
          <h1 className="text-2xl font-bold text-[#0E1730] dark:text-white tracking-tight">
            Leave requests
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#889DC7] mt-1">
            View, approve, reject and manage employee leave applications.
          </p>
        </div>

        {/* Action Buttons matching Screenshot 5 */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
            onClick={() => setShowBalancesCard(!showBalancesCard)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0A1326] hover:bg-[#F8FAFD] dark:hover:bg-[#132244] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white transition-all shadow-xs cursor-pointer"
          >
            <User className="w-4 h-4 text-[#5B6787] dark:text-[#889DC7]" />
            <span>{showBalancesCard ? 'Hide Balances' : 'View Balances'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB] hover:bg-[#0957B0] text-white transition-all shadow-md shadow-[#0B6FDB]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add leave request</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total records */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/10 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0B6FDB] dark:text-[#38BDF8]">
              <FileText className="w-4 h-4" />
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
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Pending
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {pendingCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Awaiting review</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Approved
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {approvedCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Leave granted</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B6787] dark:text-[#889DC7]">
              Rejected
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#0E1730] dark:text-white font-['Sora']">
              {rejectedCount}
            </div>
            <p className="text-[11px] text-[#5B6787] dark:text-[#889DC7] mt-0.5">Declined requests</p>
          </div>
        </div>
      </div>

      {/* Optional Employee Balances Quick View */}
      {showBalancesCard && (
        <LeaveBalancesCard
          balances={balances}
          year={selectedYear}
          employeeName={employees.find((e) => e.id === selectedEmployeeId)?.name}
          isLoading={isBalancesLoading}
        />
      )}

      {/* Page Error Banner */}
      {pageError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-[#3B1219] border border-rose-200 dark:border-[#771D2D] text-xs text-rose-700 dark:text-[#F87171] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pageError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPageError(null)}
            className="text-rose-700 dark:text-[#F87171] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table Card Container matching Screenshot 5 */}
      <div className="bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[#E3E8F2] dark:border-[#1C3262] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-[#5B6787] dark:text-[#889DC7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leave requests..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white placeholder-[#8D97B0] focus:outline-hidden focus:ring-2 focus:ring-[#0B6FDB]/20 focus:border-[#0B6FDB]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-[#F8FAFD] dark:bg-[#060D1E] border border-[#E3E8F2] dark:border-[#1C3262] text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] cursor-pointer"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
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

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="p-16 text-center text-xs text-[#5B6787] dark:text-[#889DC7]">
              <div className="w-5 h-5 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading leave applications...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#5B6787] dark:text-[#889DC7]">
              <FileText className="w-8 h-8 text-[#94A3B8] dark:text-[#647496] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-[#0E1730] dark:text-white">No Leave Requests Found</p>
              <p className="mt-1">
                {tableSearch || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters or search query.'
                  : 'Click "+ Add leave request" above to submit a new leave request.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3E8F2] dark:border-[#1C3262] bg-[#F8FAFD]/60 dark:bg-[#060D1E]/40 text-[#5B6787] dark:text-[#889DC7] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">Approver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#1C3262]">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F8FAFD] dark:hover:bg-[#0F1C36] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B6FDB] to-[#0BA6CC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(req.employee_name || 'EM')
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0E1730] dark:text-white">
                            {req.employee_name || `Employee #${req.employee_id}`}
                          </div>
                          <div className="text-[10px] text-[#5B6787] dark:text-[#889DC7]">
                            {req.employee_department || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#0E1730] dark:text-white">
                      {req.leave_type_name || `Type #${req.leave_type_id}`}
                    </td>

                    <td className="py-3.5 px-4 text-[#5B6787] dark:text-[#889DC7]">
                      {req.start_date}
                    </td>

                    <td className="py-3.5 px-4 text-[#5B6787] dark:text-[#889DC7]">
                      {req.end_date}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#0E1730] dark:text-white">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </td>

                    <td className="py-3.5 px-4 text-[#5B6787] dark:text-[#889DC7]">
                      {req.reviewer_name || 'Ananya Rao'}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Eye icon at left */}
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(req)}
                          title="View details"
                          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] hover:text-[#0B6FDB] dark:hover:text-[#38BDF8]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {archivedIds.has(req.id) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(req)}
                              title="Restore"
                              className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 hover:text-amber-600"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePermanent(req)}
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
                              onClick={() => {
                                setReviewRequest(req);
                                setIsReviewModalOpen(true);
                              }}
                              title="Review request"
                              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] hover:text-[#0B6FDB] dark:hover:text-[#38BDF8]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(req)}
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
        </div>
      </div>

      {/* Doc Detail Drawer */}
      {selectedRecord && (
        <DocDetailDrawer
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.employee_name || `Employee #${selectedRecord.employee_id}`}
          subtitle={`${selectedRecord.leave_type_name || 'Leave application'} • Request #${selectedRecord.id}`}
          statusBadge={selectedRecord.status}
          statusVariant={
            selectedRecord.status === 'APPROVED'
              ? 'success'
              : selectedRecord.status === 'REJECTED'
              ? 'danger'
              : 'info'
          }
          fields={[
            {
              label: 'Employee',
              value: selectedRecord.employee_name || `Employee #${selectedRecord.employee_id}`,
              avatar: {
                initials: (selectedRecord.employee_name || 'EM')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase(),
                subtitle: selectedRecord.employee_department || undefined,
                color: 'bg-emerald-600',
              },
            },
            { label: 'Leave Type', value: selectedRecord.leave_type_name || 'Annual Leave' },
            { label: 'From Date', value: selectedRecord.start_date },
            { label: 'To Date', value: selectedRecord.end_date },
            { label: 'Working Days', value: `${selectedRecord.total_days} days` },
            { label: 'Reason for Leave', value: selectedRecord.reason || 'No detailed reason provided' },
            { label: 'Approver', value: selectedRecord.reviewer_name || 'Ananya Rao (HR Admin)' },
            { label: 'Application Status', value: selectedRecord.status },
          ]}
          summary={selectedRecord.reason || undefined}
          history={{
            status: selectedRecord.status,
            timestamp: selectedRecord.created_at || selectedRecord.start_date,
            actor: selectedRecord.employee_name || 'Employee',
          }}
          footerMeta={`Request #${selectedRecord.id} • Registered in database`}
          onEdit={() => {
            const req = selectedRecord;
            setSelectedRecord(null);
            setReviewRequest(req);
            setIsReviewModalOpen(true);
          }}
          onDelete={() => {
            const req = selectedRecord;
            setSelectedRecord(null);
            if (archivedIds.has(req.id)) {
              handleDeletePermanent(req);
            } else {
              handleToggleArchive(req);
            }
          }}
        />
      )}

      {/* Modal: Apply for Leave */}
      {isApplyModalOpen && (
        <ApplyLeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => {
            loadRequests();
            loadBalances();
            showSuccessToast?.('Leave request submitted successfully.');
          }}
          employees={employees}
          leaveTypes={leaveTypes}
          initialEmployeeId={selectedEmployeeId}
        />
      )}

      {/* Modal: Review Leave Request */}
      {isReviewModalOpen && reviewRequest && (
        <LeaveReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewRequest(null);
          }}
          onSuccess={() => {
            loadRequests();
            loadBalances();
            showSuccessToast?.(`Leave request #${reviewRequest.id} reviewed.`);
          }}
          request={reviewRequest}
          showSuccessToast={showSuccessToast}
        />
      )}
    </div>
  );
};

export default LeaveRequestsPage;

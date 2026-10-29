import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';
import type { Employee, Shift, SwapRequestDetail, SwapQuery } from '../../types';
import { api } from '../../services/api';
import { CreateSwapModal } from '../../components/swaps/CreateSwapModal';
import { SwapReviewModal } from '../../components/swaps/SwapReviewModal';
import { useCurrentEmployee } from '../../utils/useCurrentEmployee';

interface ShiftSwapPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const ShiftSwapPage: React.FC<ShiftSwapPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { currentEmployee, currentEmployeeId } = useCurrentEmployee(employees);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [requests, setRequests] = useState<SwapRequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequestDetail | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Load master employees and shifts
  useEffect(() => {
    let isMounted = true;
    Promise.all([api.fetchEmployees(), api.fetchShifts()]).then(([empRes, shiftRes]) => {
      if (!isMounted) return;
      if (empRes.data && empRes.data.length > 0) {
        setEmployees(empRes.data);
      }
      if (shiftRes.data) {
        setShifts(shiftRes.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected employee ID to current logged in employee
  useEffect(() => {
    if (currentEmployeeId) {
      setSelectedEmployeeId(currentEmployeeId);
    }
  }, [currentEmployeeId]);

  // Fetch Swap Requests
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const params: SwapQuery = {};
      if (activeView === 'EMPLOYEE' && selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await api.fetchSwapRequests(params);
      if (res.data) {
        setRequests(res.data);
      } else {
        setPageError(res.error || 'Failed to load shift swap requests');
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error fetching swap requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Cancel Request
  const handleCancelRequest = async (id: number) => {
    if (!window.confirm(`Are you sure you want to cancel shift swap request #${id}?`)) return;
    try {
      await api.cancelSwapRequest(id);
      showSuccessToast?.(`Shift swap request #${id} cancelled.`);
      loadRequests();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel swap request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return (
      r.requester_name.toLowerCase().includes(q) ||
      (r.target_employee_name && r.target_employee_name.toLowerCase().includes(q)) ||
      (r.reason && r.reason.toLowerCase().includes(q)) ||
      r.status.toLowerCase().includes(q) ||
      r.request_date.includes(q)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0BA6CC] tracking-wide uppercase">
                Shift Roster Schedule
              </span>
            </div>
            <h1 className="font-['Sora'] font-bold text-xl lg:text-2xl text-[#0B1527] dark:text-white">
              Shift Swap Requests
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] mt-1">
              Exchange scheduled shifts with team members. Approved swaps atomically update the weekly roster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadRequests()}
              className="p-2.5 rounded-xl border border-[#E3E8F2] dark:border-[#152347] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Refresh Swaps"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Propose Shift Swap</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E3E8F2] dark:border-[#152347]">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#64748B] dark:text-[#8D9BB8] uppercase tracking-wider">
              Total Proposals
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#0B1527] dark:text-white mt-1">
              {requests.length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Pending Review
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#F59E0B] mt-1">
              {pendingCount}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Approved & Swapped
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#10B981] mt-1">
              {approvedCount}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-3 h-3" />
              Rejected
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#EF4444] mt-1">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: View selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <button
              onClick={() => setActiveView('EMPLOYEE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'EMPLOYEE'
                  ? 'bg-[#0B6FDB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white'
              }`}
            >
              My Swap Requests
            </button>
            <button
              onClick={() => setActiveView('REVIEWER')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'REVIEWER'
                  ? 'bg-[#0B6FDB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white'
              }`}
            >
              Management Queue
            </button>
          </div>

          {activeView === 'EMPLOYEE' && employees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B] dark:text-[#8D9BB8]">As Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Filters and search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0B6FDB]/20 text-[#0BA6CC] border border-[#0BA6CC]/40'
                    : 'text-[#64748B] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search swap records..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white placeholder-[#8D9BB8]/50 focus:outline-hidden focus:border-[#0B6FDB]"
            />
            <Search className="w-3.5 h-3.5 text-[#8D9BB8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl shadow-sm overflow-hidden">
        {pageError && (
          <div className="p-4 bg-[#EF4444]/10 border-b border-[#EF4444]/30 flex items-center justify-between text-xs text-[#EF4444]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pageError}</span>
            </div>
            <button
              onClick={() => loadRequests()}
              className="px-2.5 py-1 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-xs text-[#64748B] dark:text-[#8D9BB8] gap-3">
            <div className="w-6 h-6 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin" />
            <span>Loading shift swap requests from PostgreSQL...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0BA6CC] mb-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h4 className="font-['Sora'] font-bold text-sm text-[#0B1527] dark:text-white">
              No Shift Swap Requests Found
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] max-w-sm mt-1">
              No shift swap proposals match the active view and filters.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB]/20 text-[#0BA6CC] border border-[#0BA6CC]/40 hover:bg-[#0B6FDB]/30 transition-all cursor-pointer"
            >
              + Propose First Swap
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#040A15]/60 border-b border-[#E3E8F2] dark:border-[#152347] text-[11px] font-bold text-[#54658B] dark:text-[#8D9BB8] uppercase tracking-wider">
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Target Colleague</th>
                  <th className="py-3 px-4">Shift Exchange</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F2]/60 dark:divide-[#152347]/60">
                {filteredRequests.map((r) => {
                  const isPending = r.status === 'PENDING';
                  const isApproved = r.status === 'APPROVED';
                  const isRejected = r.status === 'REJECTED';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Requester */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: r.requester_avatar_color || '#0B6FDB' }}
                          >
                            {r.requester_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0B1527] dark:text-white">
                              {r.requester_name}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#8D9BB8]">
                              Date: {r.request_date}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Colleague */}
                      <td className="py-3.5 px-4">
                        {r.target_employee_name ? (
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: r.target_employee_avatar_color || '#10B981' }}
                            >
                              {r.target_employee_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#0B1527] dark:text-white">
                                {r.target_employee_name}
                              </div>
                              <div className="text-[10px] text-[#64748B] dark:text-[#8D9BB8]">
                                Date: {r.target_date || r.request_date}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#8D9BB8] italic">Open to team</span>
                        )}
                      </td>

                      {/* Shift Exchange */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-[#0B1527] dark:text-white">
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B6FDB]/15 text-[#0BA6CC] border border-[#0BA6CC]/30 font-mono text-[11px]">
                            {r.source_shift_code || 'Source'}
                          </span>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-[#8D9BB8]" />
                          <span className="px-2 py-0.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono text-[11px]">
                            {r.target_shift_code || 'Target'}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[#0B1527] dark:text-[#C9D3EE] truncate" title={r.reason || ''}>
                          {r.reason || '—'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPending
                              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                              : isApproved
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                              : isRejected
                              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                              : 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/30'
                          }`}
                        >
                          {isPending && <Clock className="w-2.5 h-2.5" />}
                          {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {isRejected && <XCircle className="w-2.5 h-2.5" />}
                          {r.status}
                        </span>
                      </td>

                      {/* Review Details */}
                      <td className="py-3.5 px-4">
                        {r.reviewer_name ? (
                          <div>
                            <div className="text-[11px] font-medium text-[#0B1527] dark:text-white">
                              {r.reviewer_name}
                            </div>
                            {r.rejection_reason && (
                              <div
                                className="text-[10px] text-[#EF4444] truncate max-w-xs"
                                title={r.rejection_reason}
                              >
                                {r.rejection_reason}
                              </div>
                            )}
                            {r.reviewed_at && (
                              <div className="text-[9px] text-[#8D9BB8]">
                                {r.reviewed_at.split('T')[0]}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8D9BB8] text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && activeView === 'REVIEWER' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(r);
                                setIsReviewModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#0B6FDB]/20 text-[#0BA6CC] border border-[#0BA6CC]/40 hover:bg-[#0B6FDB]/30 transition-all cursor-pointer"
                            >
                              Review
                            </button>
                          )}
                          {isPending && activeView === 'EMPLOYEE' && (
                            <button
                              onClick={() => handleCancelRequest(r.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                            >
                              Cancel
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
      </div>

      {/* Modals */}
      <CreateSwapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadRequests}
        employees={employees}
        shifts={shifts}
        initialRequesterId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <SwapReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={loadRequests}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default ShiftSwapPage;

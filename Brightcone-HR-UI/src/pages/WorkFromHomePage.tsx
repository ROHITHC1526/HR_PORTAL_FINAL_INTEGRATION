import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  Calendar,
} from 'lucide-react';
import type { Employee, WorkFromHomeRequest, WfhQuery } from '../types';
import { api } from '../services/api';
import { ApplyWfhModal } from '../components/wfh/ApplyWfhModal';
import { WfhReviewModal } from '../components/wfh/WfhReviewModal';
import { useCurrentEmployee } from '../utils/useCurrentEmployee';

interface WorkFromHomePageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const WorkFromHomePage: React.FC<WorkFromHomePageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { currentEmployee, currentEmployeeId } = useCurrentEmployee(employees);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [requests, setRequests] = useState<WorkFromHomeRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkFromHomeRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Fetch employees
  useEffect(() => {
    let isMounted = true;
    api.fetchEmployees().then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setEmployees(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected employee ID to current logged-in employee
  useEffect(() => {
    if (currentEmployeeId) {
      setSelectedEmployeeId(currentEmployeeId);
    }
  }, [currentEmployeeId]);

  // Fetch WFH requests
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const params: WfhQuery = {};
      if (activeView === 'EMPLOYEE' && selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await api.fetchWfhRequests(params);
      if (res.data) {
        setRequests(res.data);
      } else {
        setPageError(res.error || 'Failed to load WFH requests');
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error fetching WFH requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Handle Cancel
  const handleCancelRequest = async (id: number) => {
    if (!window.confirm(`Are you sure you want to cancel WFH request #${id}?`)) return;
    try {
      await api.cancelWfhRequest(id);
      showSuccessToast?.(`WFH request #${id} cancelled.`);
      loadRequests();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  // Filtered requests by table search query
  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return (
      r.employee_name.toLowerCase().includes(q) ||
      r.employee_department.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.start_date.includes(q) ||
      r.end_date.includes(q)
    );
  });

  // Calculate Metrics
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0BA6CC] tracking-wide uppercase">
                Remote Workplace Policy
              </span>
            </div>
            <h1 className="font-['Sora'] font-bold text-xl lg:text-2xl text-[#0B1527] dark:text-white">
              Work From Home Tracker
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] mt-1">
              Submit, track, and manage employee remote working requests with live PostgreSQL persistence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadRequests()}
              className="p-2.5 rounded-xl border border-[#E3E8F2] dark:border-[#152347] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Refresh WFH Requests"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request WFH</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E3E8F2] dark:border-[#152347]">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#64748B] dark:text-[#8D9BB8] uppercase tracking-wider">
              Total Records
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
              Approved
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

      {/* Control Bar: View Mode, Employee Selector, Status Filters, Search */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* View Switcher & Employee selector */}
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
              My Requests
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
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
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

          {/* Search box */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search WFH records..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white placeholder-[#8D9BB8]/50 focus:outline-hidden focus:border-[#0B6FDB]"
            />
            <Search className="w-3.5 h-3.5 text-[#8D9BB8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
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
            <span>Loading Work From Home records from PostgreSQL...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0BA6CC] mb-3">
              <Home className="w-6 h-6" />
            </div>
            <h4 className="font-['Sora'] font-bold text-sm text-[#0B1527] dark:text-white">
              No Work From Home Requests
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] max-w-sm mt-1">
              {tableSearch || statusFilter !== 'ALL'
                ? 'No requests match the active search or status filters.'
                : 'No remote working requests have been submitted yet.'}
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB]/20 text-[#0BA6CC] border border-[#0BA6CC]/40 hover:bg-[#0B6FDB]/30 transition-all cursor-pointer"
            >
              + Create First Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#040A15]/60 border-b border-[#E3E8F2] dark:border-[#152347] text-[11px] font-bold text-[#54658B] dark:text-[#8D9BB8] uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Dates</th>
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
                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: r.avatar_color || '#0B6FDB' }}
                          >
                            {r.employee_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0B1527] dark:text-white">
                              {r.employee_name}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#8D9BB8]">
                              {r.employee_department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#0B1527] dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-[#0BA6CC]" />
                          <span>
                            {r.start_date === r.end_date
                              ? r.start_date
                              : `${r.start_date} → ${r.end_date}`}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#8D9BB8]">
                          Submitted {r.created_at ? r.created_at.split('T')[0] : 'recently'}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[#0B1527] dark:text-[#C9D3EE] truncate" title={r.reason}>
                          {r.reason}
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
                                Reason: {r.rejection_reason}
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
      <ApplyWfhModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={loadRequests}
        employees={employees}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <WfhReviewModal
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

export default WorkFromHomePage;

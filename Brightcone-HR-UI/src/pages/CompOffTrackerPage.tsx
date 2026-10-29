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
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react';
import type {
  Employee,
  CompOffBalance,
  CompOffEntitlement,
  CompOffRequest,
  CompOffQuery,
} from '../types';
import { api } from '../services/api';
import { ApplyCompOffModal } from '../components/comp_off/ApplyCompOffModal';
import { GrantEntitlementModal } from '../components/comp_off/GrantEntitlementModal';
import { CompOffReviewModal } from '../components/comp_off/CompOffReviewModal';
import { useCurrentEmployee } from '../utils/useCurrentEmployee';

interface CompOffTrackerPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const CompOffTrackerPage: React.FC<CompOffTrackerPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { currentEmployee, currentEmployeeId } = useCurrentEmployee(employees);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [activeSubTab, setActiveSubTab] = useState<'REQUESTS' | 'ENTITLEMENTS'>('REQUESTS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Data states
  const [balance, setBalance] = useState<CompOffBalance | null>(null);
  const [requests, setRequests] = useState<CompOffRequest[]>([]);
  const [entitlements, setEntitlements] = useState<CompOffEntitlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<CompOffRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Load employees
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

  // Sync selected employee ID to current logged in employee
  useEffect(() => {
    if (currentEmployeeId) {
      setSelectedEmployeeId(currentEmployeeId);
    }
  }, [currentEmployeeId]);

  // Fetch balance for selected employee
  const loadBalance = useCallback(async () => {
    if (!selectedEmployeeId) return;
    try {
      const res = await api.getCompOffBalance(selectedEmployeeId);
      if (res.data) {
        setBalance(res.data);
      }
    } catch {
      // ignore
    }
  }, [selectedEmployeeId]);

  // Fetch Requests & Entitlements
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const params: CompOffQuery = {};
      if (activeView === 'EMPLOYEE' && selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const [reqRes, entRes] = await Promise.all([
        api.fetchCompOffRequests(params),
        api.fetchCompOffEntitlements(params),
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (entRes.data) setEntitlements(entRes.data);

      if (activeView === 'EMPLOYEE') {
        loadBalance();
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error fetching comp-off records');
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, statusFilter, loadBalance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cancel Request
  const handleCancelRequest = async (id: number) => {
    if (!window.confirm(`Are you sure you want to cancel comp-off request #${id}?`)) return;
    try {
      await api.cancelCompOffRequest(id);
      showSuccessToast?.(`Comp-off request #${id} cancelled.`);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return (
      r.employee_name.toLowerCase().includes(q) ||
      r.employee_department.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.requested_date.includes(q)
    );
  });

  const filteredEntitlements = entitlements.filter((e) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return (
      e.employee_name.toLowerCase().includes(q) ||
      e.employee_department.toLowerCase().includes(q) ||
      e.reason.toLowerCase().includes(q) ||
      e.status.toLowerCase().includes(q) ||
      e.earned_date.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0BA6CC] tracking-wide uppercase">
                Overtime Compensatory Balance
              </span>
            </div>
            <h1 className="font-['Sora'] font-bold text-xl lg:text-2xl text-[#0B1527] dark:text-white">
              Comp-Off Tracker
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] mt-1">
              Track earned compensatory leave from weekend or emergency shifts, view live balances, and submit redemption requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="p-2.5 rounded-xl border border-[#E3E8F2] dark:border-[#152347] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>+ Grant Comp-Off</span>
            </button>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Comp-Off</span>
            </button>
          </div>
        </div>

        {/* Balance Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E3E8F2] dark:border-[#152347]">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0B6FDB]/15 to-[#0BA6CC]/15 border border-[#0BA6CC]/40">
            <div className="text-[10px] font-bold text-[#0BA6CC] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Available Balance
            </div>
            <div className="text-xl font-['Sora'] font-extrabold text-[#0B1527] dark:text-white mt-1">
              {balance ? balance.available_days.toFixed(1) : '0.0'}{' '}
              <span className="text-xs font-normal text-[#64748B] dark:text-[#8D9BB8]">days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3 h-3" />
              Total Earned
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#0B1527] dark:text-white mt-1">
              {balance ? balance.total_earned_days.toFixed(1) : '0.0'}{' '}
              <span className="text-xs font-normal text-[#64748B] dark:text-[#8D9BB8]">days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#64748B] dark:text-[#8D9BB8] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Used / Redeemed
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#0B1527] dark:text-white mt-1">
              {balance ? balance.used_days.toFixed(1) : '0.0'}{' '}
              <span className="text-xs font-normal text-[#64748B] dark:text-[#8D9BB8]">days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <div className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Pending Usage
            </div>
            <div className="text-lg font-['Sora'] font-bold text-[#F59E0B] mt-1">
              {balance ? balance.pending_days.toFixed(1) : '0.0'}{' '}
              <span className="text-xs font-normal text-[#64748B] dark:text-[#8D9BB8]">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Subtab Switcher, View Switcher, Filters */}
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Tab Switcher & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subtab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347]">
            <button
              onClick={() => setActiveSubTab('REQUESTS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'REQUESTS'
                  ? 'bg-[#0B6FDB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white'
              }`}
            >
              Usage Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ENTITLEMENTS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'ENTITLEMENTS'
                  ? 'bg-[#0B6FDB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0B1527] dark:hover:text-white'
              }`}
            >
              Earned History ({entitlements.length})
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] dark:text-[#8D9BB8]">View as:</span>
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value as 'EMPLOYEE' | 'REVIEWER')}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
            >
              <option value="EMPLOYEE">Individual Employee</option>
              <option value="REVIEWER">All Employees (Manager)</option>
            </select>
          </div>

          {activeView === 'EMPLOYEE' && employees.length > 0 && (
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
          )}
        </div>

        {/* Right: Status Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
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
              placeholder="Search records..."
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
              onClick={() => loadData()}
              className="px-2.5 py-1 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-xs text-[#64748B] dark:text-[#8D9BB8] gap-3">
            <div className="w-6 h-6 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin" />
            <span>Loading comp-off records from PostgreSQL...</span>
          </div>
        ) : activeSubTab === 'REQUESTS' ? (
          /* Usage Requests Table */
          filteredRequests.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 border border-[#0B6FDB]/20 flex items-center justify-center text-[#0BA6CC] mb-3">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h4 className="font-['Sora'] font-bold text-sm text-[#0B1527] dark:text-white">
                No Comp-Off Usage Requests
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] max-w-sm mt-1">
                No requests found matching the current view and filters.
              </p>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB]/20 text-[#0BA6CC] border border-[#0BA6CC]/40 hover:bg-[#0B6FDB]/30 transition-all cursor-pointer"
              >
                + Apply for Comp-Off
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#040A15]/60 border-b border-[#E3E8F2] dark:border-[#152347] text-[11px] font-bold text-[#54658B] dark:text-[#8D9BB8] uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Date</th>
                    <th className="py-3 px-4">Days</th>
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

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-[#0B1527] dark:text-white">
                            <Calendar className="w-3.5 h-3.5 text-[#0BA6CC]" />
                            <span>{r.requested_date}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#0B1527] dark:text-white">
                          {r.days_requested} day{r.days_requested > 1 ? 's' : ''}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-[#0B1527] dark:text-[#C9D3EE] truncate" title={r.reason}>
                            {r.reason}
                          </p>
                        </td>

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
          )
        ) : (
          /* Earned Entitlements Table */
          filteredEntitlements.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-['Sora'] font-bold text-sm text-[#0B1527] dark:text-white">
                No Earned Entitlements Found
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8] max-w-sm mt-1">
                No compensatory hours have been credited for this selection yet.
              </p>
              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 hover:bg-[#10B981]/30 transition-all cursor-pointer"
              >
                + Grant Entitlement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#040A15]/60 border-b border-[#E3E8F2] dark:border-[#152347] text-[11px] font-bold text-[#54658B] dark:text-[#8D9BB8] uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Earned Date</th>
                    <th className="py-3 px-4">Days Credited</th>
                    <th className="py-3 px-4">Work / Reason</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8F2]/60 dark:divide-[#152347]/60">
                  {filteredEntitlements.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: e.avatar_color || '#10B981' }}
                          >
                            {e.employee_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0B1527] dark:text-white">
                              {e.employee_name}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#8D9BB8]">
                              {e.employee_department}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#0B1527] dark:text-white">
                        {e.earned_date}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-['Sora'] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-lg border border-[#10B981]/30">
                          +{e.days_earned} day{e.days_earned > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-[#0B1527] dark:text-[#C9D3EE] truncate" title={e.reason}>
                          {e.reason}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B] dark:text-[#8D9BB8]">
                        {e.expiry_date ? e.expiry_date : 'Never (Perpetual)'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <ApplyCompOffModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={loadData}
        employees={employees}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <GrantEntitlementModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSuccess={loadData}
        employees={employees}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <CompOffReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={loadData}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default CompOffTrackerPage;

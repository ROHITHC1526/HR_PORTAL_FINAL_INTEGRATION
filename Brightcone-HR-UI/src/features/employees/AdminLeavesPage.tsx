import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { EmployeeLeave } from '../../types/employee.types';
import { Calendar, CheckCircle2, XCircle, Clock, Check, AlertCircle } from 'lucide-react';

export const AdminLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchLeaves = async () => {
    try {
      // Pass 'all' to retrieve all employees' leaves
      const data = await employeesApi.getLeaves('all');
      setLeaves(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await employeesApi.updateLeaveStatus(id, newStatus);
      setToastMessage(`Leave request ${id} marked as ${newStatus}!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchLeaves();
    } catch (err) {
      alert('Failed to update leave status: ' + err);
    }
  };

  const filteredLeaves = leaves.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const pendingCount = leaves.filter((l) => l.status.toLowerCase() === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status.toLowerCase() === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status.toLowerCase() === 'rejected').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="page-badge page-badge-people">
            <span className="page-badge-dot" />
            <span>PEOPLE • HR ADMIN</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leave approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company-wide leave applications and approval management.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{leaves.length}</div>
          <div className="text-xs text-slate-400 mt-1">All time applications</div>
        </div>
        <div className="metric-card border-amber-300 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Action</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-xs text-amber-600/70 mt-1">Awaiting decision</div>
        </div>
        <div className="metric-card border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</div>
          <div className="text-xs text-emerald-600/70 mt-1">Granted leaves</div>
        </div>
        <div className="metric-card border-rose-300 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rejected</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{rejectedCount}</div>
          <div className="text-xs text-rose-600/70 mt-1">Declined leaves</div>
        </div>
      </div>

      {/* Company Leave Approvals Table */}
      <div className="data-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>REQUEST ID</th>
              <th>EMPLOYEE</th>
              <th>LEAVE TYPE</th>
              <th>DATES</th>
              <th>DAYS</th>
              <th>REASON</th>
              <th>STATUS</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Loading company leave requests...
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  No leave requests found for selected filter.
                </td>
              </tr>
            ) : (
              filteredLeaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {item.id}
                  </td>
                  <td className="font-semibold text-slate-900 dark:text-white">
                    {item.employee_id === 'BC-1038' ? 'Rahul Varma (BC-1038)' : item.employee_id}
                  </td>
                  <td>{item.leave_type}</td>
                  <td className="text-xs">
                    {item.from_date} <span className="text-slate-400">to</span> {item.to_date}
                  </td>
                  <td className="font-bold">{item.days} days</td>
                  <td className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate" title={item.reason}>
                    {item.reason || '—'}
                  </td>
                  <td>
                    <span
                      className={`badge-pill ${
                        item.status.toLowerCase() === 'approved'
                          ? 'badge-approved'
                          : item.status.toLowerCase() === 'pending'
                          ? 'badge-pending'
                          : 'badge-rejected'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status.toLowerCase() !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Approved')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-pointer flex items-center gap-1 transition"
                          title="Approve leave"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {item.status.toLowerCase() !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer flex items-center gap-1 transition"
                          title="Reject leave"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
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
    </div>
  );
};

export default AdminLeavesPage;

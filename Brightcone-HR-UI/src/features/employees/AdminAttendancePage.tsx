import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { EmployeeAttendance } from '../../types/employee.types';
import { Clock, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export const AdminAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      // Pass 'all' to retrieve all employees' attendance logs
      const data = await employeesApi.getAttendance('all');
      setRecords(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const presentCount = records.filter((r) => r.status.toLowerCase().includes('present')).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="page-badge page-badge-people">
            <span className="page-badge-dot" />
            <span>PEOPLE • HR ADMIN</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company-wide timesheet records, daily punches, and working hours.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Logs</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{records.length}</div>
          <div className="text-xs text-slate-400 mt-1">Recorded punches</div>
        </div>
        <div className="metric-card border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Present Logs</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</div>
          <div className="text-xs text-emerald-600/70 mt-1">Active punches</div>
        </div>
        <div className="metric-card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Shift</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">8h 30m</div>
          <div className="text-xs text-slate-400 mt-1">Standard office hours</div>
        </div>
        <div className="metric-card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grace Limit</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">3 / mo</div>
          <div className="text-xs text-slate-400 mt-1">Late arrival policy</div>
        </div>
      </div>

      {/* Attendance Logs Data Table */}
      <div className="data-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>LOG ID</th>
              <th>EMPLOYEE</th>
              <th>DATE</th>
              <th>CLOCK IN</th>
              <th>CLOCK OUT</th>
              <th>WORK HOURS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Loading attendance logs...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {r.id}
                  </td>
                  <td className="font-semibold text-slate-900 dark:text-white">
                    {r.employee_id === 'BC-1038' ? 'Rahul Varma (BC-1038)' : r.employee_id}
                  </td>
                  <td className="font-mono text-xs">{r.date}</td>
                  <td className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {r.punch_in || '—'}
                  </td>
                  <td className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {r.punch_out || '—'}
                  </td>
                  <td className="font-bold text-slate-900 dark:text-white">
                    {r.work_hours || 'In Progress'}
                  </td>
                  <td>
                    <span
                      className={`badge-pill ${
                        r.status.toLowerCase().includes('present')
                          ? 'badge-approved'
                          : r.status.toLowerCase().includes('leave')
                          ? 'badge-pending'
                          : 'badge-applied'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{r.status}</span>
                    </span>
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

export default AdminAttendancePage;

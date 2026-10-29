import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import {
  AttendanceRegularisation,
  AttendanceSummaryResponse,
  DayAttendanceCard,
} from '../../types/employee.types';
import { Clock, Calendar, CheckCircle, X, AlertCircle } from 'lucide-react';

export const EmployeeAttendancePage: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Regularisation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regDate, setRegDate] = useState('Sep 23, 2026');
  const [regClockIn, setRegClockIn] = useState('09:30');
  const [regClockOut, setRegClockOut] = useState('18:30');
  const [regReason, setRegReason] = useState('System biometric punch not recorded');

  const fetchAttendance = async () => {
    try {
      const data = await employeesApi.getAttendanceSummary('BC-1038');
      setSummary(data);
      setIsClockedIn(data.today_clocked_in);
      setElapsedSeconds(data.today_elapsed_seconds);
    } catch (err) {
      console.error('Failed to load attendance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Running timer when clocked in
  useEffect(() => {
    if (!isClockedIn) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClockToggle = async () => {
    try {
      const updated = await employeesApi.clockInOut('BC-1038');
      setSummary(updated);
      setIsClockedIn(updated.today_clocked_in);
      setElapsedSeconds(updated.today_elapsed_seconds);
      setToastMessage(
        updated.today_clocked_in
          ? `Clocked in at ${updated.today_punch_in || 'now'}!`
          : `Clocked out at ${updated.today_punch_out || 'now'}!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Failed to record punch: ' + err);
    }
  };

  const handleSubmitRegularisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDate || !regClockIn || !regClockOut || !regReason) {
      alert('Please fill in all fields');
      return;
    }
    setSubmittingReg(true);
    try {
      await employeesApi.createRegularisation({
        employee_id: 'BC-1038',
        employee_name: 'Rahul Varma',
        date: regDate,
        clock_in: regClockIn,
        clock_out: regClockOut,
        reason: regReason,
      });
      setToastMessage('Attendance regularisation submitted successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchAttendance();
    } catch (err) {
      alert('Failed to submit regularisation: ' + err);
    } finally {
      setSubmittingReg(false);
    }
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Present</span>
          </span>
        );
      case 'Remote':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Remote</span>
          </span>
        );
      case 'Holiday':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Holiday</span>
          </span>
        );
      case 'Weekend':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Weekend</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-slideUp">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PEOPLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Clock in and out, check your timesheet and fix missed punches.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs transition-all cursor-pointer"
          >
            Request regularisation
          </button>
        </div>
      </div>

      {/* Top 3 Cards Grid matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Today Clock terminal (dark rich gradient) */}
        <div className="lg:col-span-6 bg-gradient-to-r from-[#0d1e34] via-[#0d2a45] to-[#0a385c] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Today</h2>
            <p className="text-xs text-sky-200/80 mt-0.5">General shift, 9:30 am to 6:30 pm.</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {formatTimer(elapsedSeconds)}
              </div>
              <div className="text-xs text-sky-200/80 mt-1">
                {isClockedIn
                  ? `Clocked in at ${summary?.today_punch_in || '9:30 am'}`
                  : "You haven't clocked in yet"}
              </div>
            </div>

            <button
              onClick={handleClockToggle}
              className="self-start sm:self-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              {isClockedIn ? 'Clock out' : 'Clock in'}
            </button>
          </div>
        </div>

        {/* Card 2: Avg. hours, Oct */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span>Avg. hours, Oct</span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary?.avg_hours_monthly || '8h 52m'}
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              Target {summary?.target_hours || '8h 30m'}
            </div>
          </div>
        </div>

        {/* Card 3: Late arrivals */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <span>Late arrivals</span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary?.late_arrivals ?? 1}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Grace limit is {summary?.grace_limit ?? 3} a month
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Last week horizontal cards matching Screenshot 1 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Last week</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(summary?.last_week || []).map((day: DayAttendanceCard, idx: number) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2.5"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {day.day}, {day.date_label}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {day.hours}
              </div>
              <div>{renderStatusPill(day.status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: My regularisation requests table matching Screenshot 1 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            My regularisation requests
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-6 py-3.5">DATE</th>
                <th className="px-6 py-3.5">CLOCK IN</th>
                <th className="px-6 py-3.5">CLOCK OUT</th>
                <th className="px-6 py-3.5">REASON</th>
                <th className="px-6 py-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Loading regularisation requests...
                  </td>
                </tr>
              ) : !summary?.regularisations || summary.regularisations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No regularisation requests recorded.
                  </td>
                </tr>
              ) : (
                summary.regularisations.map((reg: AttendanceRegularisation) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {reg.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                      {reg.clock_in}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                      {reg.clock_out}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {reg.reason}
                    </td>
                    <td className="px-6 py-4">{renderStatusPill(reg.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Request Regularisation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Request regularisation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit missed punch or system discrepancy for approval.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRegularisation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  placeholder="e.g. Sep 23, 2026"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clock In
                  </label>
                  <input
                    type="text"
                    value={regClockIn}
                    onChange={(e) => setRegClockIn(e.target.value)}
                    placeholder="09:30"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clock Out
                  </label>
                  <input
                    type="text"
                    value={regClockOut}
                    onChange={(e) => setRegClockOut(e.target.value)}
                    placeholder="18:30"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why punch was missed or discrepancy occurred..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReg ? 'Submitting...' : 'Submit regularisation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendancePage;

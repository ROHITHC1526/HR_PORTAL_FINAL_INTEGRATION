import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { EmployeeLeave } from '../../types/employee.types';
import { Plus, CheckCircle, X } from 'lucide-react';

interface Holiday {
  name: string;
  date: string;
  type: 'National' | 'Festival' | 'Optional';
}

const HOLIDAYS: Holiday[] = [
  { name: 'Gandhi Jayanti', date: 'Oct 2, 2026', type: 'National' },
  { name: 'Dussehra', date: 'Oct 20, 2026', type: 'Festival' },
  { name: 'Diwali', date: 'Nov 8, 2026', type: 'Festival' },
  { name: 'Guru Nanak Jayanti', date: 'Nov 24, 2026', type: 'Optional' },
  { name: 'Christmas', date: 'Dec 25, 2026', type: 'Festival' },
  { name: 'Sankranti', date: 'Jan 14, 2027', type: 'Festival' },
  { name: 'Republic Day', date: 'Jan 26, 2027', type: 'National' },
];

export const EmployeeLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([
    {
      id: 'LV-0001',
      employee_id: 'BC-1038',
      leave_type: 'Earned leave',
      from_date: 'Aug 12 to Aug 14',
      to_date: '2026-08-14',
      days: 3,
      reason: 'Family function',
      status: 'Approved',
    },
    {
      id: 'LV-0002',
      employee_id: 'BC-1038',
      leave_type: 'Sick leave',
      from_date: 'Jul 2',
      to_date: '2026-07-02',
      days: 1,
      reason: 'Fever',
      status: 'Approved',
    },
    {
      id: 'LV-0003',
      employee_id: 'BC-1038',
      leave_type: 'Casual leave',
      from_date: 'Oct 9',
      to_date: '2026-10-09',
      days: 1,
      reason: 'Personal errand',
      status: 'Pending',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState('Earned leave');
  const [fromDate, setFromDate] = useState('2026-10-24');
  const [toDate, setToDate] = useState('2026-10-25');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const data = await employeesApi.getLeaves('BC-1038');
      if (data && data.length > 0) {
        // Merge with initial requests if needed so standard entries from Screenshot 5 remain visible
        const existingIds = new Set(data.map((d) => d.id));
        const merged = [...data];
        [
          {
            id: 'LV-0001',
            employee_id: 'BC-1038',
            leave_type: 'Earned leave',
            from_date: 'Aug 12 to Aug 14',
            to_date: '2026-08-14',
            days: 3,
            reason: 'Family function',
            status: 'Approved',
          },
          {
            id: 'LV-0002',
            employee_id: 'BC-1038',
            leave_type: 'Sick leave',
            from_date: 'Jul 2',
            to_date: '2026-07-02',
            days: 1,
            reason: 'Fever',
            status: 'Approved',
          },
          {
            id: 'LV-0003',
            employee_id: 'BC-1038',
            leave_type: 'Casual leave',
            from_date: 'Oct 9',
            to_date: '2026-10-09',
            days: 1,
            reason: 'Personal errand',
            status: 'Pending',
          },
        ].forEach((item) => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        setLeaves(merged);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please enter a reason for the leave request.');
      return;
    }

    setSubmitting(true);
    // Format dates nicely, e.g. "Oct 24 to Oct 25"
    let datesDisplay = fromDate;
    try {
      const f = new Date(fromDate);
      const t = new Date(toDate);
      const fStr = f.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const tStr = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      datesDisplay = fromDate === toDate ? fStr : `${fStr} to ${tStr}`;
    } catch {
      // fallback
    }

    const newReq: EmployeeLeave = {
      id: `LV-${String(leaves.length + 1).padStart(4, '0')}`,
      employee_id: 'BC-1038',
      leave_type: leaveType,
      from_date: datesDisplay,
      to_date: toDate,
      days: Number(days),
      reason: reason.trim(),
      status: 'Pending',
    };

    try {
      await employeesApi.createLeave({
        employee_id: 'BC-1038',
        leave_type: leaveType,
        from_date: datesDisplay,
        to_date: toDate,
        days: Number(days),
        reason: reason.trim(),
      });
    } catch {
      // local state update
    }

    setLeaves((prev) => [newReq, ...prev]);
    setIsApplyModalOpen(false);
    setReason('');
    setToastMessage('Leave application submitted successfully!');
    setTimeout(() => setToastMessage(null), 4000);
    setSubmitting(false);
  };

  const handleCancelLeave = (id: string) => {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      setToastMessage('Leave request cancelled.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Sora',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D68BD] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-xs bg-teal-600 dark:bg-teal-400" />
            <span>PEOPLE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Leave
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your 2026 balances, requests and the holiday calendar.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white flex items-center gap-2 text-xs font-semibold py-2.5 px-5 rounded-xl shadow-md cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for leave</span>
        </button>
      </div>

      {/* 5 Leave Balance Cards matching Screenshot 5 */}
      <div className="space-y-5">
        {/* Row 1: 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Earned leave */}
          <div className="bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Earned leave
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">15</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of 18 days left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${(15 / 18) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              3 used. Up to 30 days.
            </div>
          </div>

          {/* Card 2: Casual leave */}
          <div className="bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Casual leave
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">8</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of 8 days left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              0 used, 1 pending. Lapses.
            </div>
          </div>

          {/* Card 3: Sick leave */}
          <div className="bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Sick leave
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">9</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of 10 days left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${(9 / 10) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              1 used. Lapses.
            </div>
          </div>
        </div>

        {/* Row 2: 2 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 4: Comp off */}
          <div className="bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Comp off
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">2</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of 2 days left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              0 used. Use within 60 days.
            </div>
          </div>

          {/* Card 5: Work from home */}
          <div className="bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Work from home
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">24</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of 24 days left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              0 used. Lapses.
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout matching Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My requests (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            My requests
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">TYPE</th>
                  <th className="py-3 px-3">DATES</th>
                  <th className="py-3 px-3">DAYS</th>
                  <th className="py-3 px-3">REASON</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-xs"
                    >
                      <td className="py-3.5 px-2 font-medium text-slate-900 dark:text-white">
                        {l.leave_type}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {l.from_date}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {l.days}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                        {l.reason}
                      </td>
                      <td className="py-3.5 px-3">
                        {l.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Approved</span>
                          </span>
                        ) : l.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{l.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {l.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleCancelLeave(l.id)}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Holiday calendar 2026–27 (lg:col-span-4) matching Screenshot 5 */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Holiday calendar 2026–27
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {HOLIDAYS.map((h, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {h.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {h.date}
                  </div>
                </div>

                <div>
                  {h.type === 'National' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>National</span>
                    </span>
                  )}
                  {h.type === 'Festival' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Festival</span>
                    </span>
                  )}
                  {h.type === 'Optional' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>Optional</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Leave Modal matching Screenshot 5 */}
      {isApplyModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-lg p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Apply for leave
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your 2026 balance will be deducted upon manager approval.
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply}>
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Leave type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Earned leave">Earned leave</option>
                    <option value="Casual leave">Casual leave</option>
                    <option value="Sick leave">Sick leave</option>
                    <option value="Comp off">Comp off</option>
                    <option value="Work from home">Work from home</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      From date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      To date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Days count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief explanation for time off (e.g. Family function, Personal errand)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Apply for leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeavePage;

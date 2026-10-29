import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowLeftRight, Send, Loader2, Sparkles } from 'lucide-react';
import type { Employee, CompOffBalance, CreateCompOffRequestPayload } from '../../types';
import { api } from '../../services/api';

interface ApplyCompOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  initialEmployeeId?: number;
  showSuccessToast?: (msg: string) => void;
}

export const ApplyCompOffModal: React.FC<ApplyCompOffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  initialEmployeeId,
  showSuccessToast,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [daysRequested, setDaysRequested] = useState<number>(1.0);
  const [reason, setReason] = useState<string>('');
  const [balance, setBalance] = useState<CompOffBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setRequestedDate(today);
      setDaysRequested(1.0);
      setReason('');
      setFormError(null);
      const defaultEmp = initialEmployeeId || (employees.length > 0 ? employees[0].id : 0);
      setEmployeeId(defaultEmp);
    }
  }, [isOpen, initialEmployeeId, employees]);

  useEffect(() => {
    if (isOpen && employeeId) {
      setIsLoadingBalance(true);
      api.getCompOffBalance(employeeId).then((res) => {
        setIsLoadingBalance(false);
        if (res.data) {
          setBalance(res.data);
        }
      });
    }
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  const usableBalance = balance ? (balance.available_days - balance.pending_days) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!employeeId) {
      setFormError('Please select an employee.');
      return;
    }
    if (!requestedDate) {
      setFormError('Please select a date.');
      return;
    }
    if (daysRequested <= 0) {
      setFormError('Days requested must be greater than zero.');
      return;
    }
    if (daysRequested > usableBalance) {
      setFormError(
        `Requested days (${daysRequested}) exceed your usable comp-off balance (${usableBalance.toFixed(1)} days).`
      );
      return;
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason for taking comp-off.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateCompOffRequestPayload = {
        employee_id: employeeId,
        requested_date: requestedDate,
        days_requested: daysRequested,
        reason: reason.trim(),
      };

      await api.createCompOffRequest(payload);
      showSuccessToast?.('Comp-Off usage request submitted for approval.');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit comp-off request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E3E8F2] dark:border-[#152347]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B6FDB]/15 border border-[#0B6FDB]/30 flex items-center justify-center text-[#0BA6CC]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Sora'] font-bold text-base text-[#0B1527] dark:text-white">
                Apply for Comp-Off
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8]">
                Redeem earned compensatory leave days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B1527] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Balance Preview Card */}
          <div className="p-3.5 rounded-xl bg-[#0B6FDB]/10 border border-[#0BA6CC]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#0BA6CC]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Available Balance:</span>
            </div>
            {isLoadingBalance ? (
              <span className="text-[#8D9BB8]">Loading...</span>
            ) : balance ? (
              <div className="flex items-center gap-3">
                <span className="text-[#64748B] dark:text-[#8D9BB8] text-[11px]">
                  Earned: <b>{balance.total_earned_days.toFixed(1)}</b> | Used: <b>{balance.used_days.toFixed(1)}</b>
                </span>
                <span className="font-['Sora'] font-bold text-sm text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-lg border border-[#10B981]/30">
                  {usableBalance.toFixed(1)} days usable
                </span>
              </div>
            ) : (
              <span className="text-[#8D9BB8]">0.0 days</span>
            )}
          </div>

          {/* Date & Days Requested */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Leave Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Days
              </label>
              <select
                value={daysRequested}
                onChange={(e) => setDaysRequested(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                <option value={0.5}>0.5 Day (Half Day)</option>
                <option value={1.0}>1.0 Day (Full Day)</option>
                <option value={2.0}>2.0 Days</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Reason <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Taking comp-off against weekend release deployment support..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white placeholder-[#8D9BB8]/50 focus:outline-hidden focus:border-[#0B6FDB]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8F2] dark:border-[#152347]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || usableBalance <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[#0B6FDB]/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type {
  Employee,
  LeaveType,
  CreateLeaveRequestPayload,
  LeaveCalculationResult,
  LeaveBalanceItem,
} from '../../types';
import { api } from '../../services/api';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  leaveTypes: LeaveType[];
  initialEmployeeId?: number | null;
  showSuccessToast?: (msg: string) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  leaveTypes,
  initialEmployeeId,
  showSuccessToast,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');

  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [calculationPreview, setCalculationPreview] = useState<LeaveCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      const defaultEmp = initialEmployeeId || (employees.length > 0 ? employees[0].id : 0);
      setEmployeeId(defaultEmp);

      const activeTypes = leaveTypes.filter((lt) => lt.is_active);
      const defaultLt = activeTypes.length > 0 ? activeTypes[0].id : 0;
      setLeaveTypeId(defaultLt);

      const todayStr = new Date().toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      setIsHalfDay(false);
      setReason('');
      setFormError(null);
      setCalculationPreview(null);
    }
  }, [isOpen, initialEmployeeId, employees, leaveTypes]);

  // Load balances when employee or date changes
  useEffect(() => {
    if (!isOpen || !employeeId) return;
    let isMounted = true;
    const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();

    api.getLeaveBalances(employeeId, year).then((res) => {
      if (isMounted && res.data) {
        setBalances(res.data.balances);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, employeeId, startDate]);

  // If half day is checked, sync endDate to startDate
  const handleHalfDayToggle = (checked: boolean) => {
    setIsHalfDay(checked);
    if (checked) {
      setEndDate(startDate);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (isHalfDay || !endDate || endDate < val) {
      setEndDate(val);
    }
  };

  // Live Leave-Day Calculator Preview
  useEffect(() => {
    if (!isOpen || !startDate || !endDate || !employeeId || !leaveTypeId) {
      setCalculationPreview(null);
      return;
    }

    if (startDate > endDate) {
      setCalculationPreview(null);
      return;
    }

    let isMounted = true;
    setIsCalculating(true);

    const timer = setTimeout(() => {
      api
        .countLeaveDays({
          start_date: startDate,
          end_date: isHalfDay ? startDate : endDate,
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          is_half_day: isHalfDay,
        })
        .then((res) => {
          if (!isMounted) return;
          setIsCalculating(false);
          if (res.data) {
            setCalculationPreview(res.data);
          } else {
            setCalculationPreview(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsCalculating(false);
            setCalculationPreview(null);
          }
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, startDate, endDate, employeeId, leaveTypeId, isHalfDay]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const selectedLeaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);
  const currentBalance = balances.find((b) => b.leave_type_id === leaveTypeId);

  const isPaidLeave = selectedLeaveType?.is_paid ?? true;
  const requestedDays = calculationPreview?.chargeable_days ?? (isHalfDay ? 0.5 : 1.0);
  const remainingDays = currentBalance ? currentBalance.remaining_days : 0;
  const isInsufficientBalance = isPaidLeave && currentBalance && requestedDays > remainingDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!employeeId) {
      setFormError('Please select an employee.');
      return;
    }

    if (!leaveTypeId) {
      setFormError('Please select a leave type.');
      return;
    }

    if (!startDate) {
      setFormError('Please select a start date.');
      return;
    }

    const finalEndDate = isHalfDay ? startDate : endDate;
    if (!finalEndDate) {
      setFormError('Please select an end date.');
      return;
    }

    if (startDate > finalEndDate) {
      setFormError('Start date cannot be after end date.');
      return;
    }

    if (!reason.trim()) {
      setFormError('Please provide a reason for the leave request.');
      return;
    }

    if (isInsufficientBalance) {
      setFormError(
        `Insufficient leave balance. You are requesting ${requestedDays} day(s), but only have ${remainingDays} day(s) remaining for ${selectedLeaveType?.name}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateLeaveRequestPayload = {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: finalEndDate,
        is_half_day: isHalfDay,
        reason: reason.trim(),
      };

      const result = await api.createLeaveRequest(payload);
      if (showSuccessToast) {
        showSuccessToast(
          `Leave request #${result.id} (${result.total_days} day(s)) submitted successfully with status PENDING.`
        );
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#0E1A38]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/15 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 flex items-center justify-center text-[#0B6FDB] dark:text-[#0BA6CC]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0E1730] dark:text-white">Apply for Leave</h2>
              <p className="text-xs text-[#5B6787] dark:text-[#8D9BB8]">
                Submit a new leave request for manager / HR review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Identity Limitation Disclaimer */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-2.5 text-xs text-[#D97706] dark:text-[#FBBF24]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Note (Simulated Identity):</span> In this current
            build, authenticated user session context is not yet wired to backend JWT tokens. The employee
            identity below is selected for workflow demonstration and testing.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444] dark:text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Employee & Leave Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
                Employee <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] transition-colors"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <p className="text-[11px] text-[#647496] mt-1">
                  Department: <span className="text-[#0B6FDB] dark:text-[#A5B4FC]">{selectedEmployee.department}</span> · Email: {selectedEmployee.email}
                </p>
              )}
            </div>

            {/* Leave Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
                Leave Type <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] transition-colors"
              >
                {leaveTypes
                  .filter((lt) => lt.is_active)
                  .map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.code}) — {lt.is_paid ? 'Paid' : 'Unpaid'}
                    </option>
                  ))}
              </select>
              {currentBalance ? (
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="text-[#5B6787] dark:text-[#8D9BB8]">Balance:</span>
                  <span className="font-semibold text-[#10B981]">
                    {currentBalance.remaining_days} remaining
                  </span>
                  <span className="text-[#647496]">
                    ({currentBalance.consumed_days} used / {currentBalance.entitled_days} entitled)
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-[#647496] mt-1">
                  {selectedLeaveType?.is_paid ? 'Paid quota tracked' : 'Unpaid leave (no quota cap)'}
                </p>
              )}
            </div>
          </div>

          {/* Dates & Half-Day Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
                Start Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
                End Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={isHalfDay ? startDate : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isHalfDay}
                className={`w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] transition-colors ${
                  isHalfDay ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>
          </div>

          {/* Half-Day Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="half_day_cb"
              checked={isHalfDay}
              onChange={(e) => handleHalfDayToggle(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#E3E8F2] dark:border-[#1B2A4A] bg-[#F8FAFD] dark:bg-[#060D1A] text-[#0B6FDB] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="half_day_cb" className="text-xs text-[#475569] dark:text-[#C9D3EE] cursor-pointer select-none">
              Apply as <span className="font-semibold text-[#0E1730] dark:text-white">Half Day</span> (0.5 day chargeable)
            </label>
          </div>

          {/* Live Calculation Preview Banner (reusing TIM-04 calculator) */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFD] dark:bg-[#0F1E3D] border border-[#E3E8F2] dark:border-[#1C3260] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[#0B6FDB] dark:text-[#0BA6CC]">
                <Sparkles className="w-4 h-4" />
                <span>Live Leave Day Calculation Preview</span>
                {isCalculating && (
                  <span className="text-[10px] text-[#5B6787] dark:text-[#8D9BB8] animate-pulse">Calculating...</span>
                )}
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#0B6FDB]/15 dark:bg-[#0B6FDB]/20 text-[#0B6FDB] dark:text-[#0BA6CC] border border-[#0B6FDB]/30 dark:border-[#0BA6CC]/30 font-mono font-bold">
                {requestedDays} day{requestedDays !== 1 ? 's' : ''} requested
              </span>
            </div>

            {calculationPreview && (
              <div className="text-[11px] text-[#5B6787] dark:text-[#8D9BB8] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <span className="text-[#647496]">Calendar Days:</span>{' '}
                  <span className="text-[#0E1730] dark:text-white font-medium">{calculationPreview.total_calendar_days}</span>
                </div>
                <div>
                  <span className="text-[#647496]">Weekends Off:</span>{' '}
                  <span className="text-[#0E1730] dark:text-white font-medium">{calculationPreview.weekend_days}</span>
                </div>
                <div>
                  <span className="text-[#647496]">Holidays:</span>{' '}
                  <span className="text-[#0E1730] dark:text-white font-medium">{calculationPreview.holiday_days}</span>
                </div>
                <div>
                  <span className="text-[#647496]">Chargeable:</span>{' '}
                  <span className="text-[#10B981] font-bold">{calculationPreview.chargeable_days}</span>
                </div>
              </div>
            )}

            {/* Policy note */}
            {calculationPreview && (
              <p className="text-[10px] text-[#647496]">
                Applied policy: <span className="text-[#0B6FDB] dark:text-[#A5B4FC] font-semibold">{calculationPreview.policy_applied}</span>
              </p>
            )}

            {/* Insufficient balance warning */}
            {isInsufficientBalance && (
              <div className="p-2 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center gap-2 text-xs text-[#EF4444] dark:text-[#FCA5A5] mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Insufficient remaining balance: {requestedDays} days requested, but only {remainingDays} days available.
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
              Reason for Leave <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending a family function, medical appointment, personal emergency..."
              className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB] transition-colors placeholder:text-[#94A3B8] dark:placeholder:text-[#475569]"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8F2] dark:border-[#172649]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isInsufficientBalance}
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 ${
                isSubmitting || isInsufficientBalance
                  ? 'bg-gray-300 dark:bg-[#1E293B] text-gray-500 dark:text-[#647496] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] hover:opacity-95 shadow-md shadow-[#0B6FDB]/20 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Leave Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

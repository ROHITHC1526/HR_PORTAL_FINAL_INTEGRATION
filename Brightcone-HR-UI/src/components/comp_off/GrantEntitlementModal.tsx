import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import type { Employee, GrantCompOffPayload } from '../../types';
import { api } from '../../services/api';

interface GrantEntitlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  initialEmployeeId?: number;
  showSuccessToast?: (msg: string) => void;
}

export const GrantEntitlementModal: React.FC<GrantEntitlementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  initialEmployeeId,
  showSuccessToast,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [earnedDate, setEarnedDate] = useState<string>('');
  const [daysEarned, setDaysEarned] = useState<number>(1.0);
  const [hasExpiry, setHasExpiry] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setEarnedDate(today);

      // Default 90 days expiry
      const exp = new Date();
      exp.setDate(exp.getDate() + 90);
      setExpiryDate(exp.toISOString().split('T')[0]);

      setDaysEarned(1.0);
      setHasExpiry(true);
      setReason('');
      setFormError(null);
      const defaultEmp = initialEmployeeId || (employees.length > 0 ? employees[0].id : 0);
      setEmployeeId(defaultEmp);
    }
  }, [isOpen, initialEmployeeId, employees]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!employeeId) {
      setFormError('Please select an employee.');
      return;
    }
    if (!earnedDate) {
      setFormError('Please select the date when overtime was performed.');
      return;
    }
    if (daysEarned <= 0) {
      setFormError('Days earned must be greater than zero.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please state the reason/activity for granting this comp-off.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: GrantCompOffPayload = {
        employee_id: employeeId,
        earned_date: earnedDate,
        days_earned: daysEarned,
        reason: reason.trim(),
        expiry_date: hasExpiry ? expiryDate : undefined,
      };

      await api.grantCompOffEntitlement(payload);
      showSuccessToast?.(`Granted ${daysEarned} comp-off day(s) successfully.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to grant comp-off entitlement');
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
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Sora'] font-bold text-base text-[#0B1527] dark:text-white">
                Grant Comp-Off Entitlement
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8]">
                Credit earned leave for weekend, holiday, or extra-hours work
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

          {/* Earned Date & Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Work / Earned Date
              </label>
              <input
                type="date"
                value={earnedDate}
                onChange={(e) => setEarnedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Days Credited
              </label>
              <select
                value={daysEarned}
                onChange={(e) => setDaysEarned(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                <option value={0.5}>0.5 Day</option>
                <option value={1.0}>1.0 Day</option>
                <option value={1.5}>1.5 Days</option>
                <option value={2.0}>2.0 Days</option>
              </select>
            </div>
          </div>

          {/* Expiry Settings */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8]">
                Validity Expiry
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#8D9BB8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                  className="rounded border-[#E3E8F2] text-[#0B6FDB]"
                />
                <span>Set Expiry Date</span>
              </label>
            </div>
            {hasExpiry && (
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              />
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Source / Work Description <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Weekend critical client disaster recovery drill or Saturday deployment..."
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[#10B981]/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Credit Entitlement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

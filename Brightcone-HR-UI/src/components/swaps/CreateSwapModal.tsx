import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, AlertCircle, Send, Loader2 } from 'lucide-react';
import type { Employee, Shift, CreateSwapPayload } from '../../types';
import { api } from '../../services/api';

interface CreateSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  shifts: Shift[];
  initialRequesterId?: number;
  showSuccessToast?: (msg: string) => void;
}

export const CreateSwapModal: React.FC<CreateSwapModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  shifts,
  initialRequesterId,
  showSuccessToast,
}) => {
  const [requesterId, setRequesterId] = useState<number>(0);
  const [targetEmployeeId, setTargetEmployeeId] = useState<number>(0);
  const [requestDate, setRequestDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [sourceShiftId, setSourceShiftId] = useState<number | undefined>(undefined);
  const [targetShiftId, setTargetShiftId] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setRequestDate(today);
      setTargetDate(today);
      setReason('');
      setFormError(null);

      const defaultReq = initialRequesterId || (employees.length > 0 ? employees[0].id : 0);
      setRequesterId(defaultReq);

      const otherEmps = employees.filter((e) => e.id !== defaultReq);
      setTargetEmployeeId(otherEmps.length > 0 ? otherEmps[0].id : 0);

      if (shifts.length > 0) {
        setSourceShiftId(shifts[0].id);
        setTargetShiftId(shifts.length > 1 ? shifts[1].id : shifts[0].id);
      }
    }
  }, [isOpen, initialRequesterId, employees, shifts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!requesterId) {
      setFormError('Please select a requesting employee.');
      return;
    }
    if (!targetEmployeeId) {
      setFormError('Please select a target replacement colleague.');
      return;
    }
    if (requesterId === targetEmployeeId) {
      setFormError('Requesting employee and target colleague cannot be the same person.');
      return;
    }
    if (!requestDate) {
      setFormError('Please select your shift date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSwapPayload = {
        requester_id: requesterId,
        target_employee_id: targetEmployeeId,
        request_date: requestDate,
        target_date: targetDate || requestDate,
        source_shift_id: sourceShiftId,
        target_shift_id: targetShiftId,
        reason: reason.trim() || undefined,
      };

      await api.createSwapRequest(payload);
      showSuccessToast?.('Shift swap request proposed successfully.');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit swap request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#070F22] border border-[#E3E8F2] dark:border-[#152347] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E3E8F2] dark:border-[#152347]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B6FDB]/15 border border-[#0B6FDB]/30 flex items-center justify-center text-[#0BA6CC]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Sora'] font-bold text-base text-[#0B1527] dark:text-white">
                Propose Shift Swap
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8]">
                Request shift replacement with a team colleague
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {formError && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Requester & Target Employees */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Requester
              </label>
              <select
                value={requesterId}
                onChange={(e) => setRequesterId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Target Colleague
              </label>
              <select
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                {employees
                  .filter((emp) => emp.id !== requesterId)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                My Shift Date
              </label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Target Shift Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              />
            </div>
          </div>

          {/* Shifts (Optional / Auto-resolved) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Source Shift
              </label>
              <select
                value={sourceShiftId || ''}
                onChange={(e) => setSourceShiftId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                <option value="">(Select Shift)</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Desired Shift
              </label>
              <select
                value={targetShiftId || ''}
                onChange={(e) => setTargetShiftId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
              >
                <option value="">(Select Shift)</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Reason for Swap
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Doctor appointment on Friday morning, family event..."
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
                  <span>Propose Swap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

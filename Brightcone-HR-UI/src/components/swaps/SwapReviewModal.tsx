import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, ArrowLeftRight, Loader2, Sparkles } from 'lucide-react';
import type { SwapRequestDetail } from '../../types';
import { api } from '../../services/api';

interface SwapReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SwapRequestDetail | null;
  onSuccess: () => void;
  showSuccessToast?: (msg: string) => void;
}

export const SwapReviewModal: React.FC<SwapReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
  showSuccessToast,
}) => {
  const [reviewerName, setReviewerName] = useState<string>('HR Admin');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');

  if (!isOpen || !request) return null;

  const handleAction = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await api.approveSwapRequest(request.id, { reviewer_name: reviewerName });
        showSuccessToast?.(
          `Swap request #${request.id} approved! Roster assignments updated atomically.`
        );
      } else {
        if (!rejectionReason.trim()) {
          setErrorMsg('Please specify a rejection reason.');
          setIsSubmitting(false);
          return;
        }
        await api.rejectSwapRequest(request.id, {
          reviewer_name: reviewerName,
          rejection_reason: rejectionReason.trim(),
        });
        showSuccessToast?.(`Swap request #${request.id} rejected.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Action failed');
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
                Review Shift Swap #{request.id}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#8D9BB8]">
                {request.requester_name} ↔ {request.target_employee_name || 'Open Team Request'}
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

        {/* Details Card */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] space-y-3 text-xs">
            {/* Requester Row */}
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#8D9BB8]">Requester:</span>
              <span className="font-semibold text-[#0B1527] dark:text-white flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: request.requester_avatar_color || '#0B6FDB' }}
                />
                {request.requester_name} ({request.request_date})
              </span>
            </div>

            {/* Target Row */}
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#8D9BB8]">Target Colleague:</span>
              <span className="font-semibold text-[#0B1527] dark:text-white flex items-center gap-1.5">
                {request.target_employee_name ? (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: request.target_employee_avatar_color || '#10B981' }}
                    />
                    {request.target_employee_name} ({request.target_date || request.request_date})
                  </>
                ) : (
                  <span className="text-[#8D9BB8]">Open Team Swap</span>
                )}
              </span>
            </div>

            {/* Shifts */}
            {(request.source_shift_code || request.target_shift_code) && (
              <div className="flex items-center justify-between pt-2 border-t border-[#E3E8F2] dark:border-[#152347]">
                <span className="text-[#64748B] dark:text-[#8D9BB8]">Shift Exchange:</span>
                <span className="font-semibold text-[#0BA6CC]">
                  {request.source_shift_code || 'Assigned'} → {request.target_shift_code || 'Target'}
                </span>
              </div>
            )}

            {/* Reason */}
            {request.reason && (
              <div className="pt-2 border-t border-[#E3E8F2] dark:border-[#152347]">
                <span className="text-[#64748B] dark:text-[#8D9BB8] block mb-1">Reason:</span>
                <p className="text-[#0B1527] dark:text-[#C9D3EE] italic bg-white dark:bg-[#070F22] p-2 rounded-lg border border-[#E3E8F2]/60 dark:border-[#152347]/60">
                  "{request.reason}"
                </p>
              </div>
            )}
          </div>

          {/* Atomic roster update notice */}
          <div className="p-3 rounded-xl bg-[#0B6FDB]/10 border border-[#0BA6CC]/30 flex items-center gap-2 text-xs text-[#0BA6CC]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Approving automatically and atomically swaps roster assignments between both employees.
            </span>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Decision
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActionType('APPROVE')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'APPROVE'
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#F8FAFC] dark:bg-[#040A15] text-[#64748B] border border-[#E3E8F2] dark:border-[#152347]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Swap</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'REJECT'
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                    : 'bg-[#F8FAFC] dark:bg-[#040A15] text-[#64748B] border border-[#E3E8F2] dark:border-[#152347]'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Swap</span>
              </button>
            </div>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
              Reviewer Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
            />
          </div>

          {/* Rejection Reason */}
          {actionType === 'REJECT' && (
            <div>
              <label className="block text-xs font-semibold text-[#54658B] dark:text-[#8D9BB8] mb-1.5">
                Rejection Reason <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="State the operational reason for rejecting this shift swap..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#040A15] border border-[#E3E8F2] dark:border-[#152347] text-xs text-[#0B1527] dark:text-white placeholder-[#8D9BB8]/50 focus:outline-hidden focus:border-[#0B6FDB]"
              />
            </div>
          )}

          {/* Buttons */}
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
              type="button"
              onClick={handleAction}
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                actionType === 'APPROVE'
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/20'
                  : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] shadow-[#EF4444]/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : actionType === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Swap Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

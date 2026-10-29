import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  History,
} from 'lucide-react';
import type { LeaveRequest, ApproveLeaveRequestPayload, RejectLeaveRequestPayload } from '../../types';
import { api } from '../../services/api';

interface LeaveReviewModalProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSuccessToast?: (msg: string) => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
  showSuccessToast,
}) => {
  const [activeAction, setActiveAction] = useState<'IDLE' | 'APPROVE' | 'REJECT'>('IDLE');
  const [reviewerName, setReviewerName] = useState<string>('HR Admin (Simulated)');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'PENDING';

  const handleApprove = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload: ApproveLeaveRequestPayload = {
        reviewer_name: reviewerName.trim() || undefined,
      };
      await api.approveLeaveRequest(request.id, payload);
      if (showSuccessToast) {
        showSuccessToast(
          `Leave request #${request.id} for ${request.employee_name || 'Employee'} approved successfully. Quota deducted.`
        );
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to approve leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setErrorMsg(null);
    const cleanReason = rejectionReason.trim();
    if (!cleanReason) {
      setErrorMsg('Rejection reason is required when rejecting a leave request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RejectLeaveRequestPayload = {
        reviewer_name: reviewerName.trim() || undefined,
        rejection_reason: cleanReason,
      };
      await api.rejectLeaveRequest(request.id, payload);
      if (showSuccessToast) {
        showSuccessToast(`Leave request #${request.id} rejected.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reject leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#647496]/15 text-[#94A3B8] border border-[#647496]/30">
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#0E1A38]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B6FDB]/15 dark:bg-[#0B6FDB]/20 border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 flex items-center justify-center text-[#0B6FDB] dark:text-[#0BA6CC]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0E1730] dark:text-white flex items-center gap-2">
                <span>Leave Request #{request.id}</span>
                {getStatusBadge(request.status)}
              </h2>
              <p className="text-xs text-[#5B6787] dark:text-[#8D9BB8]">Review and process employee leave application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Reviewer Role Limitation Warning */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-2.5 text-xs text-[#D97706] dark:text-[#FBBF24]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Note (Simulated Reviewer):</span> Role-based
            access control and identity verification are client-simulated pending full auth integration.
            Transactions and balance verifications are strictly enforced by the backend database.
          </div>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444] dark:text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Employee & Request Summary Card */}
          <div className="p-4 rounded-xl bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#172649] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs"
                  style={{ backgroundColor: request.avatar_color || '#0B6FDB' }}
                >
                  {(request.employee_name || 'E').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E1730] dark:text-white">{request.employee_name || 'Unknown Employee'}</h3>
                  <p className="text-xs text-[#5B6787] dark:text-[#8D9BB8]">
                    {request.employee_department} · {request.employee_email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-[#0E1730] dark:text-white">
                  {request.leave_type_name} ({request.leave_type_code})
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E3F0FF] dark:bg-[#1B2A4A] text-[#0B6FDB] dark:text-[#8D9BB8]">
                  {request.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                </span>
              </div>
            </div>

            {/* Dates & Chargeable Days Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E3E8F2] dark:border-[#152347] text-xs">
              <div>
                <span className="text-[#647496] block text-[11px]">Period</span>
                <span className="text-[#0E1730] dark:text-white font-medium">
                  {request.start_date} to {request.end_date}
                </span>
              </div>
              <div>
                <span className="text-[#647496] block text-[11px]">Duration</span>
                <span className="text-[#0B6FDB] dark:text-[#0BA6CC] font-bold">
                  {request.total_days} Day{request.total_days !== 1 ? 's' : ''}{' '}
                  {request.is_half_day ? '(Half Day)' : ''}
                </span>
              </div>
              <div>
                <span className="text-[#647496] block text-[11px]">Applied At</span>
                <span className="text-[#5B6787] dark:text-[#8D9BB8]">
                  {new Date(request.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="pt-2 border-t border-[#E3E8F2] dark:border-[#152347]">
              <span className="text-[#647496] block text-[11px] mb-1">Reason for Leave:</span>
              <p className="text-xs text-[#475569] dark:text-[#CBD5E1] bg-white dark:bg-[#0A1326] p-2.5 rounded-lg border border-[#E3E8F2] dark:border-[#172649] italic">
                "{request.reason}"
              </p>
            </div>
          </div>

          {/* If already reviewed, display decision history */}
          {!isPending && (
            <div className="p-4 rounded-xl bg-[#F8FAFD] dark:bg-[#0E1A38] border border-[#E3E8F2] dark:border-[#172649] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0E1730] dark:text-white">
                <History className="w-4 h-4 text-[#0B6FDB] dark:text-[#0BA6CC]" />
                <span>Decision History</span>
              </div>
              <div className="text-xs text-[#5B6787] dark:text-[#8D9BB8] space-y-1">
                <div>
                  <span className="text-[#647496]">Reviewed by:</span>{' '}
                  <span className="text-[#0E1730] dark:text-white font-medium">{request.reviewer_name || 'System / Admin'}</span>
                </div>
                {request.reviewed_at && (
                  <div>
                    <span className="text-[#647496]">Reviewed on:</span>{' '}
                    <span className="text-[#0E1730] dark:text-white">{new Date(request.reviewed_at).toLocaleString()}</span>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="pt-1 text-[#EF4444]">
                    <span className="font-semibold">Rejection Reason:</span> "{request.rejection_reason}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Review Action Controls */}
          {isPending && (
            <div className="space-y-4 pt-2 border-t border-[#E3E8F2] dark:border-[#172649]">
              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#8D9BB8] mb-1.5">
                  Reviewer Name (Simulated HR Identity)
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. HR Admin"
                  className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-sm text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#0B6FDB]"
                />
              </div>

              {/* Action Selector: Idle, Approve, or Reject */}
              {activeAction === 'IDLE' && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction('REJECT')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Request...
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction('APPROVE')}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-[#10B981]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Leave
                  </button>
                </div>
              )}

              {/* Confirm Approval Panel */}
              {activeAction === 'APPROVE' && (
                <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Approval</span>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">
                    Approving will immediately consume{' '}
                    <span className="font-bold text-[#0E1730] dark:text-white">{request.total_days} day(s)</span> from{' '}
                    <span className="font-semibold text-[#0E1730] dark:text-white">{request.employee_name}'s</span> leave quota.
                    Database row locking ensures this action is race-condition safe.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveAction('IDLE')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Approval...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Approve</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Rejection Panel */}
              {activeAction === 'REJECT' && (
                <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#EF4444] dark:text-[#F87171]">
                    <XCircle className="w-4 h-4" />
                    <span>Reject Leave Application</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#CBD5E1] mb-1">
                      Rejection Reason <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify clear reason for rejecting this leave request..."
                      className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs text-[#0E1730] dark:text-white focus:outline-hidden focus:border-[#EF4444]"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveAction('IDLE')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isSubmitting || !rejectionReason.trim()}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 ${
                        !rejectionReason.trim() || isSubmitting
                          ? 'bg-gray-300 dark:bg-[#1E293B] text-gray-500 dark:text-[#647496] cursor-not-allowed'
                          : 'bg-[#EF4444] hover:bg-[#DC2626] cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Confirm Rejection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

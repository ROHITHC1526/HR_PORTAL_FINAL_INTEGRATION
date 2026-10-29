import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Candidate, ScheduleInterviewPayload } from '../../types/recruitment.types';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: ScheduleInterviewPayload) => Promise<void>;
  candidates: Candidate[];
  preselectedCandidateId?: number;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  candidates,
  preselectedCandidateId,
}) => {
  const [candidateId, setCandidateId] = useState<number>(
    preselectedCandidateId || candidates[0]?.id || 1
  );
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [interviewer, setInterviewer] = useState<string>('Sarah Jenkins (Engineering Manager)');
  const [interviewType, setInterviewType] = useState<string>('Technical Screening');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSchedule({
        candidate_id: candidateId,
        interview_date: interviewDate,
        interviewer,
        interview_type: interviewType,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Interview"
      subtitle="Coordinate interview round, panelist, and evaluation agenda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Candidate <span className="text-rose-500">*</span>
          </label>
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
          >
            {candidates.map((cand) => (
              <option key={cand.id} value={cand.id}>
                {cand.name} — {cand.job_title} (Stage: {cand.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Interview Date &amp; Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Lead Interviewer <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            placeholder="e.g. Vikram Malhotra (Staff Architect)"
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Interview Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
          >
            <option value="Technical Screening">Technical Screening (Coding &amp; Problem Solving)</option>
            <option value="System Design">System Design &amp; Architecture Deep Dive</option>
            <option value="HR Cultural Fit">HR Cultural Fit &amp; Team Collaboration</option>
            <option value="Final Executive Round">Final Executive Round</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Meeting Notes &amp; Video Link
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add video conference link, evaluation topics, or coding exercise link..."
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm &amp; Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};

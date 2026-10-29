import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { CreateReviewPayload } from '../../types/performance.types';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateReviewPayload) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [employeeName, setEmployeeName] = useState('Rahul Varma');
  const [employeeId, setEmployeeId] = useState('BC-1038');
  const [reviewerName, setReviewerName] = useState('Priya Menon');
  const [cycle, setCycle] = useState('Q3 2026');
  const [rating, setRating] = useState<number>(4.5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        employee_id: employeeId,
        employee_name: employeeName,
        reviewer_name: reviewerName,
        cycle,
        rating,
        feedback,
        status: 'Completed',
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
      title="Submit Performance Review"
      subtitle="Log rating, competency assessment, and constructive feedback"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Review Cycle
            </label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
            >
              <option value="Q3 2026">Q3 2026 Mid-Year</option>
              <option value="Q4 2026">Q4 2026 Evaluation</option>
              <option value="Annual 2026">Annual 2026 Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rating (Score: {rating.toFixed(1)} / 5.0)
            </label>
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Qualitative Feedback &amp; Deliverables Review <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Highlight technical contributions, architectural leadership, areas of excellence, and future growth objectives..."
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

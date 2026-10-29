import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { bulkAssignSecurityTraining } from '../../services/api';
import { BulkAssignResponse } from '../../services/types';
import styles from './BulkAssignModal.module.css';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (res: BulkAssignResponse) => void;
}

const DEFAULT_COURSES = [
  'Information security awareness',
  'Data privacy (DPDP Act)',
  'POSH awareness',
  'Code of conduct',
  'Anti-bribery',
  'Other',
];

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [course, setCourse] = useState(DEFAULT_COURSES[0]);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCourse(DEFAULT_COURSES[0]);
      // Default due date to 30 days in the future
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      setError(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      setError('Please pick a due date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await bulkAssignSecurityTraining({ course, due: dueDate });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to bulk assign course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-assign-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="bulk-assign-title" className={styles.title}>
              Assign to everyone
            </h2>
            <p className={styles.subtitle}>
              Assigns a course to every active employee who doesn’t already have it.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Course *</label>
            <select
              className={styles.select}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {DEFAULT_COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Due date *</label>
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { CycleReviewItem, RateEmployeePayload } from '../../services/types';
import { rateEmployee } from '../../services/api';
import styles from './RateEmployeeModal.module.css';

interface RateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  review: CycleReviewItem | null;
  onRated: (updated: CycleReviewItem) => void;
}

const RATING_OPTIONS = [
  'Outstanding',
  'Exceeds expectations',
  'Meets expectations',
  'Partially meets',
  'Below expectations',
];

export const RateEmployeeModal: React.FC<RateEmployeeModalProps> = ({
  isOpen,
  onClose,
  cycleId,
  review,
  onRated,
}) => {
  const [rating, setRating] = useState('Exceeds expectations');
  const [hike, setHike] = useState<number | ''>(8);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating || 'Exceeds expectations');
      setHike(
        typeof review.recommended_increment_percentage === 'number'
          ? review.recommended_increment_percentage
          : 8
      );
      setError(null);
    }
  }, [review, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rating) {
      setError('Please select a rating.');
      return;
    }

    const numericHike = hike === '' ? null : Number(hike);
    if (numericHike !== null && (numericHike < 0 || numericHike > 100)) {
      setError('Recommended increment percentage must be between 0 and 100.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: RateEmployeePayload = {
        rating,
        recommended_increment_percentage: numericHike,
      };
      const updated = await rateEmployee(cycleId, review.employee_id, payload);
      onRated(updated);
      onClose();
    } catch (err: unknown) {
      let msg = 'Failed to save rating. Please retry.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { description?: string; error?: string };
        msg = data.description || data.error || msg;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="presentation"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="rate-title" className={styles.title}>
              Final rating for {review.employee_name}
            </h2>
            <p className={styles.subtitle}>
              {review.self_rating
                ? `Self-rating: ${review.self_rating}.`
                : 'No self-review submitted yet.'}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <div className={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="rating-select" className={styles.label}>
              Rating
            </label>
            <select
              id="rating-select"
              className={styles.select}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              disabled={isSubmitting}
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="hike-input" className={styles.label}>
              Recommended increment (%)
            </label>
            <input
              id="hike-input"
              type="number"
              step="0.5"
              min="0"
              max="100"
              className={styles.input}
              value={hike}
              onChange={(e) =>
                setHike(e.target.value === '' ? '' : Number(e.target.value))
              }
              disabled={isSubmitting}
            />
            <p className={styles.hintText}>
              Stored strictly as a recommendation on the review record.
            </p>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateEmployeeModal;

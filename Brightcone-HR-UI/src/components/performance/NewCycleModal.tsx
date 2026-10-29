import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { CreateCyclePayload, ReviewCycle } from '../../services/types';
import { createReviewCycle } from '../../services/api';
import styles from './NewCycleModal.module.css';

interface NewCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCycleCreated: (newCycle: ReviewCycle) => void;
}

export const NewCycleModal: React.FC<NewCycleModalProps> = ({
  isOpen,
  onClose,
  onCycleCreated,
}) => {
  const [name, setName] = useState('H1 2027 review');
  const [dueDate, setDueDate] = useState('2027-01-31');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('H1 2027 review');
      setDueDate('2027-01-31');
      setError(null);
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setError('Cycle name is required');
      return;
    }
    if (name.trim().length < 3) {
      setError('Cycle name must be at least 3 characters');
      return;
    }
    if (!dueDate.trim()) {
      setError('Self-review due date is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateCyclePayload = {
        name: name.trim(),
        self_review_due: dueDate.trim(),
      };
      const created = await createReviewCycle(payload);
      onCycleCreated(created);
      onClose();
    } catch (err: unknown) {
      let msg = 'Failed to start review cycle. Please retry.';
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
        aria-labelledby="new-cycle-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="new-cycle-title" className={styles.title}>
              Start a new review cycle
            </h2>
            <p className={styles.subtitle}>
              Goals and reviews from the current cycle are archived.
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
            <label htmlFor="cycle-name" className={styles.label}>
              Cycle name <span className={styles.required}>*</span>
            </label>
            <input
              id="cycle-name"
              ref={nameInputRef}
              type="text"
              className={`${styles.input} ${error && !name.trim() ? styles.inputError : ''}`}
              placeholder="e.g. H1 2027 review"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="cycle-due" className={styles.label}>
              Self-review due <span className={styles.required}>*</span>
            </label>
            <input
              id="cycle-due"
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              required
            />
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
              {isSubmitting ? 'Starting cycle...' : 'Start cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCycleModal;

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SecurityTraining } from '../../services/types';
import styles from './AddEditSectrainModal.module.css';

interface AddEditSectrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<SecurityTraining>, id?: string) => Promise<void>;
  assignmentToEdit?: SecurityTraining | null;
}

const COURSES = [
  'Information security awareness',
  'Data privacy (DPDP Act)',
  'POSH awareness',
  'Code of conduct',
  'Anti-bribery',
  'Other',
];

export const AddEditSectrainModal: React.FC<AddEditSectrainModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignmentToEdit,
}) => {
  const [course, setCourse] = useState(COURSES[0]);
  const [emp, setEmp] = useState('');
  const [assigned, setAssigned] = useState('');
  const [due, setDue] = useState('');
  const [done, setDone] = useState('');
  const [score, setScore] = useState<number | ''>('');
  const [status, setStatus] = useState<'Pending' | 'In progress' | 'Completed' | 'Overdue'>('Pending');

  const [errors, setErrors] = useState<{ emp?: string; due?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const empInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assignmentToEdit) {
      setCourse(assignmentToEdit.course);
      setEmp(assignmentToEdit.emp);
      setAssigned(assignmentToEdit.assigned);
      setDue(assignmentToEdit.due || '');
      setDone(assignmentToEdit.done || '');
      setScore(assignmentToEdit.score ?? '');
      setStatus(assignmentToEdit.status);
    } else {
      setCourse(COURSES[0]);
      setEmp('');
      const today = new Date().toISOString().split('T')[0];
      setAssigned(today);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDue(d.toISOString().split('T')[0]);
      setDone('');
      setScore('');
      setStatus('Pending');
    }
    setErrors({});
  }, [assignmentToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        empInputRef.current?.focus();
      }, 50);

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
    const newErrors: { emp?: string; due?: string } = {};

    if (!emp.trim()) {
      newErrors.emp = 'Employee name or code is required.';
    }
    if (!due.trim()) {
      newErrors.due = 'Due date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          course,
          emp: emp.trim(),
          assigned: assigned.trim() || undefined,
          due: due.trim(),
          done: done.trim() || undefined,
          score: score !== '' ? Math.min(100, Math.max(0, Number(score))) : null,
          status,
        },
        assignmentToEdit?.id
      );
      onClose();
    } catch (err: any) {
      setErrors({ emp: err?.response?.data?.message || err?.message || 'Failed to save assignment.' });
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
        aria-labelledby="sectrain-dialog-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="sectrain-dialog-title" className={styles.title}>
              {assignmentToEdit ? 'Edit Training Assignment' : 'New Training Assignment'}
            </h2>
            <p className={styles.subtitle}>
              {assignmentToEdit ? 'Update assignment, due date or record scores.' : 'Assign mandatory security training to an employee.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Course *</label>
            <select className={styles.select} value={course} onChange={(e) => setCourse(e.target.value)}>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Employee *</label>
            <input
              ref={empInputRef}
              type="text"
              className={styles.input}
              placeholder="e.g. Priya Sharma or EMP-0001"
              value={emp}
              onChange={(e) => setEmp(e.target.value)}
              required
            />
            {errors.emp && <span className={styles.error}>{errors.emp}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Assigned on *</label>
              <input
                type="date"
                className={styles.input}
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Due date *</label>
              <input
                type="date"
                className={styles.input}
                value={due}
                onChange={(e) => setDue(e.target.value)}
                required
              />
              {errors.due && <span className={styles.error}>{errors.due}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Completed on</label>
              <input
                type="date"
                className={styles.input}
                value={done}
                onChange={(e) => {
                  setDone(e.target.value);
                  if (e.target.value && status !== 'Completed') {
                    setStatus('Completed');
                  }
                }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={styles.input}
                placeholder="e.g. 92"
                value={score}
                onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Status *</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => {
                const s = e.target.value as any;
                setStatus(s);
                if (s === 'Completed' && !done) {
                  setDone(new Date().toISOString().split('T')[0]);
                }
              }}
            >
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : assignmentToEdit ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

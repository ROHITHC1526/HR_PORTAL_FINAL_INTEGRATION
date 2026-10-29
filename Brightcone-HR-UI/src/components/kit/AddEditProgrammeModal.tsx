import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { TrainingProgramme } from '../../services/types';
import styles from './AddEditProgrammeModal.module.css';

interface AddEditProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<TrainingProgramme>, id?: string) => Promise<void>;
  programmeToEdit?: TrainingProgramme | null;
}

export const AddEditProgrammeModal: React.FC<AddEditProgrammeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  programmeToEdit,
}) => {
  const [prog, setProg] = useState('');
  const [ttype, setTtype] = useState('Technical');
  const [trainer, setTrainer] = useState('');
  const [mode, setMode] = useState('Classroom');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [parts, setParts] = useState(15);
  const [cost, setCost] = useState(25000);
  const [status, setStatus] = useState('Planned');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ prog?: string; start?: string; end?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (programmeToEdit) {
      setProg(programmeToEdit.prog);
      setTtype(programmeToEdit.ttype);
      setTrainer(programmeToEdit.trainer || '');
      setMode(programmeToEdit.mode || 'Classroom');
      setStart(programmeToEdit.start);
      setEnd(programmeToEdit.end || '');
      setParts(programmeToEdit.parts ?? 15);
      setCost(programmeToEdit.cost ?? 25000);
      setStatus(programmeToEdit.status);
      setNotes(programmeToEdit.notes || '');
    } else {
      setProg('');
      setTtype('Technical');
      setTrainer('');
      setMode('Classroom');
      const today = new Date().toISOString().split('T')[0];
      setStart(today);
      setEnd('');
      setParts(15);
      setCost(25000);
      setStatus('Planned');
      setNotes('');
    }
    setErrors({});
  }, [programmeToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        progInputRef.current?.focus();
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
    const newErrors: { prog?: string; start?: string; end?: string } = {};

    if (!prog.trim() || prog.trim().length < 3) {
      newErrors.prog = 'Programme name must be at least 3 characters.';
    }
    if (!start.trim()) {
      newErrors.start = 'Start date is required.';
    }
    if (end.trim() && start.trim() && end < start) {
      newErrors.end = 'End date cannot be earlier than start date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          prog: prog.trim(),
          ttype,
          trainer: trainer.trim() || undefined,
          mode,
          start: start.trim(),
          end: end.trim() || undefined,
          parts: Number(parts) || 0,
          cost: Number(cost) || 0,
          status: status as any,
          notes: notes.trim() || undefined,
        },
        programmeToEdit?.id
      );
      onClose();
    } catch (err: any) {
      setErrors({ prog: err?.response?.data?.message || err?.message || 'Failed to save programme.' });
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
        aria-labelledby="prog-dialog-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="prog-dialog-title" className={styles.title}>
              {programmeToEdit ? 'Edit Training Programme' : 'New Training Programme'}
            </h2>
            <p className={styles.subtitle}>
              {programmeToEdit ? 'Update programme details and status.' : 'Schedule a new training or development session.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Programme name *</label>
            <input
              ref={progInputRef}
              type="text"
              className={styles.input}
              placeholder="e.g. Advanced Rust Development"
              value={prog}
              onChange={(e) => setProg(e.target.value)}
              required
            />
            {errors.prog && <span className={styles.error}>{errors.prog}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Type *</label>
              <select className={styles.select} value={ttype} onChange={(e) => setTtype(e.target.value)}>
                <option value="Technical">Technical</option>
                <option value="Soft skills">Soft skills</option>
                <option value="Leadership">Leadership</option>
                <option value="Induction">Induction</option>
                <option value="Compliance">Compliance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Mode</label>
              <select className={styles.select} value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="Classroom">Classroom</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Self-paced">Self-paced</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Trainer</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Vikramaditya Sen"
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Status *</label>
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Planned">Planned</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Start date *</label>
              <input
                type="date"
                className={styles.input}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
              {errors.start && <span className={styles.error}>{errors.start}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>End date</label>
              <input
                type="date"
                className={styles.input}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              {errors.end && <span className={styles.error}>{errors.end}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Participants</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={parts}
                onChange={(e) => setParts(Number(e.target.value))}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                className={styles.input}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Notes</label>
            <textarea
              className={styles.textarea}
              placeholder="Additional programme details or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : programmeToEdit ? 'Save Changes' : 'Create Programme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PoshRecord } from '../../services/types';
import styles from './AddEditPoshModal.module.css';

interface AddEditPoshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<PoshRecord>, id?: string) => Promise<void>;
  recordToEdit?: PoshRecord | null;
}

export const AddEditPoshModal: React.FC<AddEditPoshModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
}) => {
  const [rtype, setRtype] = useState<'Committee member' | 'Training session'>('Committee member');
  const [emp, setEmp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [date, setDate] = useState('');
  const [valid, setValid] = useState('');
  const [parts, setParts] = useState<number | ''>('');
  const [status, setStatus] = useState<'Active' | 'Scheduled' | 'Completed' | 'Overdue'>('Active');

  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (recordToEdit) {
      setRtype(recordToEdit.rtype);
      setEmp(recordToEdit.emp || '');
      setName(recordToEdit.name);
      setRole(recordToEdit.role || (recordToEdit.rtype === 'Committee member' ? 'Member' : 'Session'));
      setDate(recordToEdit.date);
      setValid(recordToEdit.valid || '');
      setParts(recordToEdit.parts ?? '');
      setStatus(recordToEdit.status);
    } else {
      setRtype('Committee member');
      setEmp('');
      setName('');
      setRole('Member');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setValid('');
      setParts('');
      setStatus('Active');
    }
    setErrors({});
  }, [recordToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
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
    const newErrors: { name?: string; date?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name or session title is required.';
    }
    if (!date.trim()) {
      newErrors.date = 'Date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          rtype,
          emp: emp.trim() || undefined,
          name: name.trim(),
          role: role || undefined,
          date: date.trim(),
          valid: valid.trim() || undefined,
          parts: parts !== '' ? Number(parts) : undefined,
          status,
        },
        recordToEdit?.id
      );
      onClose();
    } catch (err: any) {
      setErrors({ name: err?.response?.data?.message || err?.message || 'Failed to save POSH record.' });
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
        aria-labelledby="posh-dialog-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="posh-dialog-title" className={styles.title}>
              {recordToEdit ? 'Edit POSH Record' : 'New POSH Record'}
            </h2>
            <p className={styles.subtitle}>
              {recordToEdit ? 'Update committee member or training session.' : 'Add an Internal Committee member or record an awareness session.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Record type *</label>
              <select
                className={styles.select}
                value={rtype}
                onChange={(e) => {
                  const val = e.target.value as 'Committee member' | 'Training session';
                  setRtype(val);
                  setRole(val === 'Committee member' ? 'Member' : 'Session');
                }}
              >
                <option value="Committee member">Committee member</option>
                <option value="Training session">Training session</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Role</label>
              <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
                {rtype === 'Committee member' ? (
                  <>
                    <option value="Presiding officer">Presiding officer</option>
                    <option value="Member">Member</option>
                    <option value="External member">External member</option>
                  </>
                ) : (
                  <>
                    <option value="Session">Session</option>
                    <option value="Trainer">Trainer</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {rtype === 'Committee member' ? 'Member name *' : 'Session title *'}
            </label>
            <input
              ref={nameInputRef}
              type="text"
              className={styles.input}
              placeholder={rtype === 'Committee member' ? 'e.g. Sneha Rao' : 'e.g. Annual POSH Awareness Session 2026'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Employee code / ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. EMP-0002 (or leave empty)"
                value={emp}
                onChange={(e) => setEmp(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Status *</label>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {rtype === 'Committee member' ? 'Appointed on *' : 'Session date *'}
              </label>
              <input
                type="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {errors.date && <span className={styles.error}>{errors.date}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Valid till / Tenure</label>
              <input
                type="date"
                className={styles.input}
                value={valid}
                onChange={(e) => setValid(e.target.value)}
              />
            </div>
          </div>

          {rtype === 'Training session' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Participants count</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="e.g. 50"
                value={parts}
                onChange={(e) => setParts(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : recordToEdit ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

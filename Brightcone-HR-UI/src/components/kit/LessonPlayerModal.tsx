import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, ShieldCheck, Award, AlertCircle, FileText, Video, ExternalLink } from 'lucide-react';
import { MyAssignment } from '../../services/types';
import styles from './LessonPlayerModal.module.css';

interface LessonPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: MyAssignment | null;
  onUpdateProgress: (assignmentId: string, newProgress: number) => Promise<boolean>;
  onViewCertificate: () => void;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onUpdateProgress,
  onViewCertificate,
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmedAttestation, setConfirmedAttestation] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (assignment) {
      setCurrentProgress(assignment.progress || 0);
      setLocalError(null);
    }
  }, [assignment]);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Focus trap, Escape key, and focus restoration
  useEffect(() => {
    if (isOpen) {
      prevActiveElement.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        const closeBtn = modalRef.current?.querySelector('button');
        closeBtn?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        prevActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  const targetId = assignment.assignment_id || (assignment as any).id;
  const courseTitle = assignment.course_title || 'Course Details';
  const courseType = assignment.course_type || 'Training';
  const duration = assignment.duration || 'Standard duration';
  const isCompleted = currentProgress >= 100 || assignment.status === 'Completed';

  const hasResource = Boolean(assignment.content_url && assignment.content_url.trim());
  const resourceType = assignment.content_type || 'link';
  const resourceTypeLabel = resourceType === 'document' ? 'Document' : resourceType === 'video' ? 'Video' : 'External Link';
  const resourceIcon = resourceType === 'document' ? <FileText size={14} /> : resourceType === 'video' ? <Video size={14} /> : <ExternalLink size={14} />;

  const handleAttestCompletion = async () => {
    if (isUpdating || isCompleted || !hasResource) return;
    setLocalError(null);
    setIsUpdating(true);

    const success = await onUpdateProgress(targetId, 100);
    if (success) {
      setCurrentProgress(100);
    } else {
      setLocalError('Failed to record completion on the server. Please verify your connection and retry.');
    }
    setIsUpdating(false);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="lesson-title" className={styles.title}>
              {courseTitle}
            </h2>
            <p className={styles.meta}>
              {courseType} Course · {duration}
              {assignment.due_date ? ` · Due ${assignment.due_date}` : ''}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Course Player"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.scrollBody}>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressLabelRow}>
              <span>Course Progress</span>
              <span>{currentProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          <div className={styles.attestNote}>
            <ShieldCheck size={18} style={{ color: '#0B6FDB', flexShrink: 0 }} />
            <span>
              Completion is self-reported by the employee.
            </span>
          </div>

          {localError && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} style={{ color: '#D93D4A', flexShrink: 0 }} />
              <span>{localError}</span>
            </div>
          )}

          {hasResource ? (
            <div className={styles.resourceBlock}>
              <div className={styles.resourceTop}>
                <span className={styles.typeBadge}>
                  {resourceIcon}
                  <span>{resourceTypeLabel}</span>
                </span>
                {isCompleted ? (
                  <span className={styles.completedBadge}>
                    <CheckCircle2 size={16} /> Self-reported complete
                  </span>
                ) : (
                  <span className={styles.statusBadge}>Assigned Material</span>
                )}
              </div>

              <div>
                <h3 className={styles.lessonTitle}>{courseTitle} — Course Material</h3>
                <p className={styles.resourceNotice} style={{ marginTop: 4 }}>
                  Access the assigned course material below to review training curriculum and policies.
                </p>
              </div>

              <a
                href={assignment.content_url!}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnOpenMaterial}
                id="btn-open-course-material"
              >
                <ExternalLink size={16} />
                <span>Open course material</span>
              </a>

              <p className={styles.resourceNotice}>
                External material opens in a new tab. For restricted company resources, provider sign-in may be required.
              </p>

              {isCompleted ? (
                <div className={styles.completionConfirmed}>
                  <CheckCircle2 size={18} style={{ color: '#15A36B', flexShrink: 0 }} />
                  <div>
                    <strong>Completion Confirmed</strong>
                    <p>Your self-reported completion has been stored in your learning record.</p>
                  </div>
                </div>
              ) : (
                <div className={styles.attestationSection}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={confirmedAttestation}
                      onChange={(e) => setConfirmedAttestation(e.target.checked)}
                    />
                    <span>
                      I confirm that I have reviewed the required training material for <strong>{courseTitle}</strong> and acknowledge the policy requirements.
                    </span>
                  </label>

                  <button
                    type="button"
                    className={`${styles.btnAction} ${styles.btnPrimary}`}
                    onClick={handleAttestCompletion}
                    disabled={isUpdating || !confirmedAttestation}
                  >
                    {isUpdating ? 'Saving completion...' : 'Self-report course completion (100%)'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.unavailableBlock}>
              <AlertCircle size={22} style={{ color: 'var(--warn, #C98200)', flexShrink: 0, marginTop: 2 }} />
              <div className={styles.unavailableContent}>
                <h4>Course material has not been added yet.</h4>
                <p>
                  An administrator has not attached a training document, video, or link for this course. Self-reported completion is unavailable until learning material is added.
                </p>
                {isCompleted && (
                  <div className={styles.completionConfirmed} style={{ marginTop: 12 }}>
                    <CheckCircle2 size={18} style={{ color: '#15A36B', flexShrink: 0 }} />
                    <div>
                      <strong>Completion Confirmed</strong>
                      <p>Your previously self-reported completion remains recorded.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.closeBtnFooter}
            onClick={onClose}
          >
            Close
          </button>
          {isCompleted && (
            <button
              type="button"
              className={`${styles.btnAction} ${styles.btnPrimary}`}
              onClick={() => {
                onClose();
                onViewCertificate();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Award size={15} />
              <span>View Completion Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayerModal;

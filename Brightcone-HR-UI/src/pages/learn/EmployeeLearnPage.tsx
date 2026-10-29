import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Award, AlertTriangle, AlertCircle, BookOpen } from 'lucide-react';
import { getMyLearning, updateAssignmentProgress } from '../../services/api';
import { MyAssignment } from '../../services/types';
import { useAuth } from '../../services/authContext';
import CertificateModal from '../../components/kit/CertificateModal';
import LessonPlayerModal from '../../components/kit/LessonPlayerModal';
import Toast, { ToastMessage } from '../../components/kit/Toast';
import styles from './EmployeeLearnPage.module.css';

interface OutletContextType {
  currentPersona?: 'admin' | 'employee';
}

export const EmployeeLearnPage: React.FC = () => {
  const context = useOutletContext<OutletContextType>();
  const currentPersona = context?.currentPersona;
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<MyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [activeLessonAssignment, setActiveLessonAssignment] = useState<MyAssignment | null>(null);
  const [certificateAssignment, setCertificateAssignment] = useState<MyAssignment | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => {
      if (prev.some((t) => t.text === text)) {
        return prev;
      }
      const id = `${Date.now()}-${Math.random()}`;
      return [...prev.slice(-2), { id, type, text }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const learnerName = user?.name || (currentPersona === 'admin' ? 'Ananya Rao' : 'Rahul Varma');

  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Identity is derived securely from the authenticated session (JWT)
      const data = await getMyLearning();
      setAssignments(data);
    } catch {
      setError('Unable to load assignments from server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();

    // Recompute and refresh when window regains focus or tab becomes visible
    const handleFocus = () => {
      loadAssignments();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAssignments();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic refresh every 60s for long-open pages
    const interval = setInterval(() => {
      loadAssignments();
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [loadAssignments]);

  const handleUpdateProgress = async (assignmentId: string, newProgress: number): Promise<boolean> => {
    if (isUpdatingProgress) return false;
    const targetId = assignmentId || activeLessonAssignment?.assignment_id || (activeLessonAssignment as any)?.id;
    if (!targetId) {
      addToast('error', 'Assignment record not found. Please refresh the page.');
      return false;
    }

    try {
      setIsUpdatingProgress(true);
      const updated = await updateAssignmentProgress(targetId, newProgress);
      addToast(
        'success',
        newProgress >= 100
          ? `Self-reported completion saved for "${updated.course_title || 'Course'}".`
          : `Progress updated: ${newProgress}%`
      );
      await loadAssignments();
      if (activeLessonAssignment) {
        setActiveLessonAssignment(updated);
      }
      return true;
    } catch {
      addToast('error', 'Failed to update course progress. Please retry.');
      return false;
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  return (
    <div data-testid="employeelearnpage">
      <header className={styles.head}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Assigned Training</div>
          <h1 className={styles.title}>Learning</h1>
          <p className={styles.desc}>
            Required compliance courses and skills programs assigned to you.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading your learning assignments...</p>
        </div>
      ) : error ? (
        <div className={styles.errorCard} role="alert">
          <AlertCircle size={28} style={{ color: 'var(--bad, #D93D4A)', marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>Unable to load assigned courses</h3>
          <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: 13.5 }}>{error}</p>
          <button
            type="button"
            className={`${styles.btnAction} ${styles.btnPrimary}`}
            onClick={loadAssignments}
            aria-label="Retry loading assignments"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {assignments.length > 0 ? (
            assignments.map((assignment) => {
              const isCompleted = assignment.progress >= 100 || assignment.status === 'Completed';
              const isInProgress = assignment.progress > 0 && assignment.progress < 100;
              
              // Authoritative backend overdue status with frontend date-only fallback
              const isOverdue = assignment.is_overdue ?? (
                assignment.course_type === 'Mandatory' &&
                !isCompleted &&
                Boolean(assignment.due_date) &&
                assignment.due_date! < new Date().toISOString().slice(0, 10)
              );

              return (
                <div key={assignment.assignment_id || assignment.course_id} className={styles.courseCard}>
                  <div>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardTitle}>{assignment.course_title}</h3>
                      <div className={styles.badgeGroup}>
                        {isOverdue && (
                          <span
                            className={`${styles.pill} ${styles.pBad}`}
                            title="Mandatory course deadline has passed"
                            data-testid="overdue-badge"
                          >
                            <AlertTriangle size={12} className={styles.badgeIcon} />
                            Overdue · Mandatory
                          </span>
                        )}
                        {assignment.score !== null && assignment.score !== undefined && (
                          <span
                            className={`${styles.pill} ${
                              assignment.score >= 80
                                ? styles.pOk
                                : assignment.score >= 60
                                ? styles.pInfo
                                : styles.pBad
                            }`}
                            title={`Recorded score: ${assignment.score}%`}
                            data-testid="assignment-score-badge"
                          >
                            Score: {assignment.score}%
                          </span>
                        )}
                        <span
                          className={`${styles.pill} ${
                            isCompleted
                              ? styles.pOk
                              : isInProgress
                              ? styles.pInfo
                              : styles.pMute
                          }`}
                        >
                          {isCompleted ? 'Completed' : isInProgress ? 'In progress' : 'Not started'}
                        </span>
                      </div>
                    </div>

                    <p className={styles.cardMeta}>
                      {assignment.course_type}, {assignment.duration || '1 h'}
                      {assignment.due_date ? `, due ${assignment.due_date}` : ''}
                    </p>
                  </div>

                  <div>
                    <div
                      className={styles.bar}
                      role="progressbar"
                      aria-valuenow={assignment.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progress for ${assignment.course_title}: ${assignment.progress}%`}
                    >
                      <span style={{ width: `${Math.max(0, Math.min(100, assignment.progress))}%` }} />
                    </div>

                    <div className={styles.cardFoot}>
                      <span className={styles.progressLabel}>
                        {assignment.progress === 100 ? '100% (Self-reported)' : `${assignment.progress}% complete`}
                      </span>

                      {isCompleted ? (
                        <button
                          type="button"
                          className={`${styles.btnAction} ${styles.btnCertificate}`}
                          onClick={() => setCertificateAssignment(assignment)}
                          aria-label={`View completion record for ${assignment.course_title}`}
                        >
                          <Award size={15} />
                          <span>Completion record</span>
                        </button>
                      ) : !assignment.content_url ? (
                        <span
                          className={styles.noMaterialTag}
                          title="Course material has not been added yet."
                          data-testid="no-material-indicator"
                        >
                          Course material has not been added yet.
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.btnAction} ${styles.btnPrimary}`}
                          onClick={() => setActiveLessonAssignment(assignment)}
                          aria-label={`${isInProgress ? 'Continue' : 'Start'} ${assignment.course_title}`}
                        >
                          <Play size={14} />
                          <span>{isInProgress ? 'Continue' : 'Start'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyCard} data-testid="empty-assignments">
              <div className={styles.emptyIcon}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>No courses assigned</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5 }}>
                You have no pending compliance courses or skills programs assigned to your profile right now.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Lesson Player */}
      <LessonPlayerModal
        isOpen={!!activeLessonAssignment}
        onClose={() => setActiveLessonAssignment(null)}
        assignment={activeLessonAssignment}
        onUpdateProgress={handleUpdateProgress}
        onViewCertificate={() => {
          if (activeLessonAssignment) {
            setCertificateAssignment(activeLessonAssignment);
          }
        }}
      />

      {/* Verifiable Certificate Modal */}
      <CertificateModal
        isOpen={!!certificateAssignment}
        onClose={() => setCertificateAssignment(null)}
        learnerName={learnerName}
        courseTitle={certificateAssignment?.course_title || ''}
        completedAt={certificateAssignment?.completed_at}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default EmployeeLearnPage;

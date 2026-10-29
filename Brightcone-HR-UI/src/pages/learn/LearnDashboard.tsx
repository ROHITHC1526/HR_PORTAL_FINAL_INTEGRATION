import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Clock,
  Users,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  getLearnDashboard,
  createCourse,
  sendReminders,
} from '../../services/api';
import {
  CreateCoursePayload,
  LearnDashboardMetrics,
} from '../../services/types';
import AddEditCourseModal from '../../components/kit/AddEditCourseModal';
import Toast, { ToastMessage } from '../../components/kit/Toast';
import styles from './LearnDashboard.module.css';

const INITIAL_PAGE_SIZE = 8;

export const LearnDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LearnDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReminding, setIsReminding] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLearnDashboard();
      setMetrics(data);
    } catch {
      setError('Unable to load learning metrics. Please check network and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCourse = async (payload: CreateCoursePayload) => {
    try {
      await createCourse(payload);
      addToast('success', `Course "${payload.title}" created successfully`);
      await loadData();
    } catch (err: unknown) {
      addToast('error', 'Failed to create course');
      throw err;
    }
  };

  const handleRemindAllBehind = async () => {
    if (!metrics || metrics.people_behind_count === 0) {
      addToast('info', 'All employees are currently up to date on mandatory training.');
      return;
    }

    try {
      setIsReminding(true);
      const res = await sendReminders({ bulk: true });
      addToast(
        res.delivered > 0 ? 'success' : 'info',
        `${res.message}`
      );
      await loadData();
    } catch {
      addToast('error', 'Failed to send bulk reminders.');
    } finally {
      setIsReminding(false);
    }
  };

  const handleNudge = async (assignmentId: string, employeeName: string, employeeId: string) => {
    try {
      const res = await sendReminders({ assignment_id: assignmentId, employee_id: employeeId });
      const detail = res.details[0];
      if (detail && detail.status === 'Skipped') {
        addToast('info', `Reminder skipped for ${employeeName}: ${detail.reason || 'Cooldown active'}`);
      } else {
        addToast('success', `Reminder sent to ${employeeName}`);
      }
      await loadData();
    } catch {
      addToast('error', `Failed to send reminder to ${employeeName}`);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
        <p>Loading Learn dashboard metrics...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ color: '#D93D4A' }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#0B6FDB',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalMandatoryAssigned =
    metrics?.compliance_breakdown?.reduce((sum, c) => sum + c.total_assigned, 0) ?? 0;
  const totalMandatoryDone =
    metrics?.compliance_breakdown?.reduce((sum, c) => sum + c.completed_count, 0) ?? 0;
  const compliance = metrics?.mandatory_compliance ?? 0;
  const hasMandatoryData = totalMandatoryAssigned > 0;
  const isComplianceGood = hasMandatoryData && compliance >= 80;

  // Pagination for open mandatory table
  const openMandatory = metrics?.open_mandatory || [];
  const totalOpen = openMandatory.length;
  const totalPages = Math.max(1, Math.ceil(totalOpen / INITIAL_PAGE_SIZE));
  const startIndex = (currentPage - 1) * INITIAL_PAGE_SIZE;
  const paginatedRows = openMandatory.slice(startIndex, startIndex + INITIAL_PAGE_SIZE);

  return (
    <div data-testid="learndashboard">
      {/* Dark Gradient Heading Band */}
      <section className={styles.band} aria-labelledby="dash-heading">
        <div className={styles.bandText}>
          <div className={styles.eyebrow}>Learning & Compliance</div>
          <h1 id="dash-heading" className={styles.bandTitle}>
            Learn dashboard
          </h1>
          <p className={styles.bandDesc}>
            Compliance training, course progress and who needs a nudge.
          </p>
        </div>

        <div className={styles.bandActions}>
          <button
            type="button"
            className={styles.bandBtn}
            onClick={handleRemindAllBehind}
            disabled={isReminding}
          >
            <Bell size={16} />
            <span>{isReminding ? 'Reminding...' : 'Remind everyone behind'}</span>
          </button>
          <button
            type="button"
            className={`${styles.bandBtn} ${styles.bandBtnPrimary}`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add course</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap}>
              <ShieldCheck size={18} />
            </div>
            <span>Mandatory compliance</span>
          </div>
          <div className={styles.kpiValue}>
            {hasMandatoryData ? `${compliance}%` : '—'}
          </div>
          <div className={styles.kpiSub}>
            {hasMandatoryData ? (
              <>
                <span className={isComplianceGood ? styles.trendUp : styles.trendDown}>
                  {isComplianceGood ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {isComplianceGood ? 'Good' : 'Needs attention'}
                </span>
                <span>{totalMandatoryDone} of {totalMandatoryAssigned} assignments</span>
              </>
            ) : (
              <span>No mandatory courses assigned</span>
            )}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap}>
              <BookOpen size={18} />
            </div>
            <span>Courses</span>
          </div>
          <div className={styles.kpiValue}>{metrics?.total_courses || 0}</div>
          <div className={styles.kpiSub}>
            <span>
              {metrics?.mandatory_courses_count || 0} mandatory,{' '}
              {metrics?.elective_courses_count || 0} elective
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap}>
              <Clock size={18} />
            </div>
            <span>In progress</span>
          </div>
          <div className={styles.kpiValue}>{metrics?.in_progress_count || 0}</div>
          <div className={styles.kpiSub}>
            <span>Learners part-way through</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap}>
              <Users size={18} />
            </div>
            <span>People behind</span>
          </div>
          <div className={styles.kpiValue}>{metrics?.people_behind_count || 0}</div>
          <div className={styles.kpiSub}>
            <span className={(metrics?.people_behind_count || 0) > 0 ? styles.trendDown : styles.trendUp}>
              {(metrics?.people_behind_count || 0) > 0 ? 'Action required' : 'Clear'}
            </span>
            <span>With mandatory courses open</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Completion by Course & Compliance Donut */}
      <div className={styles.midGrid}>
        {/* Completion by Course */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Completion by course</h2>
            <Link to="/learn/courses" className={styles.panelLink}>
              Catalogue
            </Link>
          </div>

          <div className={styles.deptBarsWide2}>
            {metrics?.completion_by_course && metrics.completion_by_course.length > 0 ? (
              metrics.completion_by_course.map((c) => (
                <div key={c.course_id} className={styles.barRow}>
                  <span title={c.title}>
                    {c.title}
                  </span>
                  <div className={styles.bar} role="progressbar" aria-valuenow={c.percentage} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${c.percentage}%` }} />
                  </div>
                  <em>{c.percentage}%</em>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No courses registered in catalogue.</div>
            )}
          </div>
        </div>

        {/* Compliance Donut & Mandatory Breakdown */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Compliance</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 14px' }}>
            <div
              className={styles.donut}
              style={{ '--p': hasMandatoryData ? compliance : 0 } as React.CSSProperties}
              role="img"
              aria-label={
                hasMandatoryData
                  ? `${compliance}% mandatory compliance (${totalMandatoryDone} completed of ${totalMandatoryAssigned} assigned)`
                  : 'No mandatory courses assigned'
              }
            >
              <b>{hasMandatoryData ? `${compliance}%` : '—'}</b>
            </div>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', margin: '8px 0 0' }}>
              {hasMandatoryData
                ? `${totalMandatoryDone} of ${totalMandatoryAssigned} mandatory assignments completed`
                : 'No mandatory training assignments'}
            </p>
          </div>

          <div className={styles.list}>
            {metrics?.compliance_breakdown && metrics.compliance_breakdown.length > 0 ? (
              metrics.compliance_breakdown.map((m) => (
                <div key={m.course_id} className={styles.row}>
                  <div className={styles.grow}>
                    <b>{m.title}</b>
                    <div className={styles.sub}>
                      Due {m.due_date ? m.due_date : '—'}
                    </div>
                  </div>
                  <span className={styles.muted}>
                    {m.completed_count}/{m.total_assigned}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No mandatory courses assigned.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Mandatory Courses Still Open */}
      <div className={styles.tableCard}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Mandatory courses still open</h2>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Open mandatory courses table">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Course</th>
                <th scope="col">Due</th>
                <th scope="col">Progress</th>
                <th scope="col" style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const initials = row.employee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  const avColors = ['#2457F5', '#14B8E6', '#7C5CFF', '#0FA37F', '#E0811D', '#D9466F', '#3B82C4', '#6366F1'];
                  const avColor = avColors[[...row.employee_name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % avColors.length];
                  return (
                    <tr key={row.assignment_id}>
                      <td>
                        <div className={styles.who}>
                          <span className={styles.av} style={{ backgroundColor: avColor }}>
                            {initials}
                          </span>
                          <div>
                            <b>{row.employee_name}</b>
                            <span>{row.department}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{row.course_title}</td>
                      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {row.due_date ? row.due_date : '—'}
                      </td>
                      <td>
                        <div style={{ minWidth: 130 }}>
                          <div className={styles.bar} role="progressbar" aria-valuenow={row.progress} aria-valuemin={0} aria-valuemax={100}>
                            <span style={{ width: `${row.progress}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {row.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={styles.nudgeBtn}
                          onClick={() => handleNudge(row.assignment_id, row.employee_name, row.employee_id)}
                          aria-label={`Nudge ${row.employee_name} for ${row.course_title}`}
                        >
                          Nudge
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Everyone is up to date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination when rows exist */}
        {totalOpen > INITIAL_PAGE_SIZE && (
          <div className={styles.paginationRow}>
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + INITIAL_PAGE_SIZE, totalOpen)} of {totalOpen} records
            </span>
            <div className={styles.paginationBtns}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      <AddEditCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCourse}
        courseToEdit={null}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default LearnDashboard;

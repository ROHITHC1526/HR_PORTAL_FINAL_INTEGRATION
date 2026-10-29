import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CheckSquare,
  Plus,
  ArrowRight,
  Download,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  ReviewCycle,
  CycleDashboardData,
  CycleReviewItem,
} from '../../services/types';
import {
  getReviewCycles,
  getCycleDashboard,
  advanceReviewCycle,
  remindReview,
  downloadExportRatings,
} from '../../services/api';
import axios from 'axios';
import NewCycleModal from '../../components/performance/NewCycleModal';
import RateEmployeeModal from '../../components/performance/RateEmployeeModal';
import styles from './PerformanceAdminPage.module.css';

const STAGE_NAMES = [
  'Goal setting',
  'Self-review',
  'Manager review',
  'Calibration',
  'Results shared',
];

export const PerformanceAdminPage: React.FC = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<CycleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAdvancing, setIsAdvancing] = useState(false);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  // Modals
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [rateModalReview, setRateModalReview] = useState<CycleReviewItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCycles = useCallback(async () => {
    try {
      const cycleList = await getReviewCycles();
      setCycles(cycleList);
      if (cycleList.length > 0) {
        // Default to active cycle if none selected or if selected not in list
        const active = cycleList.find((c) => c.status === 'Active') || cycleList[0];
        setSelectedCycleId((prev) => (prev && cycleList.some((c) => c.id === prev) ? prev : active.id));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Access denied: Administrator privileges required.');
      } else {
        setError('Unable to load review cycles.');
      }
    }
  }, []);

  const loadDashboard = useCallback(async (cycleId: string) => {
    if (!cycleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCycleDashboard(cycleId);
      setDashboardData(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Access denied: Administrator privileges required.');
      } else {
        setError('Failed to load performance review cycle data. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  useEffect(() => {
    if (selectedCycleId) {
      loadDashboard(selectedCycleId);
    }
  }, [selectedCycleId, loadDashboard]);

  const handleAdvanceStage = async () => {
    if (!dashboardData || isAdvancing) return;
    const { cycle } = dashboardData;
    if (cycle.stage >= 4) return;

    setIsAdvancing(true);
    try {
      const updated = await advanceReviewCycle(cycle.id);
      showToast(`Advanced review cycle to ${STAGE_NAMES[updated.stage]}`);
      await loadCycles();
      await loadDashboard(cycle.id);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.description
          ? String(err.response.data.description)
          : 'Failed to advance cycle stage.';
      setError(msg);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleRemind = async (employeeId: string, employeeName: string) => {
    if (!dashboardData || remindingId) return;
    setRemindingId(employeeId);
    try {
      const res = await remindReview(dashboardData.cycle.id, employeeId);
      if (res.status === 'queued') {
        showToast(`Reminder sent to ${employeeName}`);
      } else {
        showToast(res.reason || res.message || `Reminder skipped for ${employeeName}`);
      }
      await loadDashboard(dashboardData.cycle.id);
    } catch (_err: unknown) {
      showToast(`Failed to send reminder to ${employeeName}`);
    } finally {
      setRemindingId(null);
    }
  };

  const handleExport = async () => {
    if (!dashboardData) return;
    try {
      await downloadExportRatings(dashboardData.cycle.id);
      showToast('Ratings distribution exported');
    } catch (err) {
      showToast('Failed to export ratings. Please retry.');
    }
  };

  const handleRated = (updatedReview: CycleReviewItem) => {
    showToast(`Rating saved for ${updatedReview.employee_name}`);
    if (dashboardData) {
      loadDashboard(dashboardData.cycle.id);
    }
  };

  const handleCycleCreated = (newCycle: ReviewCycle) => {
    showToast(`${newCycle.name} started`);
    setSelectedCycleId(newCycle.id);
    loadCycles();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.page} data-testid="performance-admin">
      {/* Tab Navigation: Performance & Learning Admin */}
      <div className={styles.tabBar} role="tablist" aria-label="Admin Sections">
        <NavLink
          to="/performance/admin"
          className={`${styles.tabBtn} ${styles.tabActive}`}
          role="tab"
          aria-selected="true"
        >
          <BarChart3 size={16} />
          <span>Performance</span>
        </NavLink>
        <NavLink
          to="/learn/courses"
          className={styles.tabBtn}
          role="tab"
          aria-selected="false"
        >
          <GraduationCap size={16} />
          <span>Learning Admin</span>
        </NavLink>
      </div>

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: '#0F172A',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 500,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          role="status"
        >
          <Sparkles size={16} color="#60A5FA" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className={styles.btnSm}
            onClick={() => selectedCycleId && loadDashboard(selectedCycleId)}
            style={{ background: '#fff', border: '1px solid #fecaca', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.head}>
        <div>
          <h1 className={styles.headTitle}>Performance</h1>
          <p className={styles.headSubtitle}>
            {dashboardData?.cycle.name || 'Performance Cycle'}. Run the cycle, track
            completion and finalise ratings.
          </p>
        </div>

        <div className={styles.actions}>
          {cycles.length > 1 && (
            <select
              className={styles.cycleSelect}
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              aria-label="Select Review Cycle"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className={styles.btn}
            onClick={() => setIsNewCycleOpen(true)}
          >
            <Plus size={15} />
            <span>New cycle</span>
          </button>

          {dashboardData && dashboardData.cycle.stage < 4 && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleAdvanceStage}
              disabled={isAdvancing}
            >
              <span>
                {isAdvancing
                  ? 'Moving...'
                  : `Move to ${STAGE_NAMES[dashboardData.cycle.stage + 1]}`}
              </span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <p>Loading performance review cycle data...</p>
        </div>
      ) : !dashboardData ? (
        <div className={styles.emptyState}>
          <p>No active review cycle found.</p>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: 12 }}
            onClick={() => setIsNewCycleOpen(true)}
          >
            Start your first review cycle
          </button>
        </div>
      ) : (
        <>
          {/* Stepper Card */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                <span>Cycle stage</span>
                <span className={styles.dueText}>
                  Self-reviews due {formatDate(dashboardData.cycle.self_review_due)}
                </span>
              </h2>
            </div>

            <div className={styles.stepper}>
              {STAGE_NAMES.map((stageName, idx) => {
                const isDone = idx < dashboardData.cycle.stage;
                const isCur = idx === dashboardData.cycle.stage;
                return (
                  <div
                    key={stageName}
                    className={`${styles.step} ${
                      isDone ? styles.stepDone : isCur ? styles.stepCur : ''
                    }`}
                  >
                    <span className={styles.n}>{isDone ? '✓' : idx + 1}</span>
                    <b>{stageName}</b>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className={styles.grid3}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BarChart3 size={20} />
              </div>
              <div>
                <p className={styles.statLabel}>Self-reviews submitted</p>
                <p className={styles.statValue}>
                  {dashboardData.summary.self_reviews_submitted} /{' '}
                  {dashboardData.summary.total_eligible}
                </p>
                <p className={styles.statSub}>
                  {dashboardData.summary.total_eligible > 0
                    ? `${Math.round(
                        (dashboardData.summary.self_reviews_submitted /
                          dashboardData.summary.total_eligible) *
                          100
                      )}% submitted`
                    : ''}
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={20} />
              </div>
              <div>
                <p className={styles.statLabel}>Manager reviews done</p>
                <p className={styles.statValue}>
                  {dashboardData.summary.manager_reviews_done} /{' '}
                  {dashboardData.summary.total_eligible}
                </p>
                <p className={styles.statSub}>
                  {dashboardData.summary.total_eligible > 0
                    ? `${Math.round(
                        (dashboardData.summary.manager_reviews_done /
                          dashboardData.summary.total_eligible) *
                          100
                      )}% finalized`
                    : ''}
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckSquare size={20} />
              </div>
              <div>
                <p className={styles.statLabel}>Goals set</p>
                <p className={styles.statValue}>{dashboardData.summary.goals_count}</p>
                <p className={styles.statSub}>Across all employees</p>
              </div>
            </div>
          </div>

          {/* Review Status / Ratings Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHead}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                Review status
              </h3>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={handleExport}
                title="Download CSV report of employee ratings"
              >
                <Download size={14} />
                <span>Export ratings</span>
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table} aria-label="Employee Review Status Table">
                <thead>
                  <tr>
                    <th scope="col">Employee</th>
                    <th scope="col">Manager</th>
                    <th scope="col">Self-review</th>
                    <th scope="col">Goals</th>
                    <th scope="col">Rating</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.reviews.length > 0 ? (
                    dashboardData.reviews.map((r) => {
                      const isSubmitted = r.self_review_status === 'Submitted';
                      const initials = r.employee_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={r.id}>
                          <td>
                            <div className={styles.whoCell}>
                              <div className={styles.avatar}>{initials}</div>
                              <div>
                                <p className={styles.empName}>{r.employee_name}</p>
                                <p className={styles.empDept}>{r.department}</p>
                              </div>
                            </div>
                          </td>
                          <td>{r.manager_name || '—'}</td>
                          <td>
                            <span
                              className={`${styles.pill} ${
                                isSubmitted ? styles.pOk : styles.pMute
                              }`}
                            >
                              {r.self_review_status}
                            </span>
                          </td>
                          <td>{r.goals_count}</td>
                          <td>
                            {r.rating ? (
                              <b style={{ color: 'var(--text, #0f172a)' }}>{r.rating}</b>
                            ) : (
                              <span style={{ color: 'var(--text-muted, #94a3b8)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.actionCell}>
                              {!isSubmitted && (
                                <button
                                  type="button"
                                  className={`${styles.btn} ${styles.btnSm}`}
                                  onClick={() => handleRemind(r.employee_id, r.employee_name)}
                                  disabled={remindingId === r.employee_id}
                                  title="Send reminder to submit self-review"
                                >
                                  {remindingId === r.employee_id ? 'Sending...' : 'Remind'}
                                </button>
                              )}
                              <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                                onClick={() => setRateModalReview(r)}
                                title="Set final rating and recommended increment"
                              >
                                Rate
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                        No employee reviews found in this cycle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <NewCycleModal
        isOpen={isNewCycleOpen}
        onClose={() => setIsNewCycleOpen(false)}
        onCycleCreated={handleCycleCreated}
      />

      <RateEmployeeModal
        isOpen={!!rateModalReview}
        onClose={() => setRateModalReview(null)}
        cycleId={dashboardData?.cycle.id || ''}
        review={rateModalReview}
        onRated={handleRated}
      />
    </div>
  );
};

export default PerformanceAdminPage;

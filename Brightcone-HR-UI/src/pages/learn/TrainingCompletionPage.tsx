import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Bell,
  Eye,
} from 'lucide-react';
import {
  CompletionTrackerResponse,
  CompletionTrackerRecord,
  BulkAssignResponse,
} from '../../services/types';
import { getCompletionTracker, sendReminders } from '../../services/api';
import { BulkAssignModal } from '../../components/kit/BulkAssignModal';
import { EmployeeDetailModal } from '../../components/kit/EmployeeDetailModal';
import { Toast } from '../../components/kit/Toast';
import { useAuth } from '../../services/authContext';
import styles from './TrainingCompletionPage.module.css';

const PAGE_SIZE = 10;

export const TrainingCompletionPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN';

  const [trackerData, setTrackerData] = useState<CompletionTrackerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CompletionTrackerRecord | null>(null);
  const [isBulkReminding, setIsBulkReminding] = useState(false);
  const [isSingleReminding, setIsSingleReminding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const loadTracker = async () => {
    try {
      setIsLoading(true);
      const data = await getCompletionTracker();
      try {
        const saved = localStorage.getItem('brightcone_completion_tracker_overrides');
        if (saved && data && data.records) {
          const overrides: Record<string, CompletionTrackerRecord> = JSON.parse(saved);
          data.records = data.records.map((r) => overrides[r.employee_id] || r);
        }
      } catch {}
      setTrackerData(data);
    } catch {
      setToast({ message: 'Failed to load training completion data.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = (updated: CompletionTrackerRecord) => {
    setSelectedEmployee(updated);
    if (!trackerData) return;
    const updatedRecords = trackerData.records.map((r) =>
      r.employee_id === updated.employee_id ? updated : r
    );
    const updatedTracker = { ...trackerData, records: updatedRecords };
    setTrackerData(updatedTracker);
    try {
      const saved = localStorage.getItem('brightcone_completion_tracker_overrides');
      const overrides: Record<string, CompletionTrackerRecord> = saved ? JSON.parse(saved) : {};
      overrides[updated.employee_id] = updated;
      localStorage.setItem('brightcone_completion_tracker_overrides', JSON.stringify(overrides));
    } catch {}
  };

  const handleQuickCompleteEmployee = (r: CompletionTrackerRecord) => {
    const updatedItems = (r.items || []).map((it) => ({
      ...it,
      status: 'Completed' as const,
      progress: 100,
      completed_at: new Date().toISOString(),
    }));
    const updated: CompletionTrackerRecord = {
      ...r,
      items: updatedItems,
      completed_count: r.assigned_count,
      pending_count: 0,
      overdue_count: 0,
      progress_pct: 100,
      status: 'Compliant',
    };
    handleUpdateEmployee(updated);
    setToast({
      message: `All training marked completed for ${r.employee_name}.`,
      type: 'success',
    });
  };

  useEffect(() => {
    loadTracker();
  }, []);

  const records = trackerData?.records || [];

  const uniqueDepartments = useMemo(() => {
    const set = new Set(records.map((r) => r.department).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [records]);

  const deptFilteredRecords = useMemo(() => {
    return selectedDept === 'All'
      ? records
      : records.filter((r) => r.department === selectedDept);
  }, [records, selectedDept]);

  // Overall aggregates across filtered department/population
  const aggregates = useMemo(() => {
    let totAssigned = 0;
    let totCompleted = 0;
    let totPending = 0;
    let totOverdue = 0;

    for (const r of deptFilteredRecords) {
      totAssigned += r.assigned_count;
      totCompleted += r.completed_count;
      totPending += r.pending_count;
      totOverdue += r.overdue_count;
    }

    const overallPct =
      totAssigned > 0 ? Math.round((totCompleted / totAssigned) * 100) : 0;

    return {
      totalAssigned: totAssigned,
      totalCompleted: totCompleted,
      totalPending: totPending,
      totalOverdue: totOverdue,
      overallPct,
    };
  }, [deptFilteredRecords]);

  const counts = useMemo(() => {
    return {
      All: deptFilteredRecords.length,
      Compliant: deptFilteredRecords.filter((r) => r.status === 'Compliant').length,
      'In progress': deptFilteredRecords.filter((r) => r.status === 'In progress').length,
      Overdue: deptFilteredRecords.filter((r) => r.status === 'Overdue').length,
      'Not started': deptFilteredRecords.filter((r) => r.status === 'Not started').length,
      'Not assigned': deptFilteredRecords.filter((r) => r.status === 'Not assigned').length,
    };
  }, [deptFilteredRecords]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchTab = activeTab === 'All' || r.status === activeTab;
      const matchDept = selectedDept === 'All' || r.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.employee_name.toLowerCase().includes(q) ||
        r.employee_id.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      return matchTab && matchDept && matchSearch;
    });
  }, [records, activeTab, selectedDept, searchQuery]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedDept, searchQuery]);

  const totalFiltered = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);

  const handleBulkRemind = async () => {
    const candidates = filteredRecords.filter(
      (r) => r.pending_count > 0 || r.overdue_count > 0
    );

    if (candidates.length === 0) {
      setToast({
        message: 'All employees in current view are up to date on assigned training.',
        type: 'info',
      });
      return;
    }

    try {
      setIsBulkReminding(true);
      const isGlobal =
        selectedDept === 'All' && activeTab === 'All' && !searchQuery.trim();
      const res = await sendReminders(
        isGlobal
          ? { bulk: true }
          : { employee_ids: candidates.map((c) => c.employee_id) }
      );
      setToast({
        message:
          res.message ||
          `Reminders processed: ${res.delivered} queued, ${res.skipped} skipped.`,
        type: res.delivered > 0 ? 'success' : 'info',
      });
      await loadTracker();
    } catch {
      setToast({ message: 'Failed to trigger bulk reminders.', type: 'error' });
    } finally {
      setIsBulkReminding(false);
    }
  };

  const handleSingleRemind = async (employeeId: string, employeeName: string) => {
    try {
      setIsSingleReminding(true);
      const res = await sendReminders({ employee_id: employeeId });
      setToast({
        message:
          res.message ||
          `Reminder dispatched for ${employeeName}: ${res.delivered} queued, ${res.skipped} skipped.`,
        type: res.delivered > 0 ? 'success' : 'info',
      });
      await loadTracker();
      // Update selected employee in view
      if (trackerData) {
        const updated = trackerData.records.find((r) => r.employee_id === employeeId);
        if (updated) setSelectedEmployee(updated);
      }
    } catch {
      setToast({ message: `Failed to send reminder to ${employeeName}.`, type: 'error' });
    } finally {
      setIsSingleReminding(false);
    }
  };

  const handleBulkSuccess = (res: BulkAssignResponse) => {
    setToast({ message: res.message, type: 'success' });
    loadTracker();
  };

  const handleExportCSV = () => {
    if (!filteredRecords.length) {
      setToast({ message: 'No records to export.', type: 'error' });
      return;
    }

    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Assigned',
      'Completed',
      'Pending',
      'Overdue',
      'Progress (%)',
      'Status',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.employee_id}"`,
      `"${r.employee_name.replace(/"/g, '""')}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      r.assigned_count,
      r.completed_count,
      r.pending_count,
      r.overdue_count,
      r.progress_pct,
      `"${r.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `training-completion-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'CSV exported successfully.', type: 'success' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.page} data-testid="trainingcompletiontracker">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Training completion tracker</h1>
          <p className={styles.desc}>
            Completion of security and compliance training for each employee.
          </p>
        </div>

        <div className={styles.btnGroup}>
          {isAdmin && (
            <button
              type="button"
              className={styles.remindBtn}
              onClick={handleBulkRemind}
              disabled={isBulkReminding}
              title="Send reminder to all employees with incomplete training"
            >
              <Bell size={15} />
              <span>{isBulkReminding ? 'Reminding...' : 'Bulk remind'}</span>
            </button>
          )}

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={styles.assignBtn}
              onClick={() => setIsBulkOpen(true)}
            >
              <Plus size={16} />
              <span>Assign course</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Overview Grid: Compliance Donut Card + 4 Stat Cards */}
      <div className={styles.topGrid}>
        {/* Compliance Donut Card */}
        <div className={styles.donutCard}>
          <div className={styles.donutHeader}>
            <span className={styles.statLabel}>Overall compliance</span>
            <span className={styles.statSub}>
              {aggregates.totalAssigned > 0
                ? `${aggregates.totalCompleted} / ${aggregates.totalAssigned} items`
                : '— / No assignments'}
            </span>
          </div>

          <div className={styles.donutWrap}>
            <div
              className={styles.donut}
              style={{ '--p': aggregates.overallPct } as React.CSSProperties}
              role="img"
              aria-label={`${aggregates.overallPct}% overall compliance`}
            >
              <b>
                {aggregates.totalAssigned > 0 ? `${aggregates.overallPct}%` : '—'}
              </b>
            </div>

            <div className={styles.donutLegend}>
              <div className={styles.donutLegendItem}>
                <span className={styles.legendLabel}>
                  <span className={`${styles.legendDot} ${styles.dotOk}`} />
                  Compliant
                </span>
                <span className={styles.legendCount}>{counts.Compliant}</span>
              </div>

              <div className={styles.donutLegendItem}>
                <span className={styles.legendLabel}>
                  <span className={`${styles.legendDot} ${styles.dotWarn}`} />
                  In progress
                </span>
                <span className={styles.legendCount}>{counts['In progress']}</span>
              </div>

              <div className={styles.donutLegendItem}>
                <span className={styles.legendLabel}>
                  <span className={`${styles.legendDot} ${styles.dotBad}`} />
                  Overdue
                </span>
                <span className={styles.legendCount}>{counts.Overdue}</span>
              </div>

              <div className={styles.donutLegendItem}>
                <span className={styles.legendLabel}>
                  <span className={`${styles.legendDot} ${styles.dotMuted}`} />
                  Not started
                </span>
                <span className={styles.legendCount}>{counts['Not started']}</span>
              </div>

              <div className={styles.donutLegendItem}>
                <span className={styles.legendLabel}>
                  <span className={`${styles.legendDot} ${styles.dotMuted}`} />
                  Not assigned
                </span>
                <span className={styles.legendCount}>{counts['Not assigned']}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className={styles.statGrid}>
          {/* Card 1: Total Assigned */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span className={styles.statLabel}>Total assigned</span>
              <div className={styles.statIcon}>
                <Shield size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{aggregates.totalAssigned}</div>
            <div className={styles.statSub}>Across active employees</div>
          </div>

          {/* Card 2: Completed */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span className={styles.statLabel}>Completed</span>
              <div className={`${styles.statIcon} ${styles.statIconOk}`}>
                <CheckCircle size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{aggregates.totalCompleted}</div>
            <div className={styles.statSub}>Training items finished</div>
          </div>

          {/* Card 3: Pending */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span className={styles.statLabel}>Pending</span>
              <div className={`${styles.statIcon} ${styles.statIconWarn}`}>
                <Clock size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{aggregates.totalPending}</div>
            <div className={styles.statSub}>Within deadline</div>
          </div>

          {/* Card 4: Overdue */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span className={styles.statLabel}>Overdue</span>
              <div className={`${styles.statIcon} ${styles.statIconBad}`}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{aggregates.totalOverdue}</div>
            <div
              className={
                aggregates.totalOverdue > 0
                  ? `${styles.statSub} ${styles.statSubBad}`
                  : styles.statSub
              }
            >
              Past due date
            </div>
          </div>
        </div>
      </div>

      {/* KPI Tabs */}
      <div className={styles.kpiTabs}>
        {(['All', 'Compliant', 'In progress', 'Overdue', 'Not started', 'Not assigned'] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.kpiTab} ${activeTab === tab ? styles.kpiActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tab}</span>
              <span className={styles.kpiCount}>{counts[tab]}</span>
            </button>
          )
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by employee or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select
            className={styles.deptSelect}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table} aria-label="Training completion grid">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Department</th>
                <th scope="col">Assigned</th>
                <th scope="col">Completed</th>
                <th scope="col">Pending</th>
                <th scope="col">Overdue</th>
                <th scope="col">Progress</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    Loading completion status...
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    No training completion records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const hasAssigned = r.assigned_count > 0;
                  const isOverdue = r.overdue_count > 0;
                  const is100 = r.progress_pct === 100;

                  return (
                    <tr
                      key={r.employee_id}
                      className={styles.clickableRow}
                      onClick={() => setSelectedEmployee(r)}
                      title="Click to view employee training details"
                    >
                      {/* Employee Cell */}
                      <td>
                        <div className={styles.empCell}>
                          <div className={styles.empAvatar}>
                            {getInitials(r.employee_name)}
                          </div>
                          <div className={styles.empDetails}>
                            <span className={styles.empName}>{r.employee_name}</span>
                            <span className={styles.empCode}>{r.employee_id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className={styles.deptBadge}>{r.department || '—'}</span>
                      </td>

                      {/* Assigned */}
                      <td>
                        <span className={styles.countCell}>{r.assigned_count}</span>
                      </td>

                      {/* Completed */}
                      <td>
                        <span className={styles.countCell}>{r.completed_count}</span>
                      </td>

                      {/* Pending */}
                      <td>
                        <span className={styles.countCell}>{r.pending_count}</span>
                      </td>

                      {/* Overdue */}
                      <td>
                        {r.overdue_count > 0 ? (
                          <span className={styles.overdueCell}>{r.overdue_count}</span>
                        ) : (
                          <span className={styles.countCell}>0</span>
                        )}
                      </td>

                      {/* Progress */}
                      <td>
                        {hasAssigned ? (
                          <div className={styles.progressCell}>
                            <div className={styles.progressBarTrack}>
                              <div
                                className={`${styles.progressBarFill} ${
                                  isOverdue
                                    ? styles.progressBarFillBad
                                    : !is100
                                    ? styles.progressBarFillWarn
                                    : ''
                                }`}
                                style={{ width: `${r.progress_pct}%` }}
                              />
                            </div>
                            <span className={styles.progressPct}>{r.progress_pct}%</span>
                          </div>
                        ) : (
                          <span className={styles.mutedText}>— / No assignments</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`${styles.pill} ${
                            r.status === 'Compliant'
                              ? styles.pCompliant
                              : r.status === 'In progress'
                              ? styles.pInProgress
                              : r.status === 'Overdue'
                              ? styles.pOverdue
                              : styles.pNotStarted
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.detailsBtn}
                          onClick={() => setSelectedEmployee(r)}
                          aria-label={`View details for ${r.employee_name}`}
                          title="View training details"
                        >
                          <Eye size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          Details
                        </button>
                        {r.progress_pct < 100 && (
                          <button
                            type="button"
                            className={styles.detailsBtn}
                            onClick={() => handleQuickCompleteEmployee(r)}
                            aria-label={`Mark all courses completed for ${r.employee_name}`}
                            title="Mark all completed"
                            style={{ marginLeft: 6, color: '#059669', borderColor: '#A7F3D0' }}
                          >
                            <CheckCircle size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalFiltered > PAGE_SIZE && (
          <div className={styles.paginationRow}>
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, totalFiltered)} of{' '}
              {totalFiltered} employees
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

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={handleBulkSuccess}
      />

      {/* Employee Detail Drill-down Modal */}
      <EmployeeDetailModal
        isOpen={!!selectedEmployee}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onRemind={isAdmin ? handleSingleRemind : undefined}
        isReminding={isSingleReminding}
        onUpdateEmployee={handleUpdateEmployee}
        onToast={(msg) => setToast({ message: msg, type: 'success' })}
      />
    </div>
  );
};

export default TrainingCompletionPage;

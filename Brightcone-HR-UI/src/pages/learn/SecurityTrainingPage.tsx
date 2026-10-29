import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Users, Search, Edit2, Trash2 } from 'lucide-react';
import { SecurityTraining, BulkAssignResponse } from '../../services/types';
import {
  getSecurityTrainings,
  createSecurityTraining,
  updateSecurityTraining,
  deleteSecurityTraining,
} from '../../services/api';
import { AddEditSectrainModal } from '../../components/kit/AddEditSectrainModal';
import { BulkAssignModal } from '../../components/kit/BulkAssignModal';
import { Toast } from '../../components/kit/Toast';
import styles from './SecurityTrainingPage.module.css';

export const SecurityTrainingPage: React.FC = () => {
  const [trainings, setTrainings] = useState<SecurityTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<SecurityTraining | null>(null);

  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadTrainings = async () => {
    try {
      setIsLoading(true);
      const data = await getSecurityTrainings();
      setTrainings(data);
    } catch {
      setToast({ message: 'Failed to load security training records.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const counts = useMemo(() => {
    return {
      All: trainings.length,
      Pending: trainings.filter((t) => t.status === 'Pending').length,
      'In progress': trainings.filter((t) => t.status === 'In progress').length,
      Completed: trainings.filter((t) => t.status === 'Completed').length,
      Overdue: trainings.filter((t) => t.status === 'Overdue').length,
    };
  }, [trainings]);

  const uniqueCourses = useMemo(() => {
    const set = new Set(trainings.map((t) => t.course));
    return ['All', ...Array.from(set).sort()];
  }, [trainings]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const matchTab = activeTab === 'All' || t.status === activeTab;
      const matchCourse = selectedCourse === 'All' || t.course === selectedCourse;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.emp.toLowerCase().includes(q) ||
        t.course.toLowerCase().includes(q) ||
        (t.due && t.due.includes(q));
      return matchTab && matchCourse && matchSearch;
    });
  }, [trainings, activeTab, selectedCourse, searchQuery]);

  const handleSave = async (payload: Partial<SecurityTraining>, id?: string) => {
    if (id) {
      await updateSecurityTraining(id, payload);
      setToast({ message: 'Assignment updated successfully.', type: 'success' });
    } else {
      await createSecurityTraining(payload);
      setToast({ message: 'Assignment created successfully.', type: 'success' });
    }
    await loadTrainings();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment for "${name}"?`)) {
      return;
    }
    try {
      await deleteSecurityTraining(id);
      setToast({ message: 'Assignment deleted.', type: 'success' });
      await loadTrainings();
    } catch {
      setToast({ message: 'Failed to delete assignment.', type: 'error' });
    }
  };

  const handleBulkSuccess = (res: BulkAssignResponse) => {
    setToast({ message: res.message, type: 'success' });
    loadTrainings();
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className={`${styles.pill} ${styles.pWarn}`}>Pending</span>;
      case 'In progress':
        return <span className={`${styles.pill} ${styles.pInfo}`}>In progress</span>;
      case 'Completed':
        return <span className={`${styles.pill} ${styles.pOk}`}>Completed</span>;
      case 'Overdue':
        return <span className={`${styles.pill} ${styles.pBad}`}>Overdue</span>;
      default:
        return <span className={`${styles.pill} ${styles.pWarn}`}>{status}</span>;
    }
  };

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Security &amp; compliance training</h1>
          <p className={styles.desc}>
            Mandatory courses assigned to each employee, with due dates and scores.
          </p>
        </div>
        <div className={styles.btnGroup}>
          <button className={styles.assignAllBtn} onClick={() => setIsBulkOpen(true)}>
            <Users size={16} /> Assign to everyone
          </button>
          <button
            className={styles.addBtn}
            onClick={() => {
              setAssignmentToEdit(null);
              setIsAddEditOpen(true);
            }}
          >
            <Plus size={16} /> New Assignment
          </button>
        </div>
      </div>

      <div className={styles.kpiTabs}>
        {(['All', 'Pending', 'In progress', 'Completed', 'Overdue'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.kpiTab} ${activeTab === tab ? styles.kpiActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className={styles.kpiCount}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search employee or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.typeSelect}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {uniqueCourses.map((c, idx) => (
            <option key={`${c}-${idx}`} value={c}>
              {c === 'All' ? 'All courses' : c}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Course</th>
                <th>Assigned on</th>
                <th>Due date</th>
                <th>Completed on</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                    Loading security training assignments...
                  </td>
                </tr>
              ) : filteredTrainings.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>
                      <h3 className={styles.emptyTitle}>No training assignments found</h3>
                      <p className={styles.emptyText}>
                        {searchQuery || selectedCourse !== 'All' || activeTab !== 'All'
                          ? 'Try adjusting your filters or search query.'
                          : 'Click "Assign to everyone" or "+ New Assignment" above.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrainings.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <p className={styles.empName}>{t.emp}</p>
                    </td>
                    <td>
                      <p className={styles.courseName}>{t.course}</p>
                    </td>
                    <td>{t.assigned}</td>
                    <td className={t.status === 'Overdue' ? styles.overdueDate : undefined}>
                      {t.due || 'Ã¢â‚¬â€'}
                    </td>
                    <td>{t.done || <span style={{ color: 'var(--muted)' }}>Ã¢â‚¬â€</span>}</td>
                    <td>
                      {t.score !== undefined && t.score !== null ? (
                        <button
                          className={`${styles.scoreBadge} ${t.score >= 80 ? styles.scoreHigh : styles.scoreLow}`}
                          title="Click to edit score"
                          onClick={() => {
                            setAssignmentToEdit(t);
                            setIsAddEditOpen(true);
                          }}
                        >
                          {t.score}%
                        </button>
                      ) : (
                        <button
                          className={styles.scoreBadge}
                          title="Click to set score"
                          onClick={() => {
                            setAssignmentToEdit(t);
                            setIsAddEditOpen(true);
                          }}
                        >
                          Ã¢â‚¬â€
                        </button>
                      )}
                    </td>
                    <td>{renderStatusPill(t.status)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          title="Edit assignment"
                          onClick={() => {
                            setAssignmentToEdit(t);
                            setIsAddEditOpen(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete assignment"
                          onClick={() => handleDelete(t.id, t.emp)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditSectrainModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setAssignmentToEdit(null);
        }}
        onSave={handleSave}
        assignmentToEdit={assignmentToEdit}
      />

      <BulkAssignModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
};

export default SecurityTrainingPage;



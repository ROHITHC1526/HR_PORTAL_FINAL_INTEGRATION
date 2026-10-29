import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { TrainingProgramme } from '../../services/types';
import {
  getTrainingProgrammes,
  createTrainingProgramme,
  updateTrainingProgramme,
  deleteTrainingProgramme,
} from '../../services/api';
import { AddEditProgrammeModal } from '../../components/kit/AddEditProgrammeModal';
import { Toast } from '../../components/kit/Toast';
import styles from './TrainingProgrammesPage.module.css';

export const TrainingProgrammesPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<TrainingProgramme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programmeToEdit, setProgrammeToEdit] = useState<TrainingProgramme | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadProgrammes = async () => {
    try {
      setIsLoading(true);
      const data = await getTrainingProgrammes();
      setProgrammes(data);
    } catch {
      setToast({ message: 'Failed to load training programmes.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  const counts = useMemo(() => {
    return {
      All: programmes.length,
      Planned: programmes.filter((p) => p.status === 'Planned').length,
      Ongoing: programmes.filter((p) => p.status === 'Ongoing').length,
      Completed: programmes.filter((p) => p.status === 'Completed').length,
      Cancelled: programmes.filter((p) => p.status === 'Cancelled').length,
    };
  }, [programmes]);

  const filteredProgrammes = useMemo(() => {
    return programmes.filter((p) => {
      const matchTab = activeTab === 'All' || p.status === activeTab;
      const matchType = selectedType === 'All' || p.ttype === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.prog.toLowerCase().includes(q) ||
        (p.trainer && p.trainer.toLowerCase().includes(q)) ||
        p.ttype.toLowerCase().includes(q);
      return matchTab && matchType && matchSearch;
    });
  }, [programmes, activeTab, selectedType, searchQuery]);

  const handleSave = async (payload: Partial<TrainingProgramme>, id?: string) => {
    if (id) {
      await updateTrainingProgramme(id, payload);
      setToast({ message: 'Programme updated successfully.', type: 'success' });
    } else {
      await createTrainingProgramme(payload);
      setToast({ message: 'Programme created successfully.', type: 'success' });
    }
    await loadProgrammes();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete programme "${name}"?`)) {
      return;
    }
    try {
      await deleteTrainingProgramme(id);
      setToast({ message: 'Programme deleted.', type: 'success' });
      await loadProgrammes();
    } catch {
      setToast({ message: 'Failed to delete programme.', type: 'error' });
    }
  };

  const formatCost = (val?: number | null) => {
    if (val === undefined || val === null) return '—';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatDateRange = (start: string, end?: string | null) => {
    if (!end) return start;
    return `${start} → ${end}`;
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Planned':
        return <span className={`${styles.pill} ${styles.pInfo}`}>Planned</span>;
      case 'Ongoing':
        return <span className={`${styles.pill} ${styles.pWarn}`}>Ongoing</span>;
      case 'Completed':
        return <span className={`${styles.pill} ${styles.pOk}`}>Completed</span>;
      case 'Cancelled':
        return <span className={`${styles.pill} ${styles.pMuted}`}>Cancelled</span>;
      default:
        return <span className={`${styles.pill} ${styles.pMuted}`}>{status}</span>;
    }
  };

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Training &amp; development</h1>
          <p className={styles.desc}>Training programmes with trainer, dates, participants and cost.</p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => {
            setProgrammeToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> New Programme
        </button>
      </div>

      <div className={styles.kpiTabs}>
        {(['All', 'Planned', 'Ongoing', 'Completed', 'Cancelled'] as const).map((tab) => (
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
            placeholder="Search programmes or trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.typeSelect}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All types</option>
          <option value="Technical">Technical</option>
          <option value="Soft skills">Soft skills</option>
          <option value="Leadership">Leadership</option>
          <option value="Induction">Induction</option>
          <option value="Compliance">Compliance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Type</th>
                <th>Trainer</th>
                <th>Dates</th>
                <th>Participants</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                    Loading training programmes...
                  </td>
                </tr>
              ) : filteredProgrammes.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>
                      <h3 className={styles.emptyTitle}>No training programmes found</h3>
                      <p className={styles.emptyText}>
                        {searchQuery || selectedType !== 'All' || activeTab !== 'All'
                          ? 'Try adjusting your filters or search query.'
                          : 'Click "+ New Programme" above to schedule a training session.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProgrammes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className={styles.progTitle}>{p.prog}</p>
                      {p.mode && <p className={styles.progMode}>{p.mode}</p>}
                    </td>
                    <td>
                      <span className={styles.typeBadge}>{p.ttype}</span>
                    </td>
                    <td>{p.trainer || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>{formatDateRange(p.start, p.end)}</td>
                    <td>{p.parts ?? '—'}</td>
                    <td>{formatCost(p.cost)}</td>
                    <td>{renderStatusPill(p.status)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          title="Edit programme"
                          onClick={() => {
                            setProgrammeToEdit(p);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete programme"
                          onClick={() => handleDelete(p.id, p.prog)}
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

      <AddEditProgrammeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProgrammeToEdit(null);
        }}
        onSave={handleSave}
        programmeToEdit={programmeToEdit}
      />
    </div>
  );
};

export default TrainingProgrammesPage;

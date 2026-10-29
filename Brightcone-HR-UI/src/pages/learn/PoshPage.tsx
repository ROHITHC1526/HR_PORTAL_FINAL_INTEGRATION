import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { PoshRecord } from '../../services/types';
import {
  getPoshRecords,
  createPoshRecord,
  updatePoshRecord,
  deletePoshRecord,
} from '../../services/api';
import { AddEditPoshModal } from '../../components/kit/AddEditPoshModal';
import { Toast } from '../../components/kit/Toast';
import styles from './PoshPage.module.css';

export const PoshPage: React.FC = () => {
  const [records, setRecords] = useState<PoshRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<PoshRecord | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getPoshRecords();
      setRecords(data);
    } catch {
      setToast({ message: 'Failed to load POSH records.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const counts = useMemo(() => {
    return {
      All: records.length,
      Active: records.filter((r) => r.status === 'Active').length,
      Scheduled: records.filter((r) => r.status === 'Scheduled').length,
      Completed: records.filter((r) => r.status === 'Completed').length,
      Overdue: records.filter((r) => r.status === 'Overdue').length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchTab = activeTab === 'All' || r.status === activeTab;
      const matchType = selectedType === 'All' || r.rtype === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.role && r.role.toLowerCase().includes(q)) ||
        (r.emp && r.emp.toLowerCase().includes(q)) ||
        r.rtype.toLowerCase().includes(q);
      return matchTab && matchType && matchSearch;
    });
  }, [records, activeTab, selectedType, searchQuery]);

  const handleSave = async (payload: Partial<PoshRecord>, id?: string) => {
    if (id) {
      await updatePoshRecord(id, payload);
      setToast({ message: 'POSH record updated successfully.', type: 'success' });
    } else {
      await createPoshRecord(payload);
      setToast({ message: 'POSH record created successfully.', type: 'success' });
    }
    await loadRecords();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete POSH record "${name}"?`)) {
      return;
    }
    try {
      await deletePoshRecord(id);
      setToast({ message: 'POSH record deleted.', type: 'success' });
      await loadRecords();
    } catch {
      setToast({ message: 'Failed to delete POSH record.', type: 'error' });
    }
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className={`${styles.pill} ${styles.pOk}`}>Active</span>;
      case 'Scheduled':
        return <span className={`${styles.pill} ${styles.pInfo}`}>Scheduled</span>;
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
          <h1 className={styles.title}>POSH training &amp; committee</h1>
          <p className={styles.desc}>
            Internal Committee members and POSH training sessions. Complaints are not recorded here.
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => {
            setRecordToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> New Record
        </button>
      </div>

      <div className={styles.kpiTabs}>
        {(['All', 'Active', 'Scheduled', 'Completed', 'Overdue'] as const).map((tab) => (
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
            placeholder="Search member or session title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.typeSelect}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All record types</option>
          <option value="Committee member">Committee member</option>
          <option value="Training session">Training session</option>
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Record type</th>
                <th>Name / Session title</th>
                <th>Role</th>
                <th>Date</th>
                <th>Valid till</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px' }}>
                    Loading POSH records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <h3 className={styles.emptyTitle}>No POSH records found</h3>
                      <p className={styles.emptyText}>
                        {searchQuery || selectedType !== 'All' || activeTab !== 'All'
                          ? 'Try adjusting your filters or search query.'
                          : 'Click "+ New Record" above to add committee members or awareness sessions.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={styles.typeTag}>{r.rtype}</span>
                    </td>
                    <td>
                      <p className={styles.nameTitle}>{r.name}</p>
                      {r.emp && <p className={styles.empSub}>{r.emp}</p>}
                    </td>
                    <td>{r.role || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>{r.date}</td>
                    <td>{r.valid || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>{renderStatusPill(r.status)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          title="Edit POSH record"
                          onClick={() => {
                            setRecordToEdit(r);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete record"
                          onClick={() => handleDelete(r.id, r.name)}
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

      <AddEditPoshModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRecordToEdit(null);
        }}
        onSave={handleSave}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};

export default PoshPage;

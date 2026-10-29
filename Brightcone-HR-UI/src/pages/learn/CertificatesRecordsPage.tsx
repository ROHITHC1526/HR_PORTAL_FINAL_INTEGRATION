import React, { useState, useEffect, useMemo } from 'react';
import { Search, Award, CheckCircle2, AlertTriangle, Printer, X, FileText } from 'lucide-react';
import { CompletionRecord } from '../../services/types';
import { getCompletionRecords } from '../../services/api';
import { Toast } from '../../components/kit/Toast';
import styles from './CertificatesRecordsPage.module.css';

export const CertificatesRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<CompletionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'hr_recorded' | 'self_reported'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRecord, setSelectedRecord] = useState<CompletionRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getCompletionRecords();
      setRecords(data);
    } catch {
      setToast({ message: 'Failed to load completion records.', type: 'error' });
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
      hr_recorded: records.filter(
        (r) => r.record_type === 'hr_recorded' || (r.record_type as string) === 'assessment_verified'
      ).length,
      self_reported: records.filter((r) => r.record_type === 'self_reported').length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchTab =
        activeTab === 'All' ||
        r.record_type === activeTab ||
        (activeTab === 'hr_recorded' && (r.record_type as string) === 'assessment_verified');
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.course_title.toLowerCase().includes(q) ||
        r.employee_name.toLowerCase().includes(q) ||
        (r.category_name && r.category_name.toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [records, activeTab, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Certificates & Training Records</h1>
          <p className={styles.desc}>
            View and download verified completion records, assessment scores, and training history.
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Completed Courses</span>
          <span className={styles.statValue}>{records.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>HR-Recorded / External</span>
          <span className={styles.statValue}>{counts.hr_recorded}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Self-Reported Records</span>
          <span className={styles.statValue}>{counts.self_reported}</span>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'All' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('All')}
          >
            All Records
            <span className={styles.tabCount}>{counts.All}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'hr_recorded' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('hr_recorded')}
          >
            HR-Recorded Results
            <span className={styles.tabCount}>{counts.hr_recorded}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'self_reported' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('self_reported')}
          >
            Self-Reported
            <span className={styles.tabCount}>{counts.self_reported}</span>
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Training / Course</th>
                <th>Learner</th>
                <th>Record Classification</th>
                <th>Score / Outcome</th>
                <th>Completed Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <Award size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                        No records found
                      </div>
                      <p>Complete courses or assessments in your Learning dashboard to view records here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles.courseTitle}>{r.course_title}</div>
                      <div className={styles.courseCategory}>
                        {r.category_name || r.course_type} • {r.duration}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.employee_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.employee_id}</div>
                    </td>
                    <td>
                      {r.record_type === 'hr_recorded' || (r.record_type as string) === 'assessment_verified' ? (
                        <span className={styles.verifiedBadge} title="HR-recorded or external assessment result">
                          <CheckCircle2 size={12} />
                          HR-Recorded Result
                        </span>
                      ) : (
                        <span
                          className={styles.selfReportedBadge}
                          title="Learner self-reported completion without proctored score"
                        >
                          <AlertTriangle size={12} />
                          Self-Reported
                        </span>
                      )}
                    </td>
                    <td>
                      {r.score !== undefined && r.score !== null ? (
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {r.score}% (Recorded)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>Completed (100%)</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className={styles.viewRecordBtn}
                          onClick={() => setSelectedRecord(r)}
                        >
                          <FileText size={13} />
                          View Record
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

      {/* Certificate Modal */}
      {selectedRecord && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div className={styles.certModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.certHeader}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Training Completion Record</span>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.certBody}>
              <div className={styles.certOrg}>Brightcone People Plus Learning Portal</div>
              <h2 className={styles.certHeading}>Certificate of Completion</h2>
              <p className={styles.certSubtext}>This document certifies that</p>
              <div className={styles.recipientName}>{selectedRecord.employee_name}</div>
              <p className={styles.certSubtext}>has successfully completed the training course</p>
              <div className={styles.certCourseTitle}>{selectedRecord.course_title}</div>

              <div className={styles.certMetaGrid}>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Classification</span>
                  <span className={styles.certMetaVal}>
                    {selectedRecord.record_type === 'hr_recorded' || (selectedRecord.record_type as string) === 'assessment_verified'
                      ? 'HR-Recorded / External Result'
                      : 'Self-Reported'}
                  </span>
                </div>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Performance Score</span>
                  <span className={styles.certMetaVal}>
                    {selectedRecord.score !== undefined && selectedRecord.score !== null
                      ? `${selectedRecord.score}%`
                      : 'Completed'}
                  </span>
                </div>
                <div className={styles.certMetaItem}>
                  <span className={styles.certMetaLabel}>Completion Date</span>
                  <span className={styles.certMetaVal}>
                    {selectedRecord.completed_at
                      ? new Date(selectedRecord.completed_at).toLocaleDateString()
                      : 'Recorded'}
                  </span>
                </div>
              </div>

              <div className={styles.selfReportDisclaimer}>
                {selectedRecord.record_type === 'self_reported'
                  ? 'Notice: This completion was recorded directly by the learner as self-directed training. It reflects self-reported participation without formal invigilated testing.'
                  : 'Notice: This completion reflects an HR-recorded or external assessment result. Official accreditation requires external certification authority audit.'}
              </div>
            </div>

            <div className={styles.certFooter}>
              <button
                type="button"
                style={{
                  padding: '9px 16px',
                  borderRadius: 9,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
              <button type="button" className={styles.printBtn} onClick={handlePrint}>
                <Printer size={15} />
                Print / Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CertificatesRecordsPage;

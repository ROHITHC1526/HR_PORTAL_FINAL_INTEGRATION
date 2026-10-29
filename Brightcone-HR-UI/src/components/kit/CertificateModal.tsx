import React, { useEffect } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import styles from './CertificateModal.module.css';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnerName: string;
  courseTitle: string;
  completedAt?: string | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  learnerName,
  courseTitle,
  completedAt,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const handlePrint = () => {
    window.print();
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
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-title"
      >
        <div className={styles.certificatePaper}>
          <div className={styles.certHeader}>
            <div className={styles.logoBadge}>B</div>
            <span className={styles.certOrg}>Brightcone Academy</span>
          </div>

          <h2 id="cert-title" className={styles.certTitle}>
            Training Completion Record
          </h2>
          <p className={styles.certSubtitle}>
            Self-reported completion and policy attestation record.
          </p>

          <div className={styles.recipientLabel}>Proudly presented to</div>
          <h3 className={styles.recipientName}>{learnerName}</h3>

          <div className={styles.recipientLabel}>For completing</div>
          <div className={styles.courseName}>{courseTitle}</div>

          <div className={styles.certMetaGrid}>
            <div className={styles.metaItem}>
              <label>Completion Date</label>
              <span>{dateStr}</span>
            </div>
            <div className={styles.metaItem}>
              <label>Record Type</label>
              <span>Self-Attested Training</span>
            </div>
            <div className={styles.metaItem}>
              <label>Verification Status</label>
              <span style={{ color: '#15A36B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={15} /> Self-reported completion
              </span>
            </div>
            <div className={styles.metaItem}>
              <label>Recorded By</label>
              <span>Brightcone People Ops</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          <button type="button" className={styles.printBtn} onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;

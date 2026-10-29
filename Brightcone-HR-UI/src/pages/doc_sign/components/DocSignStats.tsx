import React from 'react';
import { SignatureRequest } from '../types';
import { ic } from '../../../components/icons';

interface DocSignStatsProps {
  requests: SignatureRequest[];
}

export const DocSignStats: React.FC<DocSignStatsProps> = ({ requests }) => {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'pending').length;
  const signed = requests.filter((r) => r.status === 'signed').length;
  const declined = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="grid g4 mb-6">
      <div className="card stat">
        <div className="k">
          <i>
            {ic('doc', 16)}
          </i>
          Total Envelopes
        </div>
        <div className="v">{total}</div>
        <div className="d text-muted">All active signature packages</div>
      </div>

      <div className="card stat">
        <div className="k">
          <i style={{ color: 'var(--warn)', background: 'var(--warn-bg)' }}>
            {ic('clock', 16)}
          </i>
          Awaiting Signatures
        </div>
        <div className="v" style={{ color: 'var(--warn)' }}>{pending}</div>
        <div className="d text-muted">Awaiting signer response</div>
      </div>

      <div className="card stat">
        <div className="k">
          <i style={{ color: 'var(--ok)', background: 'var(--ok-bg)' }}>
            {ic('check', 16)}
          </i>
          Completed
        </div>
        <div className="v" style={{ color: 'var(--ok)' }}>{signed}</div>
        <div className="d text-muted">Legally executed & archived</div>
      </div>

      <div className="card stat">
        <div className="k">
          <i style={{ color: 'var(--bad)', background: 'var(--bad-bg)' }}>
            {ic('x', 16)}
          </i>
          Declined / Expired
        </div>
        <div className="v">{declined}</div>
        <div className="d text-muted">Rejected or overdue</div>
      </div>
    </div>
  );
};

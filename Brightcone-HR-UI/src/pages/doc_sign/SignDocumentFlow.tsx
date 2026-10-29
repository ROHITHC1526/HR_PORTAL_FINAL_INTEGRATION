import React, { useState } from 'react';
import { INITIAL_REQUESTS } from './mockData';
import { SignatureRequest } from './types';
import { SignModal } from './components/SignModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { ic } from '../../components/icons';

export const SignDocumentFlow: React.FC = () => {
  const [envelopes, setEnvelopes] = useState<SignatureRequest[]>(INITIAL_REQUESTS);
  const [selectedEnvelope, setSelectedEnvelope] = useState<SignatureRequest | null>(
    INITIAL_REQUESTS.find((e) => e.status === 'pending') || null
  );
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingDocs = envelopes.filter((e) => e.status === 'pending');
  const signedDocs = envelopes.filter((e) => e.status === 'signed');

  const handleSignComplete = (envelopeId: string, signatureText: string) => {
    const timestamp = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId
          ? {
              ...e,
              status: 'signed',
              signedAt: timestamp,
              signatureText,
              ipAddress: '192.168.1.108 (Hardware Verified)',
            }
          : e
      )
    );

    if (selectedEnvelope?.id === envelopeId) {
      setSelectedEnvelope((prev) =>
        prev
          ? {
              ...prev,
              status: 'signed',
              signedAt: timestamp,
              signatureText,
            }
          : null
      );
    }

    showToast('Document successfully signed and cryptographically verified.');
  };

  return (
    <div className="view pb-12">
      <div className="head flex items-end justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Documents to sign</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Review and e-sign documents HR sends you. Signed copies stay here.
          </p>
        </div>
        <div className="actions flex gap-2">
          <span className="pill p-warn">
            {pendingDocs.length} Document{pendingDocs.length === 1 ? '' : 's'} Pending
          </span>
        </div>
      </div>

      {pendingDocs.length > 0 && (
        <div
          className="banner flex items-center gap-3 p-3.5 rounded-xl border mb-6 text-xs"
          style={{
            background: 'color-mix(in srgb, #D9466F 10%, var(--surface))',
            borderColor: 'color-mix(in srgb, #D9466F 35%, transparent)',
          }}
        >
          {ic('pen', 18)}
          <span className="text-[var(--text)] font-medium">
            <b style={{ color: '#D9466F' }}>{pendingDocs.length} document{pendingDocs.length > 1 ? 's' : ''}</b> waiting for your signature.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold flex items-center justify-between">
              <span>Pending Action</span>
              <span className="pill p-warn">{pendingDocs.length} Action Needed</span>
            </h3>

            {pendingDocs.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs">
                All documents are signed and up to date!
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {pendingDocs.map((doc) => {
                  const isSelected = selectedEnvelope?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedEnvelope(doc)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--brand)] bg-[var(--surface-2)] shadow-sm'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-muted mb-1">
                        <span className="pill p-info">{doc.category}</span>
                        <span className="text-[11px] font-mono">{doc.dueDate}</span>
                      </div>
                      <strong className="block text-sm text-[var(--text)] font-semibold mt-1">
                        {doc.title}
                      </strong>
                      <div className="text-xs text-muted mt-1 flex items-center justify-between">
                        <span>From: {doc.sender}</span>
                        <span>{doc.pagesCount} pages</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold">Your Signed Archive ({signedDocs.length})</h3>
            <div className="space-y-2.5 mt-3 max-h-60 overflow-y-auto pr-1">
              {signedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-[var(--text)]">{doc.title}</strong>
                    <span className="text-[11px] text-muted">Signed {doc.signedAt}</span>
                  </div>
                  <button
                    type="button"
                    className="btn ib"
                    title="Download Copy"
                    onClick={() => showToast(`Downloaded verified copy of ${doc.envelopeNumber}`)}
                  >
                    {ic('download', 14)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedEnvelope ? (
            <div className="card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="pill p-info">{selectedEnvelope.category}</span>
                    <span className="text-xs font-mono text-muted">{selectedEnvelope.envelopeNumber}</span>
                  </div>
                  <h2 className="text-lg font-bold font-heading mt-1">{selectedEnvelope.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsViewerModalOpen(true)}
                  >
                    Full Screen View
                  </button>
                  {selectedEnvelope.status === 'pending' ? (
                    <button
                      type="button"
                      className="btn primary"
                      style={{ background: '#D9466F', borderColor: '#D9466F' }}
                      onClick={() => setIsSignModalOpen(true)}
                    >
                      {ic('pen', 16)}
                      Sign Document
                    </button>
                  ) : (
                    <span className="pill p-ok">Signed & Completed</span>
                  )}
                </div>
              </div>

              <div className="docprev">
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Document Attestation Preview • Page 1 of {selectedEnvelope.pagesCount}</span>
                  <span>Due by {selectedEnvelope.dueDate}</span>
                </div>
                <p className="leading-relaxed">
                  {selectedEnvelope.description} This contract and associated exhibits represent the full legal commitment between Brightcone Technologies and <strong>{selectedEnvelope.recipient.name}</strong>.
                </p>
                <div className="lines">
                  <i style={{ width: '92%' }} />
                  <i style={{ width: '84%' }} />
                  <i style={{ width: '96%' }} />
                  <i style={{ width: '60%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Signature Placement Area
                </h4>

                {selectedEnvelope.status === 'signed' ? (
                  <div className="sigbox">
                    <span className="font-script text-3xl text-[var(--ok)]">
                      {selectedEnvelope.signatureText || selectedEnvelope.recipient.name}
                    </span>
                    <small>
                      Verified e-Signature • Signed on {selectedEnvelope.signedAt} • IP: {selectedEnvelope.ipAddress}
                    </small>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsSignModalOpen(true)}
                    className="sigbox border-2 border-dashed border-[var(--brand)] bg-[var(--surface)] hover:bg-[var(--info-bg)] cursor-pointer transition-all group flex flex-col items-center justify-center py-6"
                  >
                    <span className="text-sm font-semibold text-[var(--brand)] group-hover:scale-105 transition-transform flex items-center gap-2">
                      {ic('pen', 18)}
                      Click here to place signature
                    </span>
                    <small className="text-[11px] text-muted border-0 pt-1">
                      Sign electronically in compliance with the Electronic Signatures in Global and National Commerce Act.
                    </small>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card empty">
              <div className="empty-ic">
                {ic('doc', 24)}
              </div>
              <strong>Select a document from the left list to review and sign</strong>
            </div>
          )}
        </div>
      </div>

      <SignModal
        envelope={selectedEnvelope}
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSignComplete={handleSignComplete}
      />

      <DocumentViewerModal
        envelope={selectedEnvelope}
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        onOpenSign={() => setIsSignModalOpen(true)}
      />

      {toastMessage && (
        <div className="toast on">
          {ic('check', 18)}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SignDocumentFlow;

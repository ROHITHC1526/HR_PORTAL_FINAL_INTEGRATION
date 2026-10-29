import React from 'react';
import { SignatureRequest } from '../types';
import { ic } from '../../../components/icons';

interface DocumentViewerModalProps {
  envelope: SignatureRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSign?: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  envelope,
  isOpen,
  onClose,
  onOpenSign,
}) => {
  if (!isOpen || !envelope) return null;

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on wide" style={{ maxWidth: '780px', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill p-info">{envelope.category}</span>
              <span className="text-xs font-mono text-muted">{envelope.envelopeNumber}</span>
            </div>
            <h2 className="text-lg font-bold font-heading mt-1">{envelope.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg border border-[var(--line)] flex items-center justify-center text-muted hover:text-black hover:border-brand"
          >
            {ic('x', 14)}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[62vh] my-4 pr-1 space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-4 text-xs text-muted grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span>Recipient:</span>
              <strong className="block text-[var(--text)]">{envelope.recipient.name}</strong>
            </div>
            <div>
              <span>Sender:</span>
              <strong className="block text-[var(--text)]">{envelope.sender}</strong>
            </div>
            <div>
              <span>Status:</span>
              <strong className="block text-[var(--text)] capitalize">{envelope.status}</strong>
            </div>
            <div>
              <span>Pages & Size:</span>
              <strong className="block text-[var(--text)]">{envelope.pagesCount} pages • {envelope.fileSize}</strong>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--surface)] rounded-xl p-6 shadow-sm space-y-4 text-sm leading-relaxed">
            <div className="border-b border-[var(--line)] pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base font-heading text-[var(--text)]">
                  BRIGHTCONE TECHNOLOGIES INC.
                </h3>
                <p className="text-xs text-muted">Legal & People Operations Division</p>
              </div>
              <div className="text-right text-xs text-muted">
                <div>Date: {envelope.sentDate}</div>
                <div>Expiry: {envelope.dueDate}</div>
              </div>
            </div>

            <p className="text-justify text-[var(--text)]">
              This document constitutes an official agreement between Brightcone Technologies and <strong>{envelope.recipient.name}</strong> ({envelope.recipient.email}), residing at the designated professional domicile.
            </p>

            <div className="bg-[var(--surface-2)] p-4 rounded-lg border-l-4 border-[var(--brand)] space-y-2">
              <h4 className="font-semibold text-xs text-[var(--brand)] uppercase tracking-wide">
                1. Scope of Engagement & Responsibilities
              </h4>
              <p className="text-xs text-muted">
                {envelope.description} All duties shall be carried out with the utmost standard of professionalism, adherence to corporate ethics, and statutory employment mandates.
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted">
              <h4 className="font-semibold text-xs text-[var(--text)] uppercase tracking-wide">
                2. Confidentiality & Non-Disclosure
              </h4>
              <p>
                The recipient agrees not to disclose, publish, or otherwise disseminate proprietary materials, technical specifications, or business operations data without express written permission from Brightcone Officers.
              </p>
            </div>

            <div className="border-t border-[var(--line)] pt-4 mt-6">
              <h4 className="font-semibold text-xs text-[var(--text)] mb-3 uppercase tracking-wide">
                Signatures & Attestation
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-dashed border-[var(--line)] rounded-xl p-3 bg-[var(--surface-2)]">
                  <div className="text-xs text-muted">Authorized Brightcone Signatory</div>
                  <div className="font-script text-2xl text-[var(--brand)] my-2">Ananya Rao</div>
                  <div className="text-[11px] text-faint border-t border-[var(--line)] pt-1">
                    VP of People Operations • Signed Oct 01, 2026
                  </div>
                </div>

                <div className="border border-dashed border-[var(--brand)] rounded-xl p-3 bg-[var(--surface-2)] relative">
                  <div className="text-xs text-muted">Recipient / Employee Signatory</div>
                  {envelope.status === 'signed' ? (
                    <>
                      <div className="font-script text-2xl text-[var(--ok)] my-2">
                        {envelope.signatureText || envelope.recipient.name}
                      </div>
                      <div className="text-[11px] text-faint border-t border-[var(--line)] pt-1">
                        Signed: {envelope.signedAt}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-10 flex items-center justify-center my-1 text-xs text-[var(--brand)] font-semibold">
                        [ Pending Recipient Signature ]
                      </div>
                      <div className="text-[11px] text-faint border-t border-[var(--line)] pt-1">
                        Awaiting signature before {envelope.dueDate}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mfoot flex justify-between items-center pt-3 border-t border-[var(--line)]">
          <span className="text-xs text-muted font-mono">
            Audit Hash: 9f8a...c32d (SHA-256)
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
            {envelope.status === 'pending' && onOpenSign && (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  onClose();
                  onOpenSign();
                }}
              >
                Sign Now
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

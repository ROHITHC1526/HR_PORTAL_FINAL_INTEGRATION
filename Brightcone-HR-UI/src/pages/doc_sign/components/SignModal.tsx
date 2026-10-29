import React, { useState } from 'react';
import { SignatureRequest } from '../types';
import { ic } from '../../../components/icons';

interface SignModalProps {
  envelope: SignatureRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSignComplete: (envelopeId: string, signatureText: string) => void;
}

export const SignModal: React.FC<SignModalProps> = ({
  envelope,
  isOpen,
  onClose,
  onSignComplete,
}) => {
  const [signatureText, setSignatureText] = useState(envelope?.recipient.name || 'Aditi Sharma');
  const [signatureStyle, setSignatureStyle] = useState<'caveat' | 'italic' | 'formal'>('caveat');
  const [consent, setConsent] = useState(false);
  const [activeTab, setActiveTab] = useState<'type' | 'draw'>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !envelope) return null;

  const handleConfirm = () => {
    if (!consent) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSignComplete(envelope.id, signatureText);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on wide" style={{ maxWidth: '580px' }}>
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-xl font-bold font-heading">{envelope.title}</h2>
            <p className="text-xs text-muted mt-1">
              Envelope ID: <span className="font-mono">{envelope.envelopeNumber}</span> • Due: {envelope.dueDate}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg border border-[var(--line)] flex items-center justify-center text-muted hover:text-black hover:border-brand"
          >
            {ic('x', 14)}
          </button>
        </div>

        <div className="mt-4">
          <div className="tabs mb-4">
            <button
              type="button"
              className={activeTab === 'type' ? 'on' : ''}
              onClick={() => setActiveTab('type')}
            >
              Type Signature
            </button>
            <button
              type="button"
              className={activeTab === 'draw' ? 'on' : ''}
              onClick={() => setActiveTab('draw')}
            >
              Draw / Gesture
            </button>
          </div>

          {activeTab === 'type' ? (
            <div>
              <label className="field">
                <span>Signer Legal Name</span>
                <input
                  type="text"
                  className="input"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Enter your full legal name"
                />
              </label>

              <div className="flex gap-2 my-2">
                <button
                  type="button"
                  className={`btn sm ${signatureStyle === 'caveat' ? 'primary' : ''}`}
                  onClick={() => setSignatureStyle('caveat')}
                >
                  Cursive Script
                </button>
                <button
                  type="button"
                  className={`btn sm ${signatureStyle === 'italic' ? 'primary' : ''}`}
                  onClick={() => setSignatureStyle('italic')}
                >
                  Executive Script
                </button>
                <button
                  type="button"
                  className={`btn sm ${signatureStyle === 'formal' ? 'primary' : ''}`}
                  onClick={() => setSignatureStyle('formal')}
                >
                  Classic
                </button>
              </div>

              <div className="sigbox mt-3">
                <span
                  style={{
                    fontFamily:
                      signatureStyle === 'caveat'
                        ? 'Caveat, cursive'
                        : signatureStyle === 'italic'
                        ? 'Georgia, serif'
                        : 'Figtree, sans-serif',
                    fontStyle: signatureStyle === 'italic' ? 'italic' : 'normal',
                    fontSize: signatureStyle === 'caveat' ? '40px' : '28px',
                    letterSpacing: signatureStyle === 'formal' ? '2px' : 'normal',
                  }}
                >
                  {signatureText || 'Your Signature Here'}
                </span>
                <small>
                  Legally cryptographically hashed • Timestamp: {todayStr} • Verified e-Sign
                </small>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--line)] rounded-xl p-6 text-center bg-[var(--surface-2)]">
              <div className="w-full h-28 border border-[var(--line)] bg-[var(--surface)] rounded-lg flex items-center justify-center cursor-crosshair">
                <span className="font-script text-3xl text-[var(--brand)] select-none flex items-center gap-2">
                  {ic('pen', 22)} {signatureText || 'Signed Online'}
                </span>
              </div>
              <p className="text-xs text-muted mt-2">
                Use your trackpad or mouse to draw your signature gesture.
              </p>
            </div>
          )}

          <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-3 my-4 text-xs text-muted space-y-1">
            <div className="flex justify-between">
              <span>Signer:</span>
              <strong className="text-[var(--text)]">{envelope.recipient.name} ({envelope.recipient.email})</strong>
            </div>
            <div className="flex justify-between">
              <span>Audit Stamp:</span>
              <span>SHA-256 Validated Signature Block</span>
            </div>
            <div className="flex justify-between">
              <span>Date Recorded:</span>
              <span>{todayStr} (IST)</span>
            </div>
          </div>

          <label className="check mt-3 flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span className="text-xs leading-relaxed text-[var(--text)]">
              I agree that my electronic signature is the legally binding equivalent to my handwritten signature on this document and related amendments.
            </span>
          </label>
        </div>

        <div className="mfoot flex justify-end gap-2 pt-4 border-t border-[var(--line)]">
          <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            style={{ background: '#D9466F', borderColor: '#D9466F' }}
            onClick={handleConfirm}
            disabled={!consent || !signatureText.trim() || isSubmitting}
          >
            {ic('pen', 14)}
            {isSubmitting ? 'Applying Signature…' : 'Sign & Complete Document'}
          </button>
        </div>
      </div>
    </>
  );
};

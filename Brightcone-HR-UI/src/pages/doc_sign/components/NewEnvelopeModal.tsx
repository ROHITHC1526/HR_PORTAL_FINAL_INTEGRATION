import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import type { SignatureRequest } from '../types';

interface NewEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEnvelope: SignatureRequest) => void;
  initialTemplate?: string;
}

export const NewEnvelopeModal: React.FC<NewEnvelopeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate = '',
}) => {
  const [template, setTemplate] = useState('Offer letter');
  const [documentTitle, setDocumentTitle] = useState('');
  const [recipient, setRecipient] = useState('Naresh Vemparala');
  const [signBy, setSignBy] = useState('2026-11-03');

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
      setDocumentTitle(`${initialTemplate}: Senior Engineer`);
    } else {
      setTemplate('Offer letter');
      setDocumentTitle('');
    }
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentTitle.trim()) {
      alert('Please enter a document title.');
      return;
    }

    const recipientsMap: Record<string, { role: string; dept: string; email: string; color: string; isExternal: boolean }> = {
      'Naresh Vemparala': { role: 'Operations Lead', dept: 'Operations', email: 'naresh.v@brightcone.ai', color: '#10b981', isExternal: false },
      'Rahul Varma': { role: 'Backend Engineer', dept: 'Platform', email: 'rahul.v@brightcone.ai', color: '#10b981', isExternal: false },
      'Divya Kulkarni': { role: 'Security Engineer', dept: 'Engineering', email: 'divya.k@brightcone.ai', color: '#3b82f6', isExternal: false },
      'Farhan Ali': { role: 'Frontend Engineer', dept: 'Frontend', email: 'farhan.a@brightcone.ai', color: '#0ea5e9', isExternal: false },
      'Vikram Singh': { role: 'DevOps Engineer', dept: 'DevOps', email: 'vikram.s@brightcone.ai', color: '#059669', isExternal: false },
      'Neha Bansal': { role: 'Senior ML Engineer', dept: 'AI Research', email: 'neha.b@external.com', color: '#d946ef', isExternal: true },
      'Olivia Martin': { role: 'Solutions Architect', dept: 'Solutions', email: 'olivia.m@external.com', color: '#8b5cf6', isExternal: true },
      'Marcus Lee': { role: 'Consultant', dept: 'Strategy', email: 'marcus.l@external.com', color: '#06b6d4', isExternal: true },
    };

    const recipientInfo = recipientsMap[recipient] || {
      role: 'Team Member',
      dept: 'Engineering',
      email: `${recipient.toLowerCase().replace(' ', '.')}@brightcone.ai`,
      color: '#6366f1',
      isExternal: false,
    };

    const newReq: SignatureRequest = {
      id: `SG-${Math.floor(1050 + Math.random() * 50)}`,
      envelopeNumber: `ENV-2026-${Math.floor(1050 + Math.random() * 50)}`,
      title: documentTitle.trim(),
      category: template as any,
      recipient: {
        name: recipient,
        email: recipientInfo.email,
        role: recipientInfo.role,
        department: recipientInfo.dept,
        avatarColor: recipientInfo.color,
      },
      sender: 'Ananya Rao',
      sentDate: 'Oct 28, 2026',
      dueDate: signBy ? 'Nov 3, 2026' : 'Nov 3, 2026',
      status: 'pending',
      fileSize: '1.2 MB',
      pagesCount: 3,
      description: `Document signature package for ${template}.`,
      isExternal: recipientInfo.isExternal,
    };

    onSubmit(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#10192A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header matching Images 3, 4, 5 */}
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New signature request</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            The recipient gets an email with a secure signing link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {/* Template */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
            >
              <option value="Offer letter">Offer letter</option>
              <option value="Employment agreement">Employment agreement</option>
              <option value="NDA">NDA</option>
              <option value="Policy acknowledgement">Policy acknowledgement</option>
              <option value="Appraisal letter">Appraisal letter</option>
              <option value="F&F settlement">F&F settlement</option>
            </select>
          </div>

          {/* Document title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              Document title
            </label>
            <span className="block text-[11px] text-slate-400 mb-1.5">(required)</span>
            <input
              type="text"
              required
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="For example, Offer letter: QA Automation Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Recipient
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
            >
              <option value="Naresh Vemparala">Naresh Vemparala</option>
              <option value="Rahul Varma">Rahul Varma</option>
              <option value="Divya Kulkarni">Divya Kulkarni</option>
              <option value="Farhan Ali">Farhan Ali</option>
              <option value="Vikram Singh">Vikram Singh</option>
              <option value="Neha Bansal">Neha Bansal</option>
              <option value="Olivia Martin">Olivia Martin</option>
              <option value="Marcus Lee">Marcus Lee</option>
            </select>
          </div>

          {/* Sign by */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              Sign by
            </label>
            <span className="block text-[11px] text-slate-400 mb-1.5">(required)</span>
            <input
              type="date"
              required
              value={signBy}
              onChange={(e) => setSignBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer buttons matching Images 3, 4, 5 */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              Send for signature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewEnvelopeModal;

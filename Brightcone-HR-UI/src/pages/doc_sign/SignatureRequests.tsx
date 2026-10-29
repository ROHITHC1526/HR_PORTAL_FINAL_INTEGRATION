import React, { useState, useEffect } from 'react';
import { PenSquare, Download, Eye, Trash2, RotateCcw } from 'lucide-react';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import { NewEnvelopeModal } from './components/NewEnvelopeModal';
import type { SignatureRequest } from './types';

export interface EnvelopeItem {
  id: string;
  document: string;
  documentType: string;
  recipientInitials: string;
  recipientColor: string;
  recipientName: string;
  recipientRole: string;
  sentDate: string;
  dueDate: string;
  status: 'Awaiting signature' | 'Completed' | 'Viewed' | 'Declined' | 'Voided';
  archived?: boolean;
}

const STORAGE_KEY = 'brightcone_signature_envelopes';

const defaultEnvelopes: EnvelopeItem[] = [
  {
    id: 'SG-1042',
    document: 'Offer letter: Senior ML Engineer',
    documentType: 'Offer letter',
    recipientInitials: 'NB',
    recipientColor: 'bg-[#D9466F]',
    recipientName: 'Neha Bansal',
    recipientRole: 'External',
    sentDate: 'Oct 9, 2026',
    dueDate: 'Oct 16, 2026',
    status: 'Awaiting signature',
    archived: false,
  },
  {
    id: 'SG-1041',
    document: 'Travel & expense policy v4.0',
    documentType: 'Policy acknowledgement',
    recipientInitials: 'RV',
    recipientColor: 'bg-emerald-600',
    recipientName: 'Rahul Varma',
    recipientRole: 'Backend Engineer',
    sentDate: 'Oct 1, 2026',
    dueDate: 'Oct 31, 2026',
    status: 'Awaiting signature',
    archived: false,
  },
  {
    id: 'SG-1039',
    document: 'Mutual NDA',
    documentType: 'NDA',
    recipientInitials: 'DK',
    recipientColor: 'bg-blue-600',
    recipientName: 'Divya Kulkarni',
    recipientRole: 'Security Engineer',
    sentDate: 'Sep 28, 2026',
    dueDate: 'Oct 5, 2026',
    status: 'Completed',
    archived: false,
  },
  {
    id: 'SG-1037',
    document: 'Offer letter: Solutions Architect',
    documentType: 'Offer letter',
    recipientInitials: 'OM',
    recipientColor: 'bg-purple-600',
    recipientName: 'Olivia Martin',
    recipientRole: 'External',
    sentDate: 'Oct 6, 2026',
    dueDate: 'Oct 13, 2026',
    status: 'Viewed',
    archived: false,
  },
  {
    id: 'SG-1033',
    document: 'Appraisal letter, H1 2026',
    documentType: 'Appraisal letter',
    recipientInitials: 'RV',
    recipientColor: 'bg-emerald-600',
    recipientName: 'Rahul Varma',
    recipientRole: 'Backend Engineer',
    sentDate: 'Jul 15, 2026',
    dueDate: 'Jul 22, 2026',
    status: 'Completed',
    archived: false,
  },
  {
    id: 'SG-1030',
    document: 'Full and final settlement',
    documentType: 'F&F settlement',
    recipientInitials: 'FA',
    recipientColor: 'bg-sky-600',
    recipientName: 'Farhan Ali',
    recipientRole: 'Frontend Engineer',
    sentDate: 'Oct 7, 2026',
    dueDate: 'Oct 30, 2026',
    status: 'Awaiting signature',
    archived: false,
  },
  {
    id: 'SG-1026',
    document: 'Employment agreement',
    documentType: 'Employment agreement',
    recipientInitials: 'VS',
    recipientColor: 'bg-emerald-700',
    recipientName: 'Vikram Singh',
    recipientRole: 'DevOps Engineer',
    sentDate: 'Aug 12, 2026',
    dueDate: 'Aug 19, 2026',
    status: 'Completed',
    archived: false,
  },
  {
    id: 'SG-1021',
    document: 'Consulting agreement',
    documentType: 'NDA',
    recipientInitials: 'ML',
    recipientColor: 'bg-cyan-600',
    recipientName: 'Marcus Lee',
    recipientRole: 'External',
    sentDate: 'Sep 2, 2026',
    dueDate: 'Sep 9, 2026',
    status: 'Declined',
    archived: false,
  },
];

export const SignatureRequests: React.FC = () => {
  const [envelopes, setEnvelopes] = useState<EnvelopeItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultEnvelopes;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'awaiting' | 'viewed' | 'completed' | 'declined' | 'voided' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewEnvelope, setViewEnvelope] = useState<EnvelopeItem | null>(null);

  // Delete & Archive Confirmation Modal States (matching recruitment / offer letters)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<EnvelopeItem | null>(null);
  const [permanentDeleteConfirmItem, setPermanentDeleteConfirmItem] = useState<EnvelopeItem | null>(null);

  const saveEnvelopes = (list: EnvelopeItem[]) => {
    setEnvelopes(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemind = (env: EnvelopeItem) => {
    showToast(`Signing reminder dispatched to ${env.recipientName} (${env.id})`);
  };

  // Void sets status to 'Voided' dynamically
  const handleVoid = (id: string) => {
    const updated = envelopes.map((e) => (e.id === id ? { ...e, status: 'Voided' as const } : e));
    saveEnvelopes(updated);
    showToast(`Envelope ${id} status updated to Voided.`);
    if (viewEnvelope && viewEnvelope.id === id) {
      setViewEnvelope({ ...viewEnvelope, status: 'Voided' });
    }
  };

  // Move to Archive (from Delete click on live/active record)
  const handleMoveToArchive = () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;
    const updated = envelopes.map((e) => (e.id === targetId ? { ...e, archived: true } : e));
    saveEnvelopes(updated);
    if (viewEnvelope?.id === targetId) {
      setViewEnvelope(null);
    }
    setDeleteConfirmItem(null);
    showToast(`Envelope ${targetId} moved to Archived.`);
  };

  // Restore envelope from Archive
  const handleRestore = (id: string) => {
    const updated = envelopes.map((e) => (e.id === id ? { ...e, archived: false } : e));
    saveEnvelopes(updated);
    showToast(`Restored envelope ${id} from archive.`);
  };

  // Permanently delete envelope (only from Archive)
  const handlePermanentDelete = () => {
    if (!permanentDeleteConfirmItem) return;
    const targetId = permanentDeleteConfirmItem.id;
    const updated = envelopes.filter((e) => e.id !== targetId);
    saveEnvelopes(updated);
    if (viewEnvelope?.id === targetId) {
      setViewEnvelope(null);
    }
    setPermanentDeleteConfirmItem(null);
    showToast(`Envelope ${targetId} permanently deleted.`);
  };

  const handleDownload = (env: EnvelopeItem) => {
    showToast(`Downloading verified signed PDF for ${env.document}...`);
  };

  const handleCreateEnvelope = (req: SignatureRequest) => {
    const newEnv: EnvelopeItem = {
      id: req.id,
      document: req.title,
      documentType: String(req.category),
      recipientInitials: req.recipient.name.slice(0, 2).toUpperCase(),
      recipientColor: req.recipient.avatarColor || 'bg-blue-600',
      recipientName: req.recipient.name,
      recipientRole: req.recipient.role,
      sentDate: req.sentDate,
      dueDate: req.dueDate,
      status: 'Awaiting signature',
      archived: false,
    };
    saveEnvelopes([newEnv, ...envelopes]);
    showToast(`Created signature request ${newEnv.id}`);
  };

  const activeEnvelopes = envelopes.filter((e) => !e.archived);
  const archivedEnvelopes = envelopes.filter((e) => !!e.archived);

  const awaitingCount = activeEnvelopes.filter((e) => e.status === 'Awaiting signature').length;
  const viewedCount = activeEnvelopes.filter((e) => e.status === 'Viewed').length;
  const completedCount = activeEnvelopes.filter((e) => e.status === 'Completed').length;
  const declinedCount = activeEnvelopes.filter((e) => e.status === 'Declined').length;
  const voidedCount = activeEnvelopes.filter((e) => e.status === 'Voided').length;
  const archivedCount = archivedEnvelopes.length;

  const filtered = envelopes.filter((e) => {
    if (activeTab === 'archived') {
      return !!e.archived;
    }
    if (e.archived) return false;
    if (activeTab === 'awaiting') return e.status === 'Awaiting signature';
    if (activeTab === 'viewed') return e.status === 'Viewed';
    if (activeTab === 'completed') return e.status === 'Completed';
    if (activeTab === 'declined') return e.status === 'Declined';
    if (activeTab === 'voided') return e.status === 'Voided';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Signature requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every envelope sent from Brightcone, with its signing status and complete lifecycle audit.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <PenSquare size={16} />
          <span>New signature request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All ({activeEnvelopes.length})
        </button>
        <button
          onClick={() => setActiveTab('awaiting')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'awaiting'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Awaiting signature ({awaitingCount})
        </button>
        <button
          onClick={() => setActiveTab('viewed')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'viewed'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Viewed ({viewedCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab('declined')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'declined'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Declined ({declinedCount})
        </button>
        <button
          onClick={() => setActiveTab('voided')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'voided'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Voided ({voidedCount})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'archived'
              ? 'bg-rose-900 text-white dark:bg-rose-800 dark:text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Archived ({archivedCount})
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl shadow-sm overflow-hidden">
        {/* Count Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {filtered.length} {activeTab === 'archived' ? 'archived envelopes' : 'envelopes'}
          </h3>
          {activeTab === 'archived' && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Archived items can be restored or permanently erased.
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">DOCUMENT</th>
                <th className="py-3 px-4">RECIPIENT</th>
                <th className="py-3 px-4">SENT</th>
                <th className="py-3 px-4">DUE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No envelopes found in this tab.
                  </td>
                </tr>
              ) : (
                filtered.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                      {env.id}
                    </td>

                    {/* Document & Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {env.document}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {env.documentType}
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${env.recipientColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                          {env.recipientInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {env.recipientName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {env.recipientRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sent */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {env.sentDate}
                    </td>

                    {/* Due */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {env.dueDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {env.status === 'Awaiting signature' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Awaiting signature
                        </span>
                      )}
                      {env.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Completed
                        </span>
                      )}
                      {env.status === 'Viewed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Viewed
                        </span>
                      )}
                      {env.status === 'Declined' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Declined
                        </span>
                      )}
                      {env.status === 'Voided' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Voided
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setViewEnvelope(env)}
                          title="View envelope details"
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        {!env.archived ? (
                          <>
                            {(env.status === 'Awaiting signature' || env.status === 'Viewed') && (
                              <>
                                <button
                                  onClick={() => handleRemind(env)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                >
                                  Remind
                                </button>
                                <button
                                  onClick={() => handleVoid(env.id)}
                                  className="px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                  title="Void signature request"
                                >
                                  Void
                                </button>
                              </>
                            )}

                            {env.status === 'Completed' && (
                              <button
                                onClick={() => handleDownload(env)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              >
                                <Download size={13} className="text-slate-500" />
                                <span>Signed copy</span>
                              </button>
                            )}

                            {/* Delete Action triggers "Move to archive" */}
                            <button
                              onClick={() => setDeleteConfirmItem(env)}
                              title="Delete envelope (moves to archive)"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          /* Archived Row Actions: Restore & Permanent Delete */
                          <>
                            <button
                              onClick={() => handleRestore(env.id)}
                              className="px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Restore envelope from archive"
                            >
                              <RotateCcw size={13} />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => setPermanentDeleteConfirmItem(env)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewEnvelopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEnvelope}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {viewEnvelope && (
        <DocDetailDrawer
          isOpen={!!viewEnvelope}
          onClose={() => setViewEnvelope(null)}
          title={`${viewEnvelope.document} (${viewEnvelope.id})`}
          subtitle={`Signature request · ${viewEnvelope.id}`}
          status={viewEnvelope.status}
          statusVariant={
            viewEnvelope.status === 'Completed'
              ? 'success'
              : viewEnvelope.status === 'Declined'
              ? 'danger'
              : viewEnvelope.status === 'Voided'
              ? 'neutral'
              : 'warning'
          }
          fields={[
            { label: 'Document Type', value: viewEnvelope.documentType },
            { label: 'Sent Date', value: viewEnvelope.sentDate },
            { label: 'Due Date', value: viewEnvelope.dueDate },
            {
              label: 'Recipient',
              value: viewEnvelope.recipientName,
              avatar: {
                initials: viewEnvelope.recipientInitials,
                subtitle: `${viewEnvelope.id} · ${viewEnvelope.recipientRole}`,
              },
            },
            {
              label: 'File',
              value: `${viewEnvelope.document.replace(/\s+/g, '_')}.pdf`,
              isFilePill: true,
            },
          ]}
          history={{
            status: viewEnvelope.status,
            timestamp: `${viewEnvelope.sentDate}, 10:00 am`,
            actor: viewEnvelope.recipientName,
          }}
          createdTimestamp={`Created ${viewEnvelope.sentDate}, 10:00 am by ananya.rao@brightcone.ai. Last updated ${viewEnvelope.dueDate}, 05:00 pm.`}
          onEdit={() => {
            setViewEnvelope(null);
          }}
          onDelete={() => {
            setDeleteConfirmItem(viewEnvelope);
            setViewEnvelope(null);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* MOVE TO ARCHIVE CONFIRMATION MODAL (Matching Recruitment) */}
      {/* =================================================================== */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Delete {deleteConfirmItem.id}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              It moves to <span className="font-semibold text-slate-800 dark:text-slate-200">Archived</span>, where you can restore it at any time. Nothing is erased.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveToArchive}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Move to archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {/* =================================================================== */}
      {permanentDeleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              Permanently delete {permanentDeleteConfirmItem.id}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              This action cannot be undone. All envelope metadata, audit signatures, and associated records will be permanently removed from Brightcone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPermanentDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SignatureRequests;

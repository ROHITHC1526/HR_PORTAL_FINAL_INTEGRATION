import React from 'react';
import { X, FileText, Pencil, Trash2 } from 'lucide-react';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  isFile?: boolean;
  isFilePill?: boolean;
  avatar?: {
    initials: string;
    subtitle?: string;
    color?: string;
  };
}

export type DetailDrawerField = DetailField;

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: string;
  };
  statusBadge?: string;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | string;
  fields: DetailField[];
  summary?: string;
  changesSummary?: string;
  historyText?: string;
  historyUser?: string;
  history?: {
    status?: string;
    timestamp?: string;
    actor?: string;
  };
  footerMeta?: string;
  createdTimestamp?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const DocDetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  statusBadge = badge?.text,
  status,
  statusVariant = (badge?.variant as any) || 'info',
  fields,
  summary,
  changesSummary,
  historyText,
  historyUser = 'ananya.rao@brightcone.ai',
  history,
  footerMeta,
  createdTimestamp,
  onEdit,
  onDelete,
}) => {
  if (!isOpen) return null;

  const effStatus = status || statusBadge || 'Under review';
  const effSummary = summary || changesSummary;
  const effHistoryStatus = history?.status || effStatus;
  const effHistoryTime = history?.timestamp || '28 Oct 2026, 10:57 am';
  const effHistoryUser = history?.actor || historyUser;
  const effFooter =
    footerMeta ||
    createdTimestamp ||
    `Created 28 Oct 2026, 10:57 am by ${effHistoryUser}. Last updated 28 Oct 2026, 10:57 am.`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0d1527] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          
          {/* Top Section matching Image 2 */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Pill with dot matching Image 2 */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                statusVariant === 'success' || effStatus === 'Published' || effStatus === 'Approved' || effStatus === 'Paid'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                  : statusVariant === 'danger' || effStatus === 'Overdue' || effStatus === 'Declined' || effStatus === 'Rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  statusVariant === 'success' || effStatus === 'Published' || effStatus === 'Approved' || effStatus === 'Paid'
                    ? 'bg-emerald-500'
                    : statusVariant === 'danger' || effStatus === 'Overdue' || effStatus === 'Declined' || effStatus === 'Rejected'
                    ? 'bg-rose-500'
                    : 'bg-blue-500'
                }`} />
                {effStatus}
              </span>
            </div>

            {/* Fields matching Image 2 */}
            <div className="space-y-4 text-xs">
              {fields.map((f, i) => (
                <div key={i}>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                    {f.label}
                  </div>
                  {f.avatar ? (
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className={`w-8 h-8 rounded-full ${f.avatar.color || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                        {f.avatar.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {f.value}
                        </div>
                        {f.avatar.subtitle && (
                          <div className="text-[10px] text-slate-400">
                            {f.avatar.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : f.isFilePill || f.isFile ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <FileText size={13} className="text-slate-400" />
                      <span>{f.value}</span>
                    </div>
                  ) : (
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">
                      {f.value}
                    </div>
                  )}
                </div>
              ))}

              {/* Summary of changes */}
              {effSummary && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                    Summary of changes
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 text-xs">
                    {effSummary}
                  </div>
                </div>
              )}

              {/* History Block matching Image 2 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  History
                </h4>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {effHistoryStatus}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {effHistoryTime} · {effHistoryUser}
                  </div>
                </div>
              </div>

              {/* Created & Updated footer line */}
              <div className="pt-3 text-[11px] text-slate-400 leading-relaxed">
                {effFooter}
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons matching Image 2 */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onEdit) onEdit();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onDelete) onDelete();
              }}
              className="px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocDetailDrawer;

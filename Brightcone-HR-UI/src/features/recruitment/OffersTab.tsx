import React, { useState } from 'react';
import { Candidate } from '../../types/recruitment.types';
import { Award, CheckCircle, Send, CheckCircle2, FileText, IndianRupee, Calendar } from 'lucide-react';

interface OffersTabProps {
  candidates: Candidate[];
  onUpdateStage: (id: number, newStage: string) => Promise<void>;
}

interface OfferData {
  status: 'Draft' | 'Submitted' | 'Accepted';
  ctc: number;
  joinDate: string;
}

export const OffersTab: React.FC<OffersTabProps> = ({ candidates, onUpdateStage }) => {
  // Local offer metadata store for candidates at offer stage
  const [offerDetails, setOfferDetails] = useState<Record<number, OfferData>>({
    1: { status: 'Draft', ctc: 2800000, joinDate: '2026-11-15' },
    2: { status: 'Submitted', ctc: 3400000, joinDate: '2026-11-01' },
    3: { status: 'Accepted', ctc: 4200000, joinDate: '2026-10-25' },
  });

  // Send offer modal state (matching reference sendOffer(id))
  const [activeSendOfferCand, setActiveSendOfferCand] = useState<Candidate | null>(null);
  const [offerCtc, setOfferCtc] = useState<number>(3000000);
  const [offerJoiningDate, setOfferJoiningDate] = useState<string>('2026-11-15');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const offerCandidates = candidates.filter((c) => {
    const s = c.status.toLowerCase();
    return s === 'offer' || s === 'selected' || s === 'hired';
  });

  const handleOpenSendOffer = (cand: Candidate) => {
    setActiveSendOfferCand(cand);
    const existing = offerDetails[cand.id];
    if (existing) {
      setOfferCtc(existing.ctc);
      setOfferJoiningDate(existing.joinDate);
    } else {
      setOfferCtc(3200000);
      setOfferJoiningDate('2026-11-15');
    }
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSendOfferCand) return;

    setOfferDetails((prev) => ({
      ...prev,
      [activeSendOfferCand.id]: {
        status: 'Submitted',
        ctc: offerCtc,
        joinDate: offerJoiningDate,
      },
    }));

    setFeedbackToast(`Offer letter sent to ${activeSendOfferCand.name}!`);
    setTimeout(() => {
      setActiveSendOfferCand(null);
      setFeedbackToast(null);
    }, 1500);
  };

  const handleAcceptOffer = async (cand: Candidate) => {
    setOfferDetails((prev) => ({
      ...prev,
      [cand.id]: {
        status: 'Accepted',
        ctc: prev[cand.id]?.ctc || 3200000,
        joinDate: prev[cand.id]?.joinDate || '2026-11-01',
      },
    }));

    await onUpdateStage(cand.id, 'Hired');
    setFeedbackToast(`${cand.name} hired! Employee record and onboarding checklist created.`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Offers Card (Matching reference card('Offers', tbl(...))) */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2B52] flex items-center justify-between text-xs text-slate-500 dark:text-[#93A0C4]">
          <span className="font-['Sora',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
            Offers ({offerCandidates.length})
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-[#93A0C4]">
            {offerCandidates.filter((c) => c.status === 'Hired').length} Hired • {offerCandidates.length} in pipeline
          </span>
        </div>

        {offerCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-[#93A0C4] uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1D2B52]">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Fit</th>
                  <th className="py-3.5 px-4">Compensation (CTC)</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {offerCandidates.map((cand) => {
                  const fit = cand.match_score || ((cand.id * 17) % 25 + 75);
                  const offer =
                    offerDetails[cand.id] ||
                    (cand.status === 'Hired'
                      ? { status: 'Accepted', ctc: 3500000, joinDate: '2026-11-01' }
                      : { status: 'Draft', ctc: 2800000, joinDate: '2026-11-15' });

                  const initials = cand.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                    >
                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B87FF] to-[#14B8E6] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <b className="font-semibold text-slate-900 dark:text-white text-sm">
                              {cand.name}
                            </b>
                            <div className="text-[11px] text-slate-500 dark:text-[#93A0C4]">
                              {cand.job_title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fit score */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                          {fit}%
                        </span>
                      </td>

                      {/* Compensation */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          ₹{offer.ctc.toLocaleString()} / year
                        </span>
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 dark:text-[#93A0C4]">
                          {offer.joinDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            offer.status === 'Accepted' || cand.status === 'Hired'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : offer.status === 'Submitted'
                              ? 'bg-sky-50 dark:bg-sky-500/15 text-[#0B87FF] border-sky-200 dark:border-sky-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {cand.status === 'Hired' ? 'Accepted' : offer.status}
                        </span>
                      </td>

                      {/* Actions: Send Offer or Mark Accepted */}
                      <td className="py-3.5 px-4 text-right">
                        {cand.status === 'Hired' || offer.status === 'Accepted' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Hired</span>
                          </span>
                        ) : offer.status === 'Submitted' ? (
                          <button
                            onClick={() => handleAcceptOffer(cand)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark accepted</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSendOffer(cand)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send offer</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-[#93A0C4]">
            <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <h4 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              No candidates at offer stage.
            </h4>
            <p className="text-xs">
              Move candidates from Interview to Offer stage in the Pipeline Kanban board.
            </p>
          </div>
        )}
      </div>

      {/* SEND OFFER MODAL (Matching reference sendOffer(id)) */}
      {activeSendOfferCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] p-6 shadow-2xl">
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              Offer for {activeSendOfferCand.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#93A0C4] mb-4">
              Requisition: <b>{activeSendOfferCand.job_title}</b>
            </p>

            <form onSubmit={handleSendOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Annual CTC (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={offerCtc}
                    onChange={(e) => setOfferCtc(Number(e.target.value))}
                    placeholder="e.g. 3200000"
                    className="w-full pl-3.5 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Joining date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={offerJoiningDate}
                  onChange={(e) => setOfferJoiningDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#0B87FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSendOfferCand(null)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md transition cursor-pointer"
                >
                  Send offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersTab;

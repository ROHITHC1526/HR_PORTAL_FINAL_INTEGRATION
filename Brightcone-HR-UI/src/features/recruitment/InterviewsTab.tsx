import React, { useState } from 'react';
import { Interview } from '../../types/recruitment.types';
import { SearchInput } from '../../components/common/SearchInput';
import { Calendar, Clock, Plus, Video, CheckCircle2, FileText, Star } from 'lucide-react';

interface InterviewsTabProps {
  interviews: Interview[];
  onOpenScheduleModal: () => void;
}

export const InterviewsTab: React.FC<InterviewsTabProps> = ({
  interviews,
  onOpenScheduleModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Scorecard modal state (matching reference scorecard(id))
  const [scorecardInterview, setScorecardInterview] = useState<Interview | null>(null);
  const [recommendation, setRecommendation] = useState<'Strong hire' | 'Hire' | 'No hire' | 'Strong no hire'>('Hire');
  const [scorecardNotes, setScorecardNotes] = useState('');
  const [scorecardSubmittedMsg, setScorecardSubmittedMsg] = useState<string | null>(null);

  const filteredInterviews = interviews.filter((intv) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      intv.candidate_name.toLowerCase().includes(q) ||
      (intv.job_title || '').toLowerCase().includes(q) ||
      intv.interviewer.toLowerCase().includes(q) ||
      (intv.interview_type || '').toLowerCase().includes(q)
    );
  });

  const handleScorecardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorecardInterview) return;
    setScorecardSubmittedMsg(`Scorecard submitted for ${scorecardInterview.candidate_name}!`);
    setTimeout(() => {
      setScorecardInterview(null);
      setScorecardSubmittedMsg(null);
      setScorecardNotes('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by candidate, role, interviewer or round..."
          className="w-full md:max-w-md"
        />

        <button
          onClick={onOpenScheduleModal}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule interview</span>
        </button>
      </div>

      {/* Scheduled Interviews Card (Matching reference card('Scheduled interviews', tbl(...))) */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2B52] flex items-center justify-between text-xs text-slate-500 dark:text-[#93A0C4]">
          <span className="font-['Sora',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
            Scheduled interviews ({interviews.length})
          </span>
          <button
            onClick={onOpenScheduleModal}
            className="text-xs font-semibold text-[#0B87FF] hover:underline cursor-pointer"
          >
            + Schedule interview
          </button>
        </div>

        {filteredInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-[#93A0C4] uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1D2B52]">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Round</th>
                  <th className="py-3.5 px-4">When</th>
                  <th className="py-3.5 px-4">Panel</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredInterviews.map((intv) => {
                  const d = new Date(intv.interview_date || intv.formatted_date || Date.now());
                  const formattedWhen = isNaN(d.getTime())
                    ? intv.formatted_date || intv.interview_date
                    : d.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                  const initials = intv.candidate_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={intv.id}
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
                              {intv.candidate_name}
                            </b>
                            <div className="text-[11px] text-slate-500 dark:text-[#93A0C4]">
                              {intv.job_title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Round */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/15 text-[#0B87FF] border border-sky-200 dark:border-sky-500/30">
                          {intv.interview_type}
                        </span>
                      </td>

                      {/* When */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0B87FF]" />
                          <span>{formattedWhen}</span>
                        </div>
                      </td>

                      {/* Panel */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {intv.interviewer}
                        </div>
                      </td>

                      {/* Action: Add scorecard */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setScorecardInterview(intv)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-sky-50 dark:bg-[#122042] dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-[#0B87FF] border border-slate-200 dark:border-[#1D2B52] transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0B87FF]" />
                          <span>Add scorecard</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-[#93A0C4]">
            <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <h4 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              No interviews scheduled.
            </h4>
            <p className="text-xs mb-4">Coordinate assessment rounds with shortlisted candidates.</p>
            <button
              onClick={onOpenScheduleModal}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0B87FF] text-white hover:bg-[#0976e0] transition cursor-pointer shadow-md"
            >
              Schedule interview
            </button>
          </div>
        )}
      </div>

      {/* INTERVIEW SCORECARD MODAL (Matching reference scorecard(id)) */}
      {scorecardInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] p-6 shadow-2xl">
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              Interview scorecard
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#93A0C4] mb-4">
              Shared with the hiring team for <b>{scorecardInterview.candidate_name}</b> ({scorecardInterview.interview_type}).
            </p>

            {scorecardSubmittedMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{scorecardSubmittedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleScorecardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Recommendation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0B87FF] cursor-pointer"
                  >
                    <option value="Strong hire">Strong hire (Exceeds technical bar)</option>
                    <option value="Hire">Hire (Meets required criteria)</option>
                    <option value="No hire">No hire (Does not meet bar)</option>
                    <option value="Strong no hire">Strong no hire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Evaluation Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={scorecardNotes}
                    onChange={(e) => setScorecardNotes(e.target.value)}
                    placeholder="Candidate's technical depth, problem-solving, code architecture, and cultural fit feedback..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScorecardInterview(null)}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md transition cursor-pointer"
                  >
                    Submit scorecard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsTab;

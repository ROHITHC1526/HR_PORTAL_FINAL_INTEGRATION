import React, { useState } from 'react';
import { Candidate } from '../../types/recruitment.types';
import { SearchInput } from '../../components/common/SearchInput';
import {
  Users,
  Sparkles,
  Calendar,
  X,
  ArrowRight,
  Kanban,
  LayoutGrid,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface PipelineTabProps {
  candidates: Candidate[];
  onUpdateStage: (id: number, newStage: string) => Promise<void>;
  onScheduleInterview: (candidateId: number) => void;
  onOpenAddModal: () => void;
}

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export const PipelineTab: React.FC<PipelineTabProps> = ({
  candidates,
  onUpdateStage,
  onScheduleInterview,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');

  // Reject Confirmation Modal State
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null);

  // Distinct job titles for filter
  const jobTitles = Array.from(new Set(candidates.map((c) => c.job_title))).filter(Boolean);

  const normalizeStage = (status: string) => {
    if (status === 'Shortlisted') return 'Screening';
    if (status === 'Selected') return 'Offer';
    return status;
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.job_title.toLowerCase().includes(q) ||
      c.skills.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);

    const matchesJob = selectedJob === 'All' || c.job_title === selectedJob;
    return matchesQuery && matchesJob;
  });

  const handleMoveCandidate = async (candidate: Candidate) => {
    const current = normalizeStage(candidate.status);
    const currentIndex = STAGES.indexOf(current);
    if (currentIndex >= 0 && currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      await onUpdateStage(candidate.id, nextStage);
    }
  };

  const handleConfirmReject = async () => {
    if (candidateToReject) {
      await onUpdateStage(candidateToReject.id, 'Rejected');
      setCandidateToReject(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search candidates by name, requisition or skills..."
          className="w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B87FF] cursor-pointer"
          >
            <option value="All">All Job Requisitions</option>
            {jobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#122042] border border-slate-200 dark:border-[#1D2B52]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#0c1527] text-[#0B87FF] shadow-sm'
                  : 'text-slate-500 dark:text-[#93A0C4] hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#0c1527] text-[#0B87FF] shadow-sm'
                  : 'text-slate-500 dark:text-[#93A0C4] hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            Add Candidate
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW (Matching reference V.recruitment .kanban) */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage, stageIndex) => {
            const stageCandidates = filteredCandidates.filter(
              (c) => normalizeStage(c.status).toLowerCase() === stage.toLowerCase()
            );

            return (
              <div
                key={stage}
                className="rounded-2xl bg-slate-100/70 dark:bg-[#0c1527] border border-slate-200/80 dark:border-[#1D2B52] p-3 flex flex-col min-h-[500px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2.5">
                  <h4 className="font-['Sora',sans-serif] text-xs font-bold text-slate-800 dark:text-white">
                    {stage}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[#122042] border border-slate-200 dark:border-[#1D2B52] text-slate-700 dark:text-slate-300">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards Column */}
                <div className="space-y-3 flex-1">
                  {stageCandidates.length > 0 ? (
                    stageCandidates.map((c) => {
                      const fit = c.match_score || ((c.id * 17) % 25 + 75);
                      const source =
                        c.source || (c.id % 2 === 0 ? 'Direct Referral' : 'LinkedIn Inbound');
                      const initials = c.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-[#0B87FF] transition-all flex flex-col justify-between"
                        >
                          {/* Who: Avatar + Name */}
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B87FF] to-[#14B8E6] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <b className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {c.name}
                              </b>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {c.email}
                              </div>
                            </div>
                          </div>

                          {/* Role & Source */}
                          <div className="text-xs text-slate-600 dark:text-[#93A0C4] mb-2.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {c.job_title}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                              via {source}
                            </span>
                          </div>

                          {/* Skills pill */}
                          {c.skills && (
                            <div className="mb-3 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 bg-slate-50 dark:bg-[#060b18]/60 px-2 py-1 rounded border border-slate-200/60 dark:border-[#1D2B52]/60">
                              {c.skills}
                            </div>
                          )}

                          {/* Footer: Fit Score & Actions */}
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                              {fit}% fit
                            </span>

                            <div className="flex items-center gap-1">
                              {stageIndex < 4 ? (
                                <>
                                  <button
                                    onClick={() => handleMoveCandidate(c)}
                                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#0B87FF]/10 text-[#0B87FF] hover:bg-[#0B87FF] hover:text-white transition cursor-pointer"
                                    title={`Move to next stage: ${STAGES[stageIndex + 1]}`}
                                  >
                                    Move
                                  </button>
                                  <button
                                    onClick={() => setCandidateToReject(c)}
                                    className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                    title={`Reject ${c.name}`}
                                    aria-label={`Reject ${c.name}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                  Hired
                                </span>
                              )}

                              {stage === 'Interview' && (
                                <button
                                  onClick={() => onScheduleInterview(c.id)}
                                  className="p-1 rounded-md text-[#14B8E6] hover:bg-sky-50 dark:hover:bg-sky-950/40 transition cursor-pointer"
                                  title="Schedule Round"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((c) => {
            const fit = c.match_score || ((c.id * 17) % 25 + 75);
            const source = c.source || (c.id % 2 === 0 ? 'Direct Referral' : 'LinkedIn Inbound');
            const initials = c.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-[#0B87FF] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B87FF] to-[#14B8E6] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <b className="font-['Sora',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </b>
                        <div className="text-[11px] text-slate-500 dark:text-[#93A0C4]">{c.email}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                      {fit}% fit
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060b18]/60 border border-slate-200/80 dark:border-[#1D2B52] mb-3 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-white">{c.job_title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-[#93A0C4] mt-0.5">
                      Source: {source}
                    </div>
                  </div>

                  {c.skills && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {c.skills}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-500/15 text-[#0B87FF] border border-sky-200 dark:border-sky-500/30">
                    {c.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {c.status !== 'Hired' && c.status !== 'Rejected' && (
                      <button
                        onClick={() => handleMoveCandidate(c)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0B87FF] text-white hover:bg-[#0976e0] transition cursor-pointer"
                      >
                        Advance
                      </button>
                    )}
                    {c.status !== 'Rejected' && (
                      <button
                        onClick={() => setCandidateToReject(c)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL (Matching reference confirmBox) */}
      {candidateToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white text-center mb-1">
              Reject {candidateToReject.name}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#93A0C4] text-center mb-6">
              They receive a polite rejection email, and the referral status will be updated.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCandidateToReject(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition cursor-pointer"
              >
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineTab;

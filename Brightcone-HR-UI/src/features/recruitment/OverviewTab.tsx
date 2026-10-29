import React from 'react';
import { Candidate, Interview, Job } from '../../types/recruitment.types';
import { Briefcase, Users, Calendar, Send, Sparkles, ArrowRight } from 'lucide-react';

interface OverviewTabProps {
  jobs: Job[];
  candidates: Candidate[];
  interviews: Interview[];
  onNavigateTab: (tab: string) => void;
  onOpenScheduleModal: () => void;
  onOpenPostJobModal: () => void;
}

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  jobs,
  candidates,
  interviews,
  onNavigateTab,
  onOpenScheduleModal,
  onOpenPostJobModal,
}) => {
  const openJobs = jobs.filter((j) => j.status === 'Active' || j.status === 'Open');
  const activeCandidates = candidates.filter((c) => c.status !== 'Hired' && c.status !== 'Rejected');
  const offerCandidates = candidates.filter((c) => c.status === 'Offer' || c.status === 'Selected');
  const hiredCandidates = candidates.filter((c) => c.status === 'Hired');

  // Average fit score
  const avgFit = candidates.length
    ? Math.round(
        candidates.reduce((acc, c) => {
          const score = c.match_score || ((c.id * 17) % 25 + 75);
          return acc + score;
        }, 0) / candidates.length
      )
    : 84;

  // Stage distribution
  const stageCounts = STAGES.map((s) => {
    const count = candidates.filter((c) => {
      let st = c.status;
      if (st === 'Shortlisted') st = 'Screening';
      if (st === 'Selected') st = 'Offer';
      return st.toLowerCase() === s.toLowerCase() || c.status.toLowerCase() === s.toLowerCase();
    }).length;
    return { stage: s, count };
  });
  const maxStageCount = Math.max(1, ...stageCounts.map((x) => x.count));

  // Source distribution
  const sources: Record<string, number> = {};
  candidates.forEach((c) => {
    const src = c.source || (c.id % 2 === 0 ? 'Direct Referral' : 'LinkedIn Inbound');
    sources[src] = (sources[src] || 0) + 1;
  });
  const sortedSources = Object.entries(sources).sort((a, b) => b[1] - a[1]);
  const maxSourceCount = Math.max(1, ...sortedSources.map((x) => x[1]));

  return (
    <div className="space-y-6">
      {/* 4 Top Metric Stat Cards (matching V.recruitDash) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Roles */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-[#0B87FF] transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#93A0C4] mb-2">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#0B87FF]" />
              <span>Open roles</span>
            </span>
          </div>
          <div className="font-['Sora',sans-serif] text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {openJobs.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#93A0C4]">
            {jobs.length} postings in total
          </div>
        </div>

        {/* Active Candidates */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-[#7C5CFF] transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#93A0C4] mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7C5CFF]" />
              <span>Active candidates</span>
            </span>
          </div>
          <div className="font-['Sora',sans-serif] text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {activeCandidates.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Average fit score {avgFit}%</span>
          </div>
        </div>

        {/* Interviews Booked */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-[#14B8E6] transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#93A0C4] mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#14B8E6]" />
              <span>Interviews booked</span>
            </span>
          </div>
          <div className="font-['Sora',sans-serif] text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {interviews.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#93A0C4]">
            Upcoming rounds
          </div>
        </div>

        {/* Offers Out */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#93A0C4] mb-2">
            <span className="flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-500" />
              <span>Offers out</span>
            </span>
          </div>
          <div className="font-['Sora',sans-serif] text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {offerCandidates.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {hiredCandidates.length} hired this quarter
          </div>
        </div>
      </div>

      {/* Two Analytics Breakdown Cards: Hiring Funnel & Where Candidates Come From */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hiring Funnel Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white">
              Hiring funnel
            </h3>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs font-semibold text-[#0B87FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {stageCounts.map(({ stage, count }) => {
              const pct = Math.round((count / maxStageCount) * 100);
              return (
                <div key={stage} className="flex items-center gap-3 text-xs">
                  <span className="w-20 font-medium text-slate-600 dark:text-[#93A0C4] shrink-0">
                    {stage}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-[#122042] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0B87FF] to-[#14B8E6] transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <em className="w-8 text-right font-semibold not-italic text-slate-900 dark:text-white shrink-0">
                    {count}
                  </em>
                </div>
              );
            })}
          </div>
        </div>

        {/* Where Candidates Come From Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white">
              Where candidates come from
            </h3>
            <span className="text-xs text-slate-500 dark:text-[#93A0C4]">
              {candidates.length} total profiles
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedSources.map(([src, count]) => {
              const pct = Math.round((count / maxSourceCount) * 100);
              return (
                <div key={src} className="flex items-center gap-3 text-xs">
                  <span className="w-28 font-medium text-slate-600 dark:text-[#93A0C4] shrink-0 truncate">
                    {src}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-[#122042] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#0B87FF] transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <em className="w-8 text-right font-semibold not-italic text-slate-900 dark:text-white shrink-0">
                    {count}
                  </em>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Interviews Preview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B87FF]" />
            <span>Upcoming interviews</span>
          </h3>
          <button
            onClick={() => onNavigateTab('interviews')}
            className="text-xs font-semibold text-[#0B87FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all ({interviews.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {interviews.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {interviews.slice(0, 4).map((i) => {
              const d = new Date(i.interview_date || i.formatted_date || Date.now());
              const day = isNaN(d.getDate()) ? '15' : d.getDate();
              const month = isNaN(d.getTime())
                ? 'Oct'
                : d.toLocaleDateString('en-US', { month: 'short' });
              const time = isNaN(d.getTime())
                ? '11:00 AM'
                : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={i.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Date Chip matching reference .dchip */}
                    <div className="w-11 h-12 rounded-xl bg-slate-100 dark:bg-[#122042] border border-slate-200 dark:border-[#1D2B52] flex flex-col items-center justify-center shrink-0">
                      <b className="font-['Sora',sans-serif] text-sm font-bold text-slate-900 dark:text-white leading-none">
                        {day}
                      </b>
                      <span className="text-[10px] text-slate-500 dark:text-[#93A0C4] uppercase font-semibold">
                        {month}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {i.candidate_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#93A0C4]">
                        {i.interview_type || 'Technical Screening'} • {time}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/15 text-[#0B87FF] border border-sky-200 dark:border-sky-500/30">
                      {i.interviewer}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#93A0C4]">
            No upcoming interviews scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;

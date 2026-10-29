import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recruitmentApi } from '../../api/recruitment.api';
import {
  Candidate,
  CreateCandidatePayload,
  CreateJobPayload,
  Interview,
  Job,
  ScheduleInterviewPayload,
} from '../../types/recruitment.types';
import { OverviewTab } from './OverviewTab';
import { PipelineTab } from './PipelineTab';
import { JobsTab } from './JobsTab';
import { InterviewsTab } from './InterviewsTab';
import { OffersTab } from './OffersTab';
import { ReferralsTab } from './ReferralsTab';
import { PostJobModal } from './PostJobModal';
import { CandidateModal } from './CandidateModal';
import { InterviewModal } from './InterviewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Toast } from '../../components/common/Toast';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  Gift,
  Plus,
  LayoutDashboard,
} from 'lucide-react';

export const RecruitmentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pipeline';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [scheduleForCandidateId, setScheduleForCandidateId] = useState<number | undefined>();

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [j, c, i] = await Promise.all([
        recruitmentApi.getJobs(),
        recruitmentApi.getCandidates(),
        recruitmentApi.getInterviews(),
      ]);
      setJobs(j);
      setCandidates(c);
      setInterviews(i);
    } catch {
      setToastType('error');
      setToastMessage('Could not load recruitment data. Backend may be offline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open modal if action is in URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      if (currentTab === 'jobs') setIsPostJobModalOpen(true);
      else setIsAddCandidateModalOpen(true);
    } else if (action === 'schedule') {
      setIsScheduleInterviewModalOpen(true);
    }
  }, [searchParams, currentTab]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Handlers
  const handlePostJob = async (payload: CreateJobPayload) => {
    try {
      const newJob = await recruitmentApi.createJob(payload);
      setJobs((prev) => [newJob, ...prev]);
      setToastType('success');
      setToastMessage(`Job requisition '${newJob.title}' published successfully!`);
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to create job');
    }
  };

  const handleToggleJobStatus = async (id: number, currentStatus: string) => {
    const newStatus =
      currentStatus === 'Active' || currentStatus === 'Open' ? 'Closed' : 'Active';
    try {
      await recruitmentApi.updateJobStatus(id, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
      );
      setToastType('success');
      setToastMessage(`Job status changed to ${newStatus}`);
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to update job status');
    }
  };

  const handleAddCandidate = async (payload: CreateCandidatePayload) => {
    try {
      const newCandidate = await recruitmentApi.createCandidate(payload);
      setCandidates((prev) => [newCandidate, ...prev]);
      setToastType('success');
      setToastMessage(`Candidate '${newCandidate.name}' added and assigned to requisition!`);
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to add candidate');
    }
  };

  const handleUpdateCandidateStage = async (id: number, newStage: string) => {
    try {
      await recruitmentApi.updateCandidateStatus(id, newStage);
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStage } : c))
      );
      setToastType('success');
      setToastMessage(`Candidate stage updated to '${newStage}'!`);
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleScheduleInterview = async (payload: ScheduleInterviewPayload) => {
    try {
      const newInterview = await recruitmentApi.scheduleInterview(payload);
      setInterviews((prev) => [newInterview, ...prev]);
      // Candidate stage is updated to Interview
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === payload.candidate_id ? { ...c, status: 'Interview' } : c
        )
      );
      setToastType('success');
      setToastMessage(
        `Interview booked with '${newInterview.candidate_name}' for ${newInterview.formatted_date}!`
      );
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to schedule interview');
    }
  };

  // Reference Sub-sections: Overview (recruitDash), Pipeline, Jobs, Interviews, Offers, Referrals
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Pipeline', icon: <Users className="w-4 h-4" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'interviews', label: 'Interviews', icon: <Calendar className="w-4 h-4" /> },
    { id: 'offers', label: 'Offers', icon: <Award className="w-4 h-4" /> },
    { id: 'referrals', label: 'Referrals', icon: <Gift className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return <LoadingSpinner label="Loading talent acquisition modules..." size="lg" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header matching reference head('Recruitment', 'Bright HR agent screens applicants...') */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1D2B52]">
        <div>
          <div className="font-['Sora',sans-serif] font-bold text-xs uppercase text-[#0B87FF] tracking-wider mb-1">
            Recruit
          </div>
          <h2 className="font-['Sora',sans-serif] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currentTab === 'overview' ? 'Recruit dashboard' : 'Recruitment'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#93A0C4] mt-1">
            {currentTab === 'overview'
              ? 'Hiring health across every open role, scored by the Bright HR agent.'
              : 'Bright HR agent screens applicants and scores fit. Manage jobs, interviews, and offers here.'}
          </p>
        </div>

        {/* Header Action Buttons matching reference */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScheduleInterviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0c1527] hover:bg-slate-50 dark:hover:bg-[#122042] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1D2B52] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-[#0B87FF]" />
            <span>Schedule interview</span>
          </button>

          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a job</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation matching reference T=['Pipeline','Jobs','Interviews','Offers','Referrals'] */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-[#1D2B52] pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentTab === tab.id
                ? 'bg-sky-50 text-[#0B87FF] dark:bg-[#0B87FF]/20 dark:text-white border border-sky-300 dark:border-[#0B87FF]/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#93A0C4] dark:hover:text-white dark:hover:bg-[#122042] border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div>
        {currentTab === 'overview' && (
          <OverviewTab
            jobs={jobs}
            candidates={candidates}
            interviews={interviews}
            onNavigateTab={handleTabChange}
            onOpenScheduleModal={() => setIsScheduleInterviewModalOpen(true)}
            onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
          />
        )}

        {currentTab === 'pipeline' && (
          <PipelineTab
            candidates={candidates}
            onUpdateStage={handleUpdateCandidateStage}
            onScheduleInterview={(cid) => {
              setScheduleForCandidateId(cid);
              setIsScheduleInterviewModalOpen(true);
            }}
            onOpenAddModal={() => setIsAddCandidateModalOpen(true)}
          />
        )}

        {currentTab === 'jobs' && (
          <JobsTab
            jobs={jobs}
            candidates={candidates}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
            onToggleStatus={handleToggleJobStatus}
            onSelectJobForCandidates={() => handleTabChange('pipeline')}
          />
        )}

        {currentTab === 'interviews' && (
          <InterviewsTab
            interviews={interviews}
            onOpenScheduleModal={() => setIsScheduleInterviewModalOpen(true)}
          />
        )}

        {currentTab === 'offers' && (
          <OffersTab candidates={candidates} onUpdateStage={handleUpdateCandidateStage} />
        )}

        {currentTab === 'referrals' && <ReferralsTab jobs={jobs} />}
      </div>

      {/* Modals */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onPost={handlePostJob}
      />

      <CandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        onAdd={handleAddCandidate}
        jobs={jobs}
      />

      <InterviewModal
        isOpen={isScheduleInterviewModalOpen}
        onClose={() => {
          setIsScheduleInterviewModalOpen(false);
          setScheduleForCandidateId(undefined);
        }}
        onSchedule={handleScheduleInterview}
        candidates={candidates}
        preselectedCandidateId={scheduleForCandidateId}
      />
    </div>
  );
};

export default RecruitmentPage;

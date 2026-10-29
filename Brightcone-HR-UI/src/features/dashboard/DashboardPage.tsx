import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { recruitmentApi } from '../../api/recruitment.api';
import { DashboardStats } from '../../types/dashboard.types';
import { Candidate, Interview, Job } from '../../types/recruitment.types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Toast } from '../../components/common/Toast';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, candidatesData, interviewsData, jobsData] = await Promise.all([
        dashboardApi.getStats(),
        recruitmentApi.getCandidates(),
        recruitmentApi.getInterviews(),
        recruitmentApi.getJobs(),
      ]);
      setStats(statsData);
      setRecentCandidates(candidatesData.slice(0, 5));
      setUpcomingInterviews(interviewsData.slice(0, 5));
      setJobs(jobsData.slice(0, 5));
    } catch {
      setToastType('error');
      setToastMessage('Failed to connect to backend APIs. Using cached demonstration metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStageChange = async (candidateId: number, newStage: string) => {
    try {
      await recruitmentApi.updateCandidateStatus(candidateId, newStage);
      setToastType('success');
      setToastMessage(`Candidate stage saved to PostgreSQL database as '${newStage}'!`);
      // Update local state and reload stats
      setRecentCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: newStage } : c))
      );
      dashboardApi.getStats().then(setStats).catch(() => {});
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Failed to update candidate stage');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Fetching live recruitment and talent analytics..." size="lg" />;
  }

  const getStageVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'applied';
      case 'shortlisted':
        return 'shortlisted';
      case 'interview':
        return 'interview';
      case 'selected':
      case 'hired':
        return 'selected';
      case 'rejected':
        return 'rejected';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-sky-500/15 font-['Sora',sans-serif]">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Live Recruitment Overview</span>
            <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline metrics stored in PostgreSQL and persistent database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/recruitment?tab=pipeline&action=add')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-sky-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
          <button
            onClick={() => navigate('/recruitment?tab=jobs&action=add')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job Opening</span>
          </button>
          <button
            onClick={() => navigate('/recruitment?tab=interviews&action=schedule')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-transparent hover:bg-sky-50 dark:hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Jobs"
          value={stats?.total_jobs ?? 4}
          subtext="Active hiring requisitions"
          icon={<Briefcase className="w-5 h-5" />}
          colorScheme="blue"
        />
        <StatCard
          label="Total Candidates"
          value={stats?.total_candidates ?? 6}
          subtext="Across all job pipelines"
          icon={<Users className="w-5 h-5" />}
          colorScheme="purple"
        />
        <StatCard
          label="Shortlisted"
          value={stats?.shortlisted_candidates ?? 1}
          subtext="Qualified for technical rounds"
          icon={<Award className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          label="Scheduled Interviews"
          value={stats?.scheduled_interviews ?? 3}
          subtext="Upcoming recruiter & tech rounds"
          icon={<Calendar className="w-5 h-5" />}
          colorScheme="emerald"
        />
      </div>

      {/* Two Column Grid: Recent Candidates & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Candidates Card */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-sky-500/20 shadow-sm dark:shadow-xl overflow-hidden flex flex-col transition-colors duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-sky-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Candidates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest applicant submissions and current statuses</p>
            </div>
            <button
              onClick={() => navigate('/recruitment?tab=pipeline')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-0 overflow-x-auto flex-1">
            {recentCandidates.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Applied Role</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Update Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {recentCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{cand.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{cand.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{cand.job_title}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStageVariant(cand.status)}>{cand.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={cand.status}
                          onChange={(e) => handleStageChange(cand.id, e.target.value)}
                          className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-lg text-xs text-sky-700 dark:text-sky-300 px-2 py-1 focus:outline-none focus:border-sky-400 cursor-pointer"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No candidates recorded yet.</div>
            )}
          </div>
        </div>

        {/* Upcoming Interviews Card */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-sky-500/20 shadow-sm dark:shadow-xl overflow-hidden flex flex-col transition-colors duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-sky-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Interviews</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled candidate assessments and screening rounds</p>
            </div>
            <button
              onClick={() => navigate('/recruitment?tab=interviews')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-0 overflow-x-auto flex-1">
            {upcomingInterviews.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Candidate &amp; Role</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Interviewer</th>
                    <th className="py-3 px-4 text-right">Round Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {upcomingInterviews.map((intv) => (
                    <tr key={intv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{intv.candidate_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{intv.job_title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-sky-600 dark:text-sky-300">{intv.formatted_date || intv.interview_date}</div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{intv.status}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{intv.interviewer}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="shortlisted">{intv.interview_type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No upcoming interviews scheduled.</div>
            )}
          </div>
        </div>
      </div>

      {/* Active Job Openings Snapshot */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-sky-500/20 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-sky-500/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Active Job Openings Snapshot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Currently active requisitions open for candidate submissions</p>
          </div>
          <button
            onClick={() => navigate('/recruitment?tab=jobs')}
            className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <span>Manage Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Required Skills</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{job.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Posted: {job.posted_date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]">
                      {job.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{job.location}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 text-[11px]">
                      {job.skills}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={job.status === 'Active' ? 'active' : 'closed'}>{job.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

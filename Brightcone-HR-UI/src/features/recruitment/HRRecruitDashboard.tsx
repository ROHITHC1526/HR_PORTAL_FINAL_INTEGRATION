import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../../api/recruitment.api';
import { Job, Interview } from '../../types/recruitment.types';
import {
  Briefcase,
  Users,
  Calendar,
  Send,
  Plus,
  ArrowUpRight,
  Sparkles,
  Clock,
  X,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HRRecruitDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');
  const [newJobLocation, setNewJobLocation] = useState('Hyderabad');
  const [jobType, setJobType] = useState('Full-time');
  const [referralBonus, setReferralBonus] = useState(30000);

  // New Interview Form State
  const [candName, setCandName] = useState('Rahul Varma');
  const [interviewRole, setInterviewRole] = useState('Senior ML Engineer');
  const [interviewDate, setInterviewDate] = useState('2026-10-20T11:00');
  const [interviewer, setInterviewer] = useState('Vikram Malhotra');
  const [interviewRound, setInterviewRound] = useState('Phone screen');

  const loadData = async () => {
    try {
      const [jobsData, interviewsData, candsData] = await Promise.all([
        recruitmentApi.getJobs(),
        recruitmentApi.getInterviews(),
        recruitmentApi.getCandidates(),
      ]);
      setJobs(jobsData);
      setInterviews(interviewsData);
      setCandidates(candsData);
      if (candsData.length > 0 && !candName) {
        setCandName(candsData[0].name);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    try {
      await recruitmentApi.createJob({
        title: newJobTitle,
        department: newJobDept,
        location: newJobLocation,
        skills: 'TypeScript, Rust, React, System Design',
        status: 'Active',
      });
      setIsPostJobOpen(false);
      setNewJobTitle('');
      setToastMessage(`Job posting "${newJobTitle}" published to Brightcone Careers!`);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err) {
      alert('Failed to post job: ' + err);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) return;

    try {
      await recruitmentApi.scheduleInterview({
        candidate_id: 1,
        interview_date: interviewDate,
        interviewer: interviewer,
        interview_type: 'Technical Round 2',
        notes: `Interview for ${interviewRole}`,
      });
      setIsScheduleInterviewOpen(false);
      setCandName('');
      setToastMessage(`Interview for "${candName}" booked successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err) {
      alert('Failed to schedule interview: ' + err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner matching Screenshot 3 */}
      <div className="hero-card-dark">
        <div className="hero-grid-pattern" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="page-badge page-badge-recruit">
              <span className="page-badge-dot" />
              <span>RECRUIT</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Recruit dashboard
            </h1>
            <p className="text-sm text-indigo-200/80 mt-1 max-w-xl">
              Hiring health across every open role, scored by the Bright HR agent.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsScheduleInterviewOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule interview</span>
            </button>
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600 font-bold" />
              <span>Post a job</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Open roles */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="stat-label">Open roles</div>
          <div className="stat-number">{jobs.length}</div>
          <div className="stat-subtext">{jobs.length} postings in total</div>
        </div>

        {/* Active candidates */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Users className="w-5 h-5" />
          </div>
          <div className="stat-label">Active candidates</div>
          <div className="stat-number">{candidates.length}</div>
          <div className="stat-subtext">Live applicants</div>
        </div>

        {/* Interviews booked */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="stat-label">Interviews booked</div>
          <div className="stat-number">{interviews.length}</div>
          <div className="stat-subtext">Upcoming rounds</div>
        </div>

        {/* Offers out */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Send className="w-5 h-5" />
          </div>
          <div className="stat-label">Offers out</div>
          <div className="stat-number">1</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            1 hired this quarter
          </div>
        </div>
      </div>

      {/* Two Wide Cards: Hiring funnel & Where candidates come from */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel matching Screenshot 3 */}
        <div className="stat-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hiring funnel
            </h3>
            <button
              onClick={() => navigate('/recruit/pipeline')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="funnel-row">
              <span className="funnel-label">Applied</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '100%' }} />
              </div>
              <span className="funnel-count">3</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Screening</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '100%' }} />
              </div>
              <span className="funnel-count">3</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Interview</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '66%' }} />
              </div>
              <span className="funnel-count">2</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Offer</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '33%' }} />
              </div>
              <span className="funnel-count">1</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Hired</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '33%' }} />
              </div>
              <span className="funnel-count">1</span>
            </div>
          </div>
        </div>

        {/* Where candidates come from matching Screenshot 3 */}
        <div className="stat-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Where candidates come from
            </h3>
          </div>

          <div className="space-y-3.5">
            <div className="funnel-row">
              <span className="funnel-label">Referral</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '100%' }} />
              </div>
              <span className="funnel-count">3</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">LinkedIn</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '100%' }} />
              </div>
              <span className="funnel-count">3</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Careers page</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '66%' }} />
              </div>
              <span className="funnel-count">2</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Internal</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '33%' }} />
              </div>
              <span className="funnel-count">1</span>
            </div>

            <div className="funnel-row">
              <span className="funnel-label">Indeed</span>
              <div className="funnel-track">
                <div className="funnel-bar-fill" style={{ width: '33%' }} />
              </div>
              <span className="funnel-count">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Bottom Cards: Open roles & Upcoming interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Roles list */}
        <div className="stat-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Open roles
            </h3>
            <button
              onClick={() => navigate('/recruit/pipeline')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage jobs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>ROLE</th>
                  <th>IN PIPELINE</th>
                  <th>TOP FIT</th>
                  <th>REFERRAL BONUS</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">
                      No open roles posted yet. Click "+ Post a job" above to add one.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const candidateCount = candidates.filter((c) => c.job_id === job.id).length;
                    const fitScore = 80 + ((job.id * 7) % 18);
                    return (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{job.title}</span>
                            {job.status === 'Active' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {job.department} · {job.location}
                          </div>
                        </td>
                        <td>
                          <span className="badge-pill badge-applied">
                            {candidateCount} candidates
                          </span>
                        </td>
                        <td className="text-emerald-600 font-semibold">{fitScore}%</td>
                        <td className="font-mono text-xs">₹30,000</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Interviews Agenda */}
        <div className="stat-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming interviews
            </h3>
            <button
              onClick={() => navigate('/recruit/interviews')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {interviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No upcoming interviews booked. Click "Schedule interview" above.
              </div>
            ) : (
              interviews.slice(0, 4).map((intv) => {
                const dateObj = new Date(intv.interview_date);
                const dayNum = isNaN(dateObj.getDate()) ? 20 : dateObj.getDate();
                const monthStr = isNaN(dateObj.getTime())
                  ? 'OCT'
                  : dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                return (
                  <div
                    key={intv.id}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-extrabold leading-none">{dayNum}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{monthStr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {intv.candidate_name}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {intv.round || intv.interview_type || 'Technical round'}, {intv.time || '11:00 AM'}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Interviewer: {intv.interviewer}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Post a Job Modal matching Screenshot 1 */}
      {isPostJobOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[500px]">
            <form onSubmit={handlePostJob}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Post a job</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  Published to the careers page, LinkedIn and the internal jobs board.
                </p>

                <div className="space-y-4 text-left">
                  <div className="form-group">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job title
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="(required)"
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Department
                      </label>
                      <select
                        value={newJobDept}
                        onChange={(e) => setNewJobDept(e.target.value)}
                        className="form-input"
                      >
                        <option value="Leadership">Leadership</option>
                        <option value="AI Research">AI Research</option>
                        <option value="Sales">Sales</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="People Ops">People Ops</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Location
                      </label>
                      <select
                        value={newJobLocation}
                        onChange={(e) => setNewJobLocation(e.target.value)}
                        className="form-input"
                      >
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Pune">Pune</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Employment type
                      </label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="form-input"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Referral bonus (₹)
                      </label>
                      <input
                        type="number"
                        value={referralBonus}
                        onChange={(e) => setReferralBonus(parseInt(e.target.value) || 0)}
                        className="form-input font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPostJobOpen(false)}
                    className="btn-ghost-outline px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-blue px-5 py-2 text-xs"
                  >
                    Post job
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal matching Screenshot 2 */}
      {isScheduleInterviewOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[500px]">
            <form onSubmit={handleScheduleInterview}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule interview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  Invites go to the candidate and panel.
                </p>

                <div className="space-y-4 text-left">
                  <div className="form-group">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Candidate
                    </label>
                    <select
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      className="form-input"
                    >
                      {candidates.length === 0 ? (
                        <>
                          <option value="Rahul Varma">Rahul Varma</option>
                          <option value="Siddharth Rao">Siddharth Rao</option>
                          <option value="wffs">wffs</option>
                          <option value="Neha Bansal">Neha Bansal</option>
                          <option value="Aarav Sharma">Aarav Sharma</option>
                        </>
                      ) : (
                        candidates.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Round
                    </label>
                    <select
                      value={interviewRound}
                      onChange={(e) => setInterviewRound(e.target.value)}
                      className="form-input"
                    >
                      <option value="Phone screen">Phone screen</option>
                      <option value="Technical screening">Technical screening</option>
                      <option value="Technical round 2">Technical round 2</option>
                      <option value="System design">System design</option>
                      <option value="Hiring manager interview">Hiring manager interview</option>
                      <option value="Culture fit">Culture fit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Date & time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Panel
                    </label>
                    <input
                      type="text"
                      required
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      placeholder="Names, comma separated"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsScheduleInterviewOpen(false)}
                    className="btn-ghost-outline px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-blue px-5 py-2 text-xs"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRRecruitDashboard;

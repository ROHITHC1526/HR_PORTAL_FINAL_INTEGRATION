import React, { useState } from 'react';
import { Job, Candidate } from '../../types/recruitment.types';
import { SearchInput } from '../../components/common/SearchInput';
import { Briefcase, MapPin, Plus, Edit2, Users, IndianRupee, Clock } from 'lucide-react';

interface JobsTabProps {
  jobs: Job[];
  candidates?: Candidate[];
  onOpenPostJob: () => void;
  onEditJob?: (job: Job) => void;
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onSelectJobForCandidates?: (jobTitle: string) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  candidates = [],
  onOpenPostJob,
  onEditJob,
  onToggleStatus,
  onSelectJobForCandidates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      job.title.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      job.skills.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);

    const matchesDept = departmentFilter === 'All' || job.department === departmentFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      job.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesQuery && matchesDept && matchesStatus;
  });

  const getApplicantCount = (job: Job) => {
    return candidates.filter(
      (c) => c.job_id === job.id || c.job_title?.toLowerCase() === job.title.toLowerCase()
    ).length;
  };

  const departments = Array.from(new Set(jobs.map((j) => j.department))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search job postings by role, department or location..."
          className="w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B87FF] cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B87FF] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={onOpenPostJob}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a job</span>
          </button>
        </div>
      </div>

      {/* Job Postings Table (Matching reference card('Job postings', tbl(...))) */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2B52] flex items-center justify-between text-xs text-slate-500 dark:text-[#93A0C4]">
          <span className="font-['Sora',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
            Job postings ({filteredJobs.length})
          </span>
          <button
            onClick={onOpenPostJob}
            className="text-xs font-semibold text-[#0B87FF] hover:underline cursor-pointer"
          >
            + Post a job
          </button>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-[#93A0C4] uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1D2B52]">
                <tr>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4">Referral Bonus</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredJobs.map((job) => {
                  const isOpen = job.status === 'Active' || job.status === 'Open';
                  const appCount = getApplicantCount(job);
                  const bonus = (job.id * 25000) % 100000 + 30000;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                    >
                      {/* Role Title */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() =>
                            onSelectJobForCandidates && onSelectJobForCandidates(job.title)
                          }
                          className="font-bold text-slate-900 dark:text-white hover:text-[#0B87FF] cursor-pointer text-sm"
                        >
                          {job.title}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          #REQ-J{job.id}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#122042] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1D2B52] font-medium text-[11px]">
                          {job.department}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-[#93A0C4]">
                          <MapPin className="w-3.5 h-3.5 text-[#0B87FF]" />
                          <span>{job.location}</span>
                        </div>
                      </td>

                      {/* Applicants Count */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() =>
                            onSelectJobForCandidates && onSelectJobForCandidates(job.title)
                          }
                          className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{appCount} candidates</span>
                        </button>
                      </td>

                      {/* Referral Bonus */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 text-xs">
                          ₹{bonus.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isOpen
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onEditJob && (
                            <button
                              onClick={() => onEditJob(job)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1D2B52] hover:bg-slate-100 dark:hover:bg-[#122042] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                              title="Edit Job"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onToggleStatus(job.id, job.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              isOpen
                                ? 'bg-slate-100 hover:bg-rose-50 dark:bg-[#122042] dark:hover:bg-rose-950/30 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 border-slate-200 dark:border-[#1D2B52]'
                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100'
                            }`}
                          >
                            {isOpen ? 'Close' : 'Reopen'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-[#93A0C4]">
            <Briefcase className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <h4 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              No job postings found
            </h4>
            <p className="text-xs mb-4">Post a new opening to publish to LinkedIn and internal job board.</p>
            <button
              onClick={onOpenPostJob}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0B87FF] text-white hover:bg-[#0976e0] transition cursor-pointer shadow-md"
            >
              Post a job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsTab;

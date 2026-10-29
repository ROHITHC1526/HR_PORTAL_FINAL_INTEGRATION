import React, { useState } from 'react';
import { Job } from '../../types/recruitment.types';
import { Gift, Share2, Sparkles, UserPlus, CheckCircle2, Send, Briefcase } from 'lucide-react';

interface ReferralsTabProps {
  jobs: Job[];
}

interface ReferralRecord {
  id: string;
  cand: string;
  job: string;
  by: string;
  bonus: number;
  status: string;
  date: string;
}

export const ReferralsTab: React.FC<ReferralsTabProps> = ({ jobs }) => {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([
    {
      id: 'RF1',
      cand: 'Siddharth Rao',
      job: 'Staff Rust Distributed Systems Engineer',
      by: 'Rahul Varma',
      bonus: 75000,
      status: 'Interview',
      date: '2026-10-02',
    },
    {
      id: 'RF2',
      cand: 'Meera Krishnan',
      job: 'Principal AI Alignment Engineer',
      by: 'Ananya Rao',
      bonus: 100000,
      status: 'Screening',
      date: '2026-10-05',
    },
    {
      id: 'RF3',
      cand: 'Arnav Gupta',
      job: 'Lead React & TypeScript Architect',
      by: 'Priya Menon',
      bonus: 50000,
      status: 'Hired',
      date: '2026-09-20',
    },
  ]);

  // Modal State for Refer Someone
  const [referJob, setReferJob] = useState<Job | null>(null);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candNotes, setCandNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenReferModal = (job: Job) => {
    setReferJob(job);
    setCandName('');
    setCandEmail('');
    setCandNotes('');
  };

  const handleReferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referJob || !candName.trim() || !candEmail.trim()) return;

    const newRef: ReferralRecord = {
      id: `RF${referrals.length + 1}`,
      cand: candName.trim(),
      job: referJob.title,
      by: 'You (Current User)',
      bonus: (referJob.id * 25000) % 100000 + 50000,
      status: 'Screening',
      date: new Date().toISOString().slice(0, 10),
    };

    setReferrals([newRef, ...referrals]);
    setToastMsg(`Referral submitted for ${candName}! We'll contact them and keep you posted.`);
    setReferJob(null);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApplyInternal = (job: Job) => {
    setToastMsg(`Application for internal transfer to '${job.title}' submitted to HR!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span>Jobs &amp; Employee Referrals</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#93A0C4] mt-1">
            Open roles at Brightcone. Refer someone great or apply internally. Referral bonus paid after the hire completes 90 days.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bonus Range: ₹50,000 – ₹1,50,000</span>
        </div>
      </div>

      {/* Employee Referrals Table (Matching reference card('Employee referrals', tbl(...))) */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2B52] flex items-center justify-between text-xs text-slate-500 dark:text-[#93A0C4]">
          <span className="font-['Sora',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
            Employee referrals ({referrals.length})
          </span>
          <span className="text-xs text-slate-500 dark:text-[#93A0C4]">
            Active referral bonus payouts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-[#93A0C4] uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1D2B52]">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Referred by</th>
                <th className="py-3.5 px-4">Bonus</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <b className="font-semibold text-slate-900 dark:text-white text-sm">{r.cand}</b>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{r.job}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-600 dark:text-[#93A0C4]">{r.by}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      ₹{r.bonus.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        r.status === 'Hired'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : r.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                          : 'bg-sky-50 dark:bg-sky-500/15 text-[#0B87FF] border-sky-200 dark:border-sky-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Roles & Referral Cards (Matching reference V.careers) */}
      <div>
        <h4 className="font-['Sora',sans-serif] text-sm font-bold text-slate-900 dark:text-white mb-3">
          Open Positions for Referral
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs
            .filter((j) => j.status === 'Active' || j.status === 'Open')
            .map((job) => {
              const bonus = (job.id * 25000) % 100000 + 50000;
              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] shadow-sm flex flex-col justify-between transition-colors"
                >
                  <div>
                    <h3 className="font-['Sora',sans-serif] text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {job.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-[#93A0C4] mb-3">
                      {job.department}, {job.location}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 my-3">
                      Referral bonus{' '}
                      <b className="text-amber-700 dark:text-amber-400">
                        ₹{bonus.toLocaleString()}
                      </b>{' '}
                      after the hire completes 90 days.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenReferModal(job)}
                      className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Refer someone</span>
                    </button>
                    <button
                      onClick={() => handleApplyInternal(job)}
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#122042] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Apply internally
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Check out ${job.title} at brightcone.ai (${job.location})`
                        );
                        setToastMsg(`Referral link for ${job.title} copied to clipboard!`);
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#0B87FF] dark:text-slate-400 bg-slate-100 dark:bg-[#122042] transition cursor-pointer"
                      title="Copy referral link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* REFER SOMEONE MODAL */}
      {referJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-[#1D2B52] p-6 shadow-2xl">
            <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white mb-1">
              Refer for {referJob.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#93A0C4] mb-4">
              We’ll contact them and keep you posted on every stage.
            </p>

            <form onSubmit={handleReferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0B87FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0B87FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Why are they a great fit?
                </label>
                <textarea
                  rows={3}
                  value={candNotes}
                  onChange={(e) => setCandNotes(e.target.value)}
                  placeholder="Notable projects, tech stack experience, background..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0B87FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReferJob(null)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#0B87FF] hover:bg-[#0976e0] text-white shadow-md transition cursor-pointer"
                >
                  Submit referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsTab;

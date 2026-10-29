import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { useAuth } from '../../context/AuthContext';
import { EmployeeReferral } from '../../types/employee.types';
import { CheckCircle2, X } from 'lucide-react';

interface JobCardData {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  bonus: number;
}

const DEFAULT_OPEN_ROLES: JobCardData[] = [
  {
    id: 'ROLE-00',
    title: 'pythin',
    department: 'Leadership',
    location: 'Hyderabad',
    type: 'Full-time',
    bonus: 30000,
  },
  {
    id: 'ROLE-01',
    title: 'Senior ML Engineer',
    department: 'AI Research',
    location: 'Hyderabad',
    type: 'Full-time',
    bonus: 50000,
  },
  {
    id: 'ROLE-02',
    title: 'Solutions Architect',
    department: 'Sales',
    location: 'San Francisco',
    type: 'Full-time',
    bonus: 75000,
  },
  {
    id: 'ROLE-03',
    title: 'Product Designer',
    department: 'Design',
    location: 'Hyderabad',
    type: 'Full-time',
    bonus: 40000,
  },
  {
    id: 'ROLE-04',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    location: 'Pune',
    type: 'Full-time',
    bonus: 30000,
  },
];

export const EmployeeRecruitPage: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<EmployeeReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobCardData | null>(null);

  // Form Fields matching Screenshot 2
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUserEmail = user?.email || 'rahul.varma@brightcone.ai';

  const fetchReferrals = async () => {
    try {
      const data = await employeesApi.getReferrals(currentUserEmail);
      setReferrals(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [currentUserEmail]);

  const handleOpenRefer = (job: JobCardData) => {
    setSelectedJob(job);
    setCandidateName('');
    setCandidateEmail('');
    setCandidatePhone('');
    setCandidateNotes('');
    setIsReferModalOpen(true);
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !candidateName.trim() || !candidateEmail.trim()) return;

    try {
      await employeesApi.createReferral({
        candidate_name: candidateName.trim(),
        role: selectedJob.title,
        referred_by: currentUserEmail,
        bonus: selectedJob.bonus,
        email: candidateEmail.trim(),
        phone: candidatePhone.trim(),
        notes: candidateNotes.trim(),
      });

      setIsReferModalOpen(false);
      setToastMessage(`Referral for "${candidateName}" submitted successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
      // Immediately refresh the table from backend database
      fetchReferrals();
    } catch (err) {
      alert('Failed to submit referral: ' + err);
    }
  };

  const handleApplyInternally = (job: JobCardData) => {
    setToastMessage(`Internal application submitted for ${job.title}! HR team will review.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching Image 1 */}
      <div>
        <div className="page-badge page-badge-recruit">
          <span className="page-badge-dot" />
          <span>RECRUIT</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Jobs & referrals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Open roles at Brightcone. Refer someone great or apply internally.
        </p>
      </div>

      {/* Open Roles Grid matching Image 1 */}
      <div className="open-roles-grid">
        {DEFAULT_OPEN_ROLES.map((role) => (
          <div key={role.id} className="job-card">
            <div>
              <h3 className="job-card-title">{role.title}</h3>
              <div className="job-card-meta">
                {role.department}, {role.location}, {role.type}
              </div>
              <div className="job-referral-bonus">
                Referral bonus <strong>₹{role.bonus.toLocaleString('en-IN')}</strong> after the hire completes 90 days.
              </div>
            </div>

            <div className="job-actions-row">
              <button
                type="button"
                onClick={() => handleOpenRefer(role)}
                className="btn-primary-blue cursor-pointer"
              >
                Refer someone
              </button>
              <button
                type="button"
                onClick={() => handleApplyInternally(role)}
                className="btn-ghost-outline cursor-pointer"
              >
                Apply internally
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* My Referrals Table Section matching Image 1 */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          My referrals
        </h2>

        <div className="data-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th className="w-1/3">CANDIDATE</th>
                <th className="w-1/3">ROLE</th>
                <th className="w-1/3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    Loading referrals...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    No referrals yet. Click "Refer someone" above to refer your network!
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="font-semibold text-slate-900 dark:text-white">
                      {ref.candidate_name}
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">
                      {ref.role}
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          ref.status.toLowerCase() === 'interview'
                            ? 'badge-interview'
                            : ref.status.toLowerCase() === 'offered' || ref.status.toLowerCase() === 'hired'
                            ? 'badge-approved'
                            : 'badge-applied'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{ref.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refer Candidate Modal matching Image 2 */}
      {isReferModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1226] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scaleIn">
            {/* Modal Title matching Image 2 */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Refer for {selectedJob.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We'll contact them and keep you posted.
              </p>
            </div>

            <form onSubmit={handleSubmitReferral} className="space-y-4">
              {/* Candidate name (required) */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Candidate name
                  <span className="block text-xs font-normal text-slate-400">(required)</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-400 dark:border-sky-500 bg-white dark:bg-[#0E1833] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Email (required) and Phone 2-columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Email
                    <span className="block text-xs font-normal text-slate-400">(required)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1833] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Phone
                    <span className="block text-xs font-normal text-transparent select-none">&nbsp;</span>
                  </label>
                  <input
                    type="tel"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1833] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Why are they a good fit? */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Why are they a good fit?
                </label>
                <textarea
                  rows={4}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1833] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                />
              </div>

              {/* Footer Buttons matching Image 2 */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReferModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md transition cursor-pointer"
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

export default EmployeeRecruitPage;

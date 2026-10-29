import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenSquare, FileSignature, ArrowRight, Eye, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { INITIAL_REQUESTS, INITIAL_TEMPLATES } from './mockData';
import { NewEnvelopeModal } from './components/NewEnvelopeModal';
import type { SignatureRequest } from './types';

export const SignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SignatureRequest[]>(INITIAL_REQUESTS);
  const [templates] = useState(INITIAL_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreated = (newReq: SignatureRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    showToast(`Signature request ${newReq.id} created and dispatched.`);
  };

  const completedCount = requests.filter((r) => r.status === 'signed').length;
  const awaitingCount = requests.filter((r) => r.status === 'pending').length;
  const viewedCount = requests.filter((r) => r.status === 'viewed' || (r.status as string) === 'Viewed').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-rose-700/30 bg-gradient-to-r from-[#2e0814] via-[#4d0d22] to-[#240610] p-6 lg:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
                SIGN & POLICIES
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Sign dashboard
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              Real-time signature envelope telemetry, governance handbooks, and policy compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PenSquare size={17} className="text-rose-600" />
              <span>New signature request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Awaiting signature</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {awaitingCount}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">Envelopes awaiting sign</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Eye size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Viewed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {viewedCount}
          </div>
          <div className="text-xs text-slate-400">Opened by recipient</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {completedCount}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Fully signed & sealed</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Declined</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-['Sora']">
            {declinedCount}
          </div>
          <div className="text-xs text-rose-500">Action declined</div>
        </div>
      </div>

      {/* Recent Envelopes */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent envelopes</h3>
          <button
            onClick={() => navigate('/doc-sign/requests')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all in signature requests</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="space-y-3">
          {requests.slice(0, 4).map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{req.title}</div>
                  <div className="text-[11px] text-slate-400">{req.recipient.name} · {req.dueDate}</div>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                req.status === 'signed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : req.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New signature request modal opened on the dashboard itself */}
      <NewEnvelopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreated}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default SignDashboard;

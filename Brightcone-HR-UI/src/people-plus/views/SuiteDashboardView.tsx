import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeoplePlus } from '../people-plus-context';
import { useUnifiedEmployees } from '../../services/employeeData';
import {
  Users,
  Inbox,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  LayoutGrid,
  Plus,
  Briefcase,
  Receipt,
  PenTool,
  MessageSquare,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const SuiteDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user, setActiveApp, setActiveView, openModal } = usePeoplePlus();
  const { employees } = useUnifiedEmployees();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wished, setWished] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWish = (name: string) => {
    setWished((prev) => ({ ...prev, [name]: true }));
    showToast(`Warm wishes and greetings sent to ${name}! 🎉`);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.name ? user.name.split(' ')[0] : 'Ananya';

  const headcount = employees.length > 0 ? employees.length : 14;

  const navigateApp = (key: string, route: string) => {
    setActiveApp(key as any);
    setActiveView(key === 'plus' ? 'suiteDash' : `${key}Dash`);
    navigate(route);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* 1. HERO GREETING BANNER matching Screenshot 2 */}
      {/* =================================================================== */}
      <div
        className="relative overflow-hidden rounded-2xl p-7 text-white shadow-md"
        style={{
          background: 'linear-gradient(135deg, #09172E 0%, #0D2144 50%, #102A56 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle grid pattern background overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-[#93C5FD] text-[11px] font-bold tracking-wider uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              PEOPLE PLUS
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-blue-200/80 mt-1.5 font-medium">
              Here's Brightcone today,{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              .
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={() => {
                setActiveApp('plus');
                setActiveView('suiteDash');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center gap-2 transition cursor-pointer backdrop-blur-xs shadow-xs"
            >
              <LayoutGrid size={15} />
              <span>All apps</span>
            </button>
            <button
              onClick={() => openModal('addEmp')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Add employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 TOP STAT CARDS matching Screenshot 2 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Headcount</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{headcount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            2 on probation, 1 serving notice
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <Inbox size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending approvals</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">8</div>
          <div className="text-xs font-bold text-[#EF4444] mt-1.5">Across all apps</div>
        </div>

        {/* Payroll, October */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <CreditCard size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payroll, October</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">Completed</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Payslips published
          </div>
        </div>

        {/* Training compliance */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Training compliance</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">58%</div>
          <div className="text-xs font-bold text-[#EF4444] mt-1.5">Mandatory courses</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. APPS GRID (3x3 Layout matching Screenshot 2) */}
      {/* =================================================================== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. People */}
          <div
            onClick={() => navigateApp('people', '/people')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#10B981] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#10B981] flex items-center justify-center">
                  <Users size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">People</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#10B981] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {headcount}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">employees</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">0 on leave today · 2 leave requests pending</div>
          </div>

          {/* 2. Recruit */}
          <div
            onClick={() => navigateApp('recruit', '/recruit')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#8B5CF6] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/60 text-[#8B5CF6] flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Recruit</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#8B5CF6] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              5{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">open roles</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">9 active candidates · 2 interviews booked</div>
          </div>

          {/* 3. Payroll */}
          <div
            onClick={() => navigateApp('payroll', '/payroll')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#10B981] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#10B981] flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Payroll</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#10B981] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              Done{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">October 2026</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Payslips published</div>
          </div>

          {/* 4. Expense */}
          <div
            onClick={() => navigateApp('expense', '/expense')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#F97316] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Expense</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#F97316] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹2,350{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">to review</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">1 pending claim</div>
          </div>

          {/* 5. Sign */}
          <div
            onClick={() => navigateApp('sign', '/sign')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#EC4899] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDF2F8] dark:bg-pink-950/60 text-[#EC4899] flex items-center justify-center">
                  <PenTool size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Sign</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#EC4899] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              3{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">awaiting signature</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">3 envelopes completed</div>
          </div>

          {/* 6. Connect */}
          <div
            onClick={() => navigateApp('connect', '/connect')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#06B6D4] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFEFF] dark:bg-cyan-950/60 text-[#06B6D4] flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Connect</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#06B6D4] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              4{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">posts</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">1 kudos shared · 4 groups</div>
          </div>

          {/* 7. Learn */}
          <div
            onClick={() => navigateApp('learn', '/learn')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#6366F1] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#6366F1] flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Learn</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              58%{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">compliant</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">3 mandatory courses · 5 total</div>
          </div>

          {/* 8. Shift */}
          <div
            onClick={() => navigateApp('shift', '/shift')}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#3B82F6] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#3B82F6] flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Shift</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              2{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">swap requests</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">4 shifts · roster in draft</div>
          </div>

          {/* 9. People Plus */}
          <div
            onClick={() => {
              setActiveApp('plus');
              setActiveView('suiteDash');
            }}
            className="group bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center">
                  <LayoutGrid size={18} />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">People Plus</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              33%{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">compliant</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">0 HR actions due · 6 advanced HR tools</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. GROSS PAYROLL CHART & APPROVALS WAITING matching Screenshot 3 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Gross payroll, last 6 months */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gross payroll, last 6 months
            </h3>
            <button
              onClick={() => navigate('/payroll')}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Open Payroll
            </button>
          </div>

          {/* SVG Area Line Chart with ₹49.4 L Callout */}
          <div className="relative pt-4 pb-2">
            <svg viewBox="0 0 500 170" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="payrollAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                points="30,85 110,85 190,82 270,78 350,72 430,120 430,150 30,150"
                fill="url(#payrollAreaGrad)"
              />

              {/* Grid / Baselines */}
              <line x1="30" y1="150" x2="470" y2="150" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="470" y2="80" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Curve Line */}
              <polyline
                points="30,85 110,85 190,82 270,78 350,72 430,120"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Point Circles */}
              {[
                { cx: 30, cy: 85 },
                { cx: 110, cy: 85 },
                { cx: 190, cy: 82 },
                { cx: 270, cy: 78 },
                { cx: 350, cy: 72 },
                { cx: 430, cy: 120 },
              ].map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.cx}
                  cy={p.cy}
                  r={idx === 5 ? 5 : 4}
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />
              ))}

              {/* Peak Value Callout */}
              <text x="400" y="105" fill="#0F172A" fontSize="13" fontWeight="bold">
                ₹49.4 L
              </text>
            </svg>

            {/* X Axis Months */}
            <div className="flex justify-between px-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>
        </div>

        {/* Right: Approvals waiting */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Approvals waiting
            </h3>
            <button
              onClick={() => {
                setActiveApp('plus');
                setActiveView('approvals');
              }}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Review all 8
            </button>
          </div>

          <div className="space-y-4">
            {/* Row 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                RV
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Rahul Varma</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    Leave
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Casual leave, 1 day (Oct 9)
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                PM
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Priya Menon</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    Leave
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Earned leave, 5 days (Oct 26 to Oct 30)
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                VS
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Vikram Singh</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    Regularisation
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Oct 3, 09:40 to 18:45. Forgot to clock out
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                RV
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Rahul Varma</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    Expense
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Meals, ₹2,350. Team dinner during release
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. BOTTOM 3 WIDGETS matching Screenshot 3 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: Coming up */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Coming up</h3>
          <div className="space-y-4">
            {/* 30 OCT */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black leading-none">30</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">OCT</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Full and final settlement</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Signature due from Farhan Ali</p>
              </div>
            </div>

            {/* 31 OCT */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black leading-none">31</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">OCT</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Information security awareness</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Training deadline</p>
              </div>
            </div>

            {/* 31 OCT */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black leading-none">31</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">OCT</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Travel & expense policy v4.0</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Signature due from Rahul Varma</p>
              </div>
            </div>

            {/* 8 NOV */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black leading-none">8</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">NOV</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Diwali</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Festival holiday</p>
              </div>
            </div>

            {/* 15 NOV */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black leading-none">15</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">NOV</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Data privacy & HIPAA basics</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Training deadline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Celebrations this month */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Celebrations this month
          </h3>
          <div className="space-y-4">
            {/* Meera Joshi */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  MJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Meera Joshi</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">3 years at Brightcone · Oct 2</p>
                </div>
              </div>
              <button
                onClick={() => handleWish('Meera Joshi')}
                disabled={wished['Meera Joshi']}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                {wished['Meera Joshi'] ? 'Wished 🎉' : 'Wish'}
              </button>
            </div>

            {/* Rahul Varma */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  RV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rahul Varma</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Birthday · Oct 7</p>
                </div>
              </div>
              <button
                onClick={() => handleWish('Rahul Varma')}
                disabled={wished['Rahul Varma']}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                {wished['Rahul Varma'] ? 'Wished 🎂' : 'Wish'}
              </button>
            </div>
          </div>
        </div>

        {/* Widget 3: Latest on Connect */}
        <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Latest on Connect
            </h3>
            <button
              onClick={() => navigate('/connect')}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Open feed
            </button>
          </div>

          <div className="space-y-4">
            {/* Feed Item 1: Priya */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                PM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Priya Menon <span className="font-normal text-slate-400">· Kudos</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Huge thanks for the rate-limiter rewrite. The agent gateway p95 dropped by 40% overnight.
                </p>
              </div>
            </div>

            {/* Feed Item 2: Ananya */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                AR
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Ananya Rao <span className="font-normal text-slate-400">· Announcement</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Open enrolment for 2027 health cover closes Oct 31. Add dependents under Payroll, then Benefits.
                </p>
              </div>
            </div>

            {/* Feed Item 3: Karthik */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                KR
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Karthik Reddy <span className="font-normal text-slate-400">· Update</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  AI Research just shipped the new embeddings pipeline to production. Demo at Thursday's lunch and learn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default SuiteDashboardView;

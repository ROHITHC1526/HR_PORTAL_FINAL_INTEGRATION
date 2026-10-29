import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  Bell,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Briefcase,
  Users,
  GraduationCap,
} from 'lucide-react';

interface ComingSoonPageProps {
  module: 'internships' | 'pipeline' | 'jobs';
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ module }) => {
  const [notified, setNotified] = useState(false);

  const config = {
    internships: {
      breadcrumb: 'Internship management',
      badge: 'RECRUIT · CAMPUS & INTERNS',
      title: 'Internship Management',
      subtitle:
        'Track campus hiring, 6-month AI research cohorts, mentor pairings, and PPO conversions.',
      icon: <GraduationCap className="w-8 h-8 text-violet-600 dark:text-violet-400" />,
      features: [
        {
          title: 'Campus Cohort Management',
          desc: 'Organize intake batches across IIT, BITS, and partner universities with structured start dates.',
          icon: <Layers className="w-5 h-5 text-indigo-500" />,
        },
        {
          title: 'Mentor Sync & Milestones',
          desc: 'Assign dedicated senior engineers and review bi-weekly research sprint deliverables.',
          icon: <Users className="w-5 h-5 text-blue-500" />,
        },
        {
          title: 'PPO Evaluation Rubrics',
          desc: 'Automated conversion workflows to convert top-performing interns into full-time employees.',
          icon: <Award className="w-5 h-5 text-emerald-500" />,
        },
      ],
    },
    pipeline: {
      breadcrumb: 'Pipeline & jobs',
      badge: 'RECRUIT · HIRING PIPELINE',
      title: 'Pipeline & Jobs',
      subtitle:
        'Interactive candidate progression across Sourcing, Screening, Technical Evaluation, and Offers.',
      icon: <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      features: [
        {
          title: 'Visual Kanban Pipeline',
          desc: 'Drag-and-drop candidate cards across dynamic interview and assessment stages.',
          icon: <Layers className="w-5 h-5 text-blue-500" />,
        },
        {
          title: 'Multi-Channel Job Syndication',
          desc: 'Publish openings directly to LinkedIn, Indeed, and the internal career portal.',
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        },
        {
          title: 'AI Resume Shortlisting',
          desc: 'Instant skill matching and semantic scoring against job requirements.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        },
      ],
    },
    jobs: {
      breadcrumb: 'Job requisitions',
      badge: 'RECRUIT · JOB POSTINGS',
      title: 'Job Openings & Requisitions',
      subtitle:
        'Draft, approve, and distribute departmental job descriptions and headcount openings.',
      icon: <Briefcase className="w-8 h-8 text-sky-600 dark:text-sky-400" />,
      features: [
        {
          title: 'Approved Requisition Workflow',
          desc: 'Connect directly to approved Manpower Requirements to automatically generate job posts.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        },
        {
          title: 'Team Hiring Quotas',
          desc: 'Monitor department allocations, target CTC budgets, and hiring manager approvals.',
          icon: <Layers className="w-5 h-5 text-indigo-500" />,
        },
        {
          title: 'Applicant Portal Integration',
          desc: 'Live applicant submission forms with automated email receipt notifications.',
          icon: <Bell className="w-5 h-5 text-blue-500" />,
        },
      ],
    },
  }[module];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900/70 p-6 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
        <span>Recruit</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">{config.breadcrumb}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/70 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400"></span>
          {config.badge}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {config.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {config.subtitle}
        </p>
      </div>

      {/* Main Coming Soon Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm overflow-hidden p-8 md:p-12 text-center max-w-4xl mx-auto mt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800 mb-5 shadow-xs">
          {config.icon}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Scheduled for Next Release · Q4 2026</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Coming Soon to Brightcone Recruit
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
          We are polishing the end-to-end experience for {config.title.toLowerCase()}. Core schema synchronization, PostgreSQL tables, and audit logs are currently staged.
        </p>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
          {config.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-violet-200 dark:hover:border-violet-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3 shadow-2xs">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
          {notified ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You will be notified when {config.title} launches!</span>
            </div>
          ) : (
            <button
              onClick={() => setNotified(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-500/20"
            >
              <Bell className="w-4 h-4" />
              <span>Notify me when launched</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Laptop,
  HelpCircle,
  DoorOpen,
  Calendar,
  Send,
  UserCheck,
  CheckSquare,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Plus,
  X,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { employeesApi } from '../../api/employees.api';
import { ServiceRequest, ServiceRequestCategory } from '../../types/employee.types';

interface WorkplacePageProps {
  type:
    | 'documents'
    | 'assets'
    | 'helpdesk'
    | 'resignation'
    | 'interviews'
    | 'offers'
    | 'joining'
    | 'onboarding'
    | 'internships'
    | 'pipeline'
    | 'policies';
}

export const WorkplacePage: React.FC<WorkplacePageProps> = ({ type }) => {
  const { activeRole } = usePortal();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Helpdesk Service Requests
  const [liveRequests, setLiveRequests] = useState<ServiceRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqCategory, setReqCategory] = useState<ServiceRequestCategory>('Payroll & tax');
  const [reqSubject, setReqSubject] = useState('');
  const [reqPriority, setReqPriority] = useState<'Normal' | 'Urgent' | 'High' | 'Low'>('Normal');
  const [reqDetails, setReqDetails] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  const fetchLiveRequests = async () => {
    if (type === 'helpdesk') {
      try {
        const data = await employeesApi.getServiceRequests();
        setLiveRequests(data);
      } catch (err) {
        console.error('Failed to load service requests:', err);
      }
    }
  };

  useEffect(() => {
    fetchLiveRequests();
  }, [type]);

  const handleOpenRaiseModal = (defaultCategory?: ServiceRequestCategory, defaultSubject?: string) => {
    setReqCategory(defaultCategory || 'Payroll & tax');
    setReqSubject(defaultSubject || '');
    setReqPriority('Normal');
    setReqDetails('');
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject.trim()) {
      alert('Subject is required');
      return;
    }

    setSubmittingReq(true);
    try {
      await employeesApi.createServiceRequest({
        employee_id: 'BC-1038',
        employee_name: 'Rahul Varma',
        category: reqCategory,
        subject: reqSubject.trim(),
        priority: reqPriority,
        details: reqDetails.trim(),
      });
      setIsRequestModalOpen(false);
      setToastMessage(`Service request "${reqSubject.trim()}" submitted successfully to People Ops!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchLiveRequests();
    } catch (err) {
      alert('Failed to submit request: ' + err);
    } finally {
      setSubmittingReq(false);
    }
  };

  const getPageConfig = () => {
    switch (type) {
      case 'documents':
        return {
          badge: 'PEOPLE · WORKPLACE',
          title: 'Documents & Letters',
          subtitle: 'Access your appointment letter, NDA, pay slips, and tax forms.',
          icon: <FileText className="w-6 h-6 text-teal-600" />,
          items: [
            { title: 'Employment Agreement & Appointment Letter', date: 'Feb 15, 2024', status: 'Signed' },
            { title: 'Intellectual Property & Non-Disclosure Agreement', date: 'Feb 15, 2024', status: 'Signed' },
            { title: 'Salary Slip – September 2026', date: 'Sep 30, 2026', status: 'Available' },
            { title: 'Form 16 Part A & B (FY 2025-26)', date: 'Jun 15, 2026', status: 'Verified' },
          ],
        };
      case 'assets':
        return {
          badge: 'PEOPLE · WORKPLACE',
          title: 'My Company Assets',
          subtitle: 'Hardware, software licenses, and peripherals assigned to your workstation.',
          icon: <Laptop className="w-6 h-6 text-teal-600" />,
          items: [
            { title: 'MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)', date: 'Tag: BC-HW-0842', status: 'Active' },
            { title: 'Dell UltraSharp 32" 4K Monitor', date: 'Tag: BC-HW-1102', status: 'Active' },
            { title: 'YubiKey 5C NFC Security Key', date: 'Tag: BC-SEC-019', status: 'Configured' },
            { title: 'JetBrains All Products Pack License', date: 'Exp: Dec 2026', status: 'Assigned' },
          ],
        };
      case 'helpdesk':
        return {
          badge: 'PEOPLE · WORKPLACE',
          title: 'HR Helpdesk & Support',
          subtitle: 'Raise service requests for benefits, payroll queries, or IT hardware issues.',
          icon: <HelpCircle className="w-6 h-6 text-teal-600" />,
          items: liveRequests.length > 0
            ? liveRequests.map((r) => ({
                title: `${r.subject} (${r.category})`,
                date: `Ticket #${r.id} · Priority: ${r.priority} · ${r.created_at}`,
                status: r.status,
              }))
            : [
                { title: 'Health Insurance Dependent Addition Request', date: 'Ticket #HD-892', status: 'Resolved' },
                { title: 'Tax Exemption Declaration Clarification', date: 'Ticket #HD-941', status: 'In Review' },
              ],
        };
      case 'resignation':
        return {
          badge: 'PEOPLE · WORKPLACE',
          title: 'Resignation & Exit Formalities',
          subtitle: 'Formal separation portal and notice period tracking (90 days).',
          icon: <DoorOpen className="w-6 h-6 text-teal-600" />,
          items: [
            { title: 'Notice Period Duration: Standard 90 Days', date: 'Status: Active Employee in Good Standing', status: 'Normal' },
          ],
        };
      case 'interviews':
        return {
          badge: 'RECRUIT · ONBOARDING',
          title: 'Interview Scheduling',
          subtitle: 'Manage upcoming panel rounds, interviewer calendar synchronizations, and feedback.',
          icon: <Calendar className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'Neha Bansal – Technical Round 2 (Senior ML Engineer)', date: 'Oct 18, 2026 · 11:00 AM', status: 'Scheduled' },
            { title: 'Siddharth Rao – Architecture Screening (QA Automation)', date: 'Oct 19, 2026 · 02:30 PM', status: 'Confirmed' },
            { title: 'wffs – Coding Evaluation (Senior ML Engineer)', date: 'Oct 20, 2026 · 04:00 PM', status: 'Pending Panel' },
          ],
        };
      case 'offers':
        return {
          badge: 'RECRUIT · ONBOARDING',
          title: 'Offer Letters & Approvals',
          subtitle: 'Generate compensation breakdowns, send e-signing offers, and track approvals.',
          icon: <Send className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'Offer Letter: Siddharth Rao (QA Automation Engineer)', date: 'CTC: ₹24,00,000 · Valid until Oct 25', status: 'Sent for Signature' },
            { title: 'Offer Letter: Tanvi Desai (DevOps Specialist)', date: 'CTC: ₹28,50,000 · Accepted', status: 'Accepted' },
          ],
        };
      case 'joining':
        return {
          badge: 'RECRUIT · ONBOARDING',
          title: 'Joining Formalities',
          subtitle: 'Background verification (BGV), document submissions, and PF/UAN transfers.',
          icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'Tanvi Desai – Background Verification & Address Check', date: 'Joining Date: Nov 1, 2026', status: 'In Progress' },
            { title: 'Kavita Joshi – Previous Employer Relieving Verification', date: 'Joining Date: Nov 15, 2026', status: 'Documents Received' },
          ],
        };
      case 'onboarding':
        return {
          badge: 'RECRUIT · ONBOARDING',
          title: 'Onboarding Checklist',
          subtitle: 'Day-1 orientation, IT equipment provisioning, and security clearance.',
          icon: <CheckSquare className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'Set up G-Suite & Slack credentials (@brightcone.ai)', date: 'Assigned to: IT Ops', status: 'Completed' },
            { title: 'Ship pre-configured MacBook Pro and Security Token', date: 'Assigned to: Workplace Ops', status: 'In Transit' },
            { title: 'Schedule 1:1 Introduction with Engineering Manager', date: 'Assigned to: Priya Menon', status: 'Pending Day 1' },
          ],
        };
      case 'internships':
        return {
          badge: 'RECRUIT · ONBOARDING',
          title: 'Internship Management',
          subtitle: 'Track campus hiring, 6-month AI research interns, and PPO conversions.',
          icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'IIT Hyderabad AI Research Cohort (Winter 2026)', date: '4 Interns active · Mentors assigned', status: 'Active Cohort' },
            { title: 'BITS Pilani Systems Engineering Interns', date: '2 Interns eligible for Pre-Placement Offer', status: 'PPO Review' },
          ],
        };
      case 'pipeline':
        return {
          badge: 'RECRUIT · HIRING',
          title: 'Pipeline & Jobs',
          subtitle: 'Candidate lifecycle across Sourcing, Screening, Technical Rounds, and Offer release.',
          icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
          items: [
            { title: 'Senior ML Engineer Pipeline (3 active candidates)', date: 'AI Research · 1 position open', status: 'Active Hiring' },
            { title: 'Solutions Architect Pipeline (2 active candidates)', date: 'Sales · 1 position open', status: 'Screening' },
            { title: 'QA Automation Engineer Pipeline (2 active candidates)', date: 'Engineering · 1 position open', status: 'Interview Stage' },
          ],
        };
      case 'policies':
      default:
        return {
          badge: 'PEOPLE · COMPANY',
          title: 'Company Policies & Handbook',
          subtitle: 'Official Brightcone HR guidelines, remote work allowances, and code of conduct.',
          icon: <FileText className="w-6 h-6 text-teal-600" />,
          items: [
            { title: 'Brightcone Global Remote & Hybrid Work Policy 2026', date: 'Updated: Jan 2026', status: 'Active' },
            { title: 'Medical Insurance Policy & Cashless Hospital Directory', date: 'Policy Provider: HDFC ERGO', status: 'Active' },
            { title: 'POSH (Prevention of Sexual Harassment) & Ethics Code', date: 'Committee: People Ops Lead', status: 'Mandatory' },
          ],
        };
    }
  };

  const config = getPageConfig();

  const handleAction = (itemTitle: string) => {
    setToastMessage(`Action triggered for "${itemTitle}". Recorded in Database.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Sora',sans-serif]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D68BD] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className={`page-badge ${config.badge.includes('RECRUIT') ? 'page-badge-recruit' : 'page-badge-people'}`}>
            <span className="page-badge-dot" />
            <span>{config.badge}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {config.subtitle}
          </p>
        </div>

        {type === 'helpdesk' && (
          <button
            onClick={() => handleOpenRaiseModal()}
            className="btn-primary-blue flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Raise a request</span>
          </button>
        )}
      </div>

      {/* Item List Card */}
      <div className="data-table-container">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          {config.icon}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Records
            </h3>
            <p className="text-xs text-slate-500">
              {activeRole === 'employee' ? 'Personal workspace records for Rahul Varma' : 'Enterprise company-wide records'}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {config.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between gap-4 transition"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.date}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge-pill badge-approved">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item.status}</span>
                </span>
                <button
                  onClick={() => handleAction(item.title)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raise a request modal */}
      {isRequestModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-lg">
            <div className="modal-header">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Raise a request
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The People Ops team replies here and by email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as ServiceRequestCategory)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-blue-400 dark:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Payroll & tax">Payroll & tax</option>
                    <option value="Benefits & insurance">Benefits & insurance</option>
                    <option value="Letters & documents">Letters & documents</option>
                    <option value="Leave & attendance">Leave & attendance</option>
                    <option value="IT & assets">IT & assets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                    (required)
                  </div>
                  <input
                    type="text"
                    required
                    value={reqSubject}
                    onChange={(e) => setReqSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    value={reqDetails}
                    onChange={(e) => setReqDetails(e.target.value)}
                    placeholder="Anything that helps us resolve it faster"
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="modal-footer flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1D68BD] hover:bg-[#1556a0] text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submittingReq ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkplacePage;

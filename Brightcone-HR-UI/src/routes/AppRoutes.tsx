import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/auth/LandingPage';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { EmployeeRecruitPage } from '../features/recruitment/EmployeeRecruitPage';
import { HRRecruitDashboard } from '../features/recruitment/HRRecruitDashboard';
import { ManpowerRequirementsPage } from '../features/recruitment/ManpowerRequirementsPage';
import { CandidateTrackerPage } from '../features/recruitment/CandidateTrackerPage';
import { InterviewSchedulingPage } from '../features/recruitment/InterviewSchedulingPage';
import { OfferLettersPage } from '../features/recruitment/OfferLettersPage';
import { JoiningFormalitiesPage } from '../features/recruitment/JoiningFormalitiesPage';
import { OnboardingChecklistPage } from '../features/recruitment/OnboardingChecklistPage';
import { InternshipManagementPage } from '../features/recruitment/InternshipManagementPage';
import { EmployeeProfilePage } from '../features/employees/EmployeeProfilePage';
import { EmployeeLeavePage } from '../features/employees/EmployeeLeavePage';
import { EmployeeAttendancePage } from '../features/employees/EmployeeAttendancePage';
import { EmployeesPage } from '../features/employees/EmployeesPage';
import { AdminLeavesPage } from '../features/employees/AdminLeavesPage';
import { AdminAttendancePage } from '../features/employees/AdminAttendancePage';
import { PerformancePage } from '../features/performance/PerformancePage';
import { DocumentsAndLettersPage } from '../features/employees/DocumentsAndLettersPage';
import { WorkplacePage } from '../features/common/WorkplacePage';
import { ComingSoonPage } from '../features/common/ComingSoonPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { usePortal } from '../context/PortalContext';

// Learning Pages from satvik/rec-09-ui
import LearnDashboard from '../pages/learn/LearnDashboard';
import CourseCatalogueAdmin from '../pages/learn/CourseCatalogueAdmin';
import EmployeeLearnPage from '../pages/learn/EmployeeLearnPage';
import { TrainingProgrammesPage } from '../pages/learn/TrainingProgrammesPage';
import { PoshPage } from '../pages/learn/PoshPage';
import { SecurityTrainingPage } from '../pages/learn/SecurityTrainingPage';
import { TrainingCompletionPage } from '../pages/learn/TrainingCompletionPage';
import CategoriesPage from '../pages/learn/CategoriesPage';
import SkillsMatrixPage from '../pages/learn/SkillsMatrixPage';
import CertificatesRecordsPage from '../pages/learn/CertificatesRecordsPage';
import SkillRecommendationsPage from '../pages/learn/SkillRecommendationsPage';
import PerformanceAdminPage from '../pages/performance/PerformanceAdminPage';

// People Plus Suite & Features from feat/people-plus-production-hardening
import { PlusShell } from '../people-plus/PlusShell';
import { SuiteDashboardView } from '../people-plus/views/SuiteDashboardView';
import { ApprovalsInboxView } from '../people-plus/views/ApprovalsInboxView';
import { ReportsAnalyticsView } from '../people-plus/views/ReportsAnalyticsView';
import { EmployeesPage as HardenedEmployeesPage } from '../features/people/EmployeesPage';
import { OnboardingPage as PeopleOnboardingPage } from '../features/people/OnboardingPage';
import { ExitPage } from '../features/people/ExitPage';
import { ProbationPage } from '../features/people/ProbationPage';
import { DocumentsPage as PeopleDocumentsPage } from '../features/people/DocumentsPage';
import { BenefitsPage } from '../features/people/BenefitsPage';
import { CsvImportPage } from '../features/people/CsvImportPage';
import { DependentsPage } from '../features/people/DependentsPage';
import { FacilitiesPage } from '../features/people/FacilitiesPage';
import { VendorPage } from '../features/people/VendorPage';
import { RecognitionPage } from '../features/people/RecognitionPage';
import { AccessCardPage } from '../features/people/AccessCardPage';

// Payroll & Expense Pages
import PayrollDashboard from '../pages/payroll/PayrollDashboard';
import PayrollAdminPage from '../pages/payroll/PayrollAdminPage';
import ExpenseEmployeePage from '../pages/payroll/ExpenseEmployeePage';
import ExpenseFinancePage from '../pages/payroll/ExpenseFinancePage';
import OfficeExpensePage from '../pages/payroll/OfficeExpensePage';
import { ExpenseAdminDashboard } from '../people-plus/expense/ExpenseAdminDashboard';
import SalaryStructurePage from '../pages/payroll/SalaryStructurePage';
import MyPayslipsPage from '../pages/payroll/MyPayslipsPage';
import { MonthlyPayrollPage } from '../pages/payroll/MonthlyPayrollPage';
import { PayslipRecordsPage } from '../pages/payroll/PayslipRecordsPage';
import { PfEsiCompliancePage } from '../pages/payroll/PfEsiCompliancePage';
import { SalaryRevisionsPage } from '../pages/payroll/SalaryRevisionsPage';
import { StatutoryCompliancePage } from '../pages/payroll/StatutoryCompliancePage';

// Digital Signature & Policy Pages from feat/sign-module-replication
import SignDashboard from '../pages/doc_sign/SignDashboard';
import SignatureRequests from '../pages/doc_sign/SignatureRequests';
import TemplateBuilder from '../pages/doc_sign/TemplateBuilder';
import SignDocumentFlow from '../pages/doc_sign/SignDocumentFlow';
import EmployeeHandbookPage from '../pages/doc_sign/EmployeeHandbookPage';
import HRPoliciesPage from '../pages/doc_sign/HRPoliciesPage';
import PolicyAcknowledgementsPage from '../pages/doc_sign/PolicyAcknowledgementsPage';

// Connect & Community Pages
import CompanyFeedPage from '../pages/engagement/CompanyFeedPage';
import CompanyEventsPage from '../pages/engagement/CompanyEventsPage';
import { EmployeeFeedbackPage } from '../pages/engagement/EmployeeFeedbackPage';
import { TownHallMeetingsPage } from '../pages/engagement/TownHallMeetingsPage';
import CelebrationsPage from '../pages/engagement/CelebrationsPage';

// People Plus Hardened Pages
import { AssetsAdminPage } from '../features/people/AssetsAdminPage';
import { HelpdeskQueuePage } from '../features/people/HelpdeskQueuePage';
import { LeaveManagementPage } from '../features/people/LeaveManagementPage';
import { OrgStructurePage } from '../features/people/OrgStructurePage';
import { PeopleDashboardPage } from '../features/people/PeopleDashboardPage';

// Attendance, Shift & Leave Pages from feature/attendance-leave-module
import { TimeModulePage } from '../pages/time/TimeModulePage';
import { CompOffTrackerPage } from '../pages/CompOffTrackerPage';
import { WorkFromHomePage } from '../pages/WorkFromHomePage';
import { DailyAttendancePage } from '../pages/DailyAttendancePage';
import { HolidaysPage } from '../pages/HolidaysPage';
import { LeaveCalculatorPage } from '../pages/LeaveCalculatorPage';
import { LeaveQuotasPage } from '../pages/LeaveQuotasPage';
import { LeaveRequestsPage } from '../pages/LeaveRequestsPage';
import { LeaveTypesPage } from '../pages/LeaveTypesPage';
import { ShiftsPage } from '../pages/ShiftsPage';
import { WeeklyRosterPage } from '../pages/WeeklyRosterPage';

// Suite Admin & Governance Pages
import { AccessPage } from '../features/access/AccessPage';
import { ActionsPage } from '../features/actions/ActionsPage';
import { NotificationsPage } from '../features/advanced-hr/NotificationsPage';
import { AuditLogPage } from '../features/audit/AuditLogPage';
import { BackupPage } from '../features/backup/BackupPage';
import { RecordsPage } from '../features/records/RecordsPage';

// Helper component for role-aware home landing
const SmartHomeRedirect: React.FC = () => {
  const { currentApp, activeRole } = usePortal();
  if (currentApp === 'recruit') {
    return activeRole === 'employee' ? (
      <Navigate to="/recruit/jobs-referrals" replace />
    ) : (
      <Navigate to="/recruit/dashboard" replace />
    );
  }
  if (currentApp === 'learn') {
    return activeRole === 'employee' ? (
      <Navigate to="/learn/my-learning" replace />
    ) : (
      <Navigate to="/learn/dashboard" replace />
    );
  }
  if (currentApp === 'payroll') {
    return activeRole === 'employee' ? (
      <Navigate to="/payroll/payslips" replace />
    ) : (
      <Navigate to="/payroll/dashboard" replace />
    );
  }
  if (currentApp === 'expense') {
    return activeRole === 'employee' ? (
      <Navigate to="/payroll/expenses" replace />
    ) : (
      <Navigate to="/expense/admin" replace />
    );
  }
  if (currentApp === 'shift') {
    return <Navigate to="/people/time" replace />;
  }
  if (currentApp === 'sign') {
    return <Navigate to="/doc-sign/dashboard" replace />;
  }
  if (currentApp === 'connect') {
    return <Navigate to="/connect" replace />;
  }
  if (currentApp === 'plus') {
    return <Navigate to="/suite/dashboard" replace />;
  }
  return activeRole === 'employee' ? (
    <Navigate to="/people/profile" replace />
  ) : (
    <Navigate to="/people/directory" replace />
  );
};

// Strict Role Guard for HR Admin
const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole, currentApp } = usePortal();
  if (activeRole !== 'admin') {
    if (currentApp === 'recruit') return <Navigate to="/recruit/jobs-referrals" replace />;
    if (currentApp === 'learn') return <Navigate to="/learn/my-learning" replace />;
    if (currentApp === 'payroll') return <Navigate to="/payroll/payslips" replace />;
    if (currentApp === 'expense') return <Navigate to="/payroll/expenses" replace />;
    if (currentApp === 'shift') return <Navigate to="/people/time" replace />;
    if (currentApp === 'sign') return <Navigate to="/doc-sign/dashboard" replace />;
    if (currentApp === 'connect') return <Navigate to="/connect" replace />;
    if (currentApp === 'plus') return <Navigate to="/suite/dashboard" replace />;
    return <Navigate to="/people/profile" replace />;
  }
  return <>{children}</>;
};

// Strict Role Guard for Employee Self-Service
const EmployeeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole, currentApp } = usePortal();
  if (activeRole !== 'employee') {
    if (currentApp === 'recruit') return <Navigate to="/recruit/dashboard" replace />;
    if (currentApp === 'learn') return <Navigate to="/learn/dashboard" replace />;
    if (currentApp === 'payroll') return <Navigate to="/payroll/dashboard" replace />;
    if (currentApp === 'expense') return <Navigate to="/expense/admin" replace />;
    if (currentApp === 'shift') return <Navigate to="/people/time" replace />;
    if (currentApp === 'sign') return <Navigate to="/doc-sign/dashboard" replace />;
    if (currentApp === 'connect') return <Navigate to="/connect" replace />;
    if (currentApp === 'plus') return <Navigate to="/suite/dashboard" replace />;
    return <Navigate to="/people/directory" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Full Suite View for People Plus standalone mode */}
        <Route path="/people-plus" element={<PlusShell />} />
        <Route path="/plus" element={<PlusShell />} />

        <Route element={<AppLayout />}>
          {/* Smart Root within App */}
          <Route path="/home" element={<SmartHomeRedirect />} />
          <Route path="/dashboard" element={<SmartHomeRedirect />} />

          {/* ============================================================= */}
          {/* RECRUIT APP ROUTES */}
          {/* ============================================================= */}
          <Route
            path="/recruit/jobs-referrals"
            element={
              <EmployeeOnlyRoute>
                <EmployeeRecruitPage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/recruit/dashboard"
            element={
              <AdminOnlyRoute>
                <HRRecruitDashboard />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/manpower"
            element={
              <AdminOnlyRoute>
                <ManpowerRequirementsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/candidate-tracker"
            element={
              <AdminOnlyRoute>
                <CandidateTrackerPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/interviews"
            element={
              <AdminOnlyRoute>
                <InterviewSchedulingPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/offers"
            element={
              <AdminOnlyRoute>
                <OfferLettersPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/joining"
            element={
              <AdminOnlyRoute>
                <JoiningFormalitiesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/onboarding"
            element={
              <AdminOnlyRoute>
                <OnboardingChecklistPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/internships"
            element={
              <AdminOnlyRoute>
                <InternshipManagementPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/pipeline"
            element={
              <AdminOnlyRoute>
                <ComingSoonPage module="pipeline" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/recruit/jobs"
            element={
              <AdminOnlyRoute>
                <ComingSoonPage module="jobs" />
              </AdminOnlyRoute>
            }
          />

          {/* ============================================================= */}
          {/* LEARN APP ROUTES */}
          {/* ============================================================= */}
          <Route path="/learn" element={<SmartHomeRedirect />} />
          <Route path="/learn/my-learning" element={<EmployeeLearnPage />} />
          <Route path="/learn/completion" element={<TrainingCompletionPage />} />
          <Route path="/learn/records" element={<CertificatesRecordsPage />} />
          <Route path="/learn/recommendations" element={<SkillRecommendationsPage />} />
          <Route path="/learn/skills" element={<SkillsMatrixPage />} />

          <Route
            path="/learn/dashboard"
            element={
              <AdminOnlyRoute>
                <LearnDashboard />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/learn/courses"
            element={
              <AdminOnlyRoute>
                <CourseCatalogueAdmin />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/learn/categories"
            element={
              <AdminOnlyRoute>
                <CategoriesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/learn/training"
            element={
              <AdminOnlyRoute>
                <TrainingProgrammesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/learn/posh"
            element={
              <AdminOnlyRoute>
                <PoshPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/learn/security-training"
            element={
              <AdminOnlyRoute>
                <SecurityTrainingPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/performance/admin"
            element={
              <AdminOnlyRoute>
                <PerformanceAdminPage />
              </AdminOnlyRoute>
            }
          />

          {/* ============================================================= */}
          {/* PEOPLE APP ROUTES */}
          {/* ============================================================= */}
          <Route
            path="/people/profile"
            element={
              <EmployeeOnlyRoute>
                <EmployeeProfilePage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/leave"
            element={
              <EmployeeOnlyRoute>
                <EmployeeLeavePage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/attendance"
            element={
              <EmployeeOnlyRoute>
                <EmployeeAttendancePage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/goals"
            element={
              <EmployeeOnlyRoute>
                <PerformancePage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/documents"
            element={
              <EmployeeOnlyRoute>
                <DocumentsAndLettersPage />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/assets"
            element={
              <EmployeeOnlyRoute>
                <WorkplacePage type="assets" />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/helpdesk"
            element={
              <EmployeeOnlyRoute>
                <WorkplacePage type="helpdesk" />
              </EmployeeOnlyRoute>
            }
          />
          <Route
            path="/people/resignation"
            element={
              <EmployeeOnlyRoute>
                <WorkplacePage type="resignation" />
              </EmployeeOnlyRoute>
            }
          />

          {/* HR Admin People Management */}
                    {/* People Module Sub-routes matching Screenshot 3 */}
          <Route path="/people/employees" element={<AdminOnlyRoute><EmployeesPage /></AdminOnlyRoute>} />
          <Route path="/people/new-joiners" element={<AdminOnlyRoute><PeopleOnboardingPage /></AdminOnlyRoute>} />
          <Route path="/people/probation" element={<AdminOnlyRoute><ProbationPage /></AdminOnlyRoute>} />
          <Route path="/people/documents" element={<AdminOnlyRoute><PeopleDocumentsPage /></AdminOnlyRoute>} />
          <Route path="/people/exits" element={<AdminOnlyRoute><ExitPage /></AdminOnlyRoute>} />
          <Route path="/people/appraisals" element={<AdminOnlyRoute><PeopleDashboardPage /></AdminOnlyRoute>} />
          <Route path="/people/probation-reviews" element={<AdminOnlyRoute><ProbationPage /></AdminOnlyRoute>} />
          <Route path="/people/increments" element={<AdminOnlyRoute><EmployeesPage /></AdminOnlyRoute>} />
          <Route path="/people/recognition" element={<AdminOnlyRoute><RecognitionPage /></AdminOnlyRoute>} />
          <Route path="/people/access-cards" element={<AdminOnlyRoute><AccessCardPage /></AdminOnlyRoute>} />
          <Route path="/people/facilities" element={<AdminOnlyRoute><FacilitiesPage /></AdminOnlyRoute>} />
          <Route path="/people/vendors" element={<AdminOnlyRoute><VendorPage /></AdminOnlyRoute>} />
          <Route path="/people/org-structure" element={<AdminOnlyRoute><OrgStructurePage /></AdminOnlyRoute>} />
          <Route path="/people/onboarding" element={<AdminOnlyRoute><PeopleOnboardingPage /></AdminOnlyRoute>} />
          <Route path="/people/offboarding" element={<AdminOnlyRoute><ExitPage /></AdminOnlyRoute>} />
          <Route path="/people/letters" element={<AdminOnlyRoute><DocumentsAndLettersPage /></AdminOnlyRoute>} />
          <Route
            path="/people/directory"
            element={
              <AdminOnlyRoute>
                <EmployeesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/hardened-directory"
            element={
              <AdminOnlyRoute>
                <HardenedEmployeesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/leaves-admin"
            element={
              <AdminOnlyRoute>
                <AdminLeavesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/attendance-admin"
            element={
              <AdminOnlyRoute>
                <AdminAttendancePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/policies"
            element={
              <AdminOnlyRoute>
                <WorkplacePage type="policies" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/assets-admin"
            element={
              <AdminOnlyRoute>
                <WorkplacePage type="assets" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/helpdesk-admin"
            element={
              <AdminOnlyRoute>
                <WorkplacePage type="helpdesk" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/onboarding-admin"
            element={
              <AdminOnlyRoute>
                <PeopleOnboardingPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/exit-admin"
            element={
              <AdminOnlyRoute>
                <ExitPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/probation-admin"
            element={
              <AdminOnlyRoute>
                <ProbationPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/benefits-admin"
            element={
              <AdminOnlyRoute>
                <BenefitsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/csv-import"
            element={
              <AdminOnlyRoute>
                <CsvImportPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/dependents"
            element={
              <AdminOnlyRoute>
                <DependentsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/facilities"
            element={
              <AdminOnlyRoute>
                <FacilitiesPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/vendors"
            element={
              <AdminOnlyRoute>
                <VendorPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/recognition"
            element={
              <AdminOnlyRoute>
                <RecognitionPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/access-cards"
            element={
              <AdminOnlyRoute>
                <AccessCardPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/documents-admin"
            element={
              <AdminOnlyRoute>
                <PeopleDocumentsPage />
              </AdminOnlyRoute>
            }
          />
          {/* People Plus Hardened Views */}
          <Route
            path="/people/dashboard"
            element={
              <AdminOnlyRoute>
                <PeopleDashboardPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/org-structure"
            element={
              <AdminOnlyRoute>
                <OrgStructurePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/assets-inventory"
            element={
              <AdminOnlyRoute>
                <AssetsAdminPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/helpdesk-queue"
            element={
              <AdminOnlyRoute>
                <HelpdeskQueuePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/leave-management"
            element={
              <AdminOnlyRoute>
                <LeaveManagementPage />
              </AdminOnlyRoute>
            }
          />

          {/* Attendance, Shift & Leave Routes */}
          <Route path="/people/time" element={<TimeModulePage />} />
          <Route path="/people/comp-off" element={<TimeModulePage initialTab="comp-off" />} />
          <Route path="/people/wfh" element={<TimeModulePage initialTab="work-from-home" />} />
          <Route
            path="/people/daily-attendance"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="daily-attendance" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/login-logout"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="login-logout" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/shift-swaps"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="shift-swaps" />
              </AdminOnlyRoute>
            }
          />
          <Route path="/people/leave-calculator" element={<TimeModulePage initialTab="leave-calculator" />} />
          <Route path="/people/leave-requests" element={<TimeModulePage initialTab="leave-requests" />} />
          <Route
            path="/people/leave-quotas"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="leave-quotas" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/leave-types"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="leave-types" />
              </AdminOnlyRoute>
            }
          />
          <Route path="/people/holidays" element={<TimeModulePage initialTab="holidays" />} />
          <Route
            path="/people/weekly-roster"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="weekly-roster" />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/people/shifts-schedule"
            element={
              <AdminOnlyRoute>
                <TimeModulePage initialTab="shifts" />
              </AdminOnlyRoute>
            }
          />

          {/* ============================================================= */}
          {/* PAYROLL & EXPENSE ROUTES */}
          {/* ============================================================= */}
          <Route path="/payroll" element={<PayrollDashboard />} />
          <Route path="/payroll/dashboard" element={<PayrollDashboard />} />
          <Route
            path="/payroll/admin"
            element={
              <AdminOnlyRoute>
                <PayrollAdminPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/monthly"
            element={
              <AdminOnlyRoute>
                <MonthlyPayrollPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/records"
            element={
              <AdminOnlyRoute>
                <PayslipRecordsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/salary-structure"
            element={
              <AdminOnlyRoute>
                <SalaryStructurePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/revisions"
            element={
              <AdminOnlyRoute>
                <SalaryRevisionsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/pf-esi"
            element={
              <AdminOnlyRoute>
                <PfEsiCompliancePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/benefits"
            element={
              <AdminOnlyRoute>
                <BenefitsPage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/payroll/payslips" element={<MyPayslipsPage />} />
          <Route
            path="/payroll/statutory"
            element={
              <AdminOnlyRoute>
                <StatutoryCompliancePage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/payroll/compliance"
            element={
              <AdminOnlyRoute>
                <StatutoryCompliancePage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/payroll/expenses" element={<ExpenseEmployeePage />} />
          <Route path="/payroll/office-expense" element={<OfficeExpensePage />} />
          <Route
            path="/expense/admin"
            element={
              <AdminOnlyRoute>
                <ExpenseFinancePage />
              </AdminOnlyRoute>
            }
          />

          {/* ============================================================= */}
          {/* EXPENSE MODULE ROUTES */}
          {/* ============================================================= */}
          <Route path="/expense" element={<ExpenseAdminDashboard />} />
          <Route path="/expense/dashboard" element={<ExpenseAdminDashboard />} />
          <Route
            path="/expense/admin"
            element={
              <AdminOnlyRoute>
                <ExpenseAdminDashboard />
              </AdminOnlyRoute>
            }
          />
          <Route path="/expense/office" element={<OfficeExpensePage />} />
          <Route path="/expense/claims" element={<ExpenseFinancePage />} />
          <Route path="/expense/my-claims" element={<ExpenseEmployeePage />} />

          {/* ============================================================= */}
          {/* SHIFT & TIME MODULE ROUTES */}
          {/* ============================================================= */}
          <Route path="/shift" element={<TimeModulePage />} />
          <Route path="/shift/roster" element={<TimeModulePage initialTab="weekly-roster" />} />
          <Route path="/shift/shifts" element={<TimeModulePage initialTab="shifts" />} />
          <Route path="/shift/attendance" element={<TimeModulePage initialTab="daily-attendance" />} />
          <Route path="/shift/login-logout" element={<TimeModulePage initialTab="login-logout" />} />
          <Route path="/shift/swaps" element={<TimeModulePage initialTab="shift-swaps" />} />
          <Route path="/shift/holidays" element={<TimeModulePage initialTab="holidays" />} />
          <Route path="/shift/quotas" element={<TimeModulePage initialTab="leave-quotas" />} />
          <Route path="/shift/types" element={<TimeModulePage initialTab="leave-types" />} />
          <Route path="/shift/requests" element={<TimeModulePage initialTab="leave-requests" />} />
          <Route path="/shift/calculator" element={<TimeModulePage initialTab="leave-calculator" />} />
          <Route path="/shift/comp-off" element={<TimeModulePage initialTab="comp-off" />} />
          <Route path="/shift/wfh" element={<TimeModulePage initialTab="work-from-home" />} />

          {/* ============================================================= */}
          {/* DIGITAL SIGNATURE & POLICIES ROUTES */}
          {/* ============================================================= */}
          <Route path="/sign" element={<SignDashboard />} />
          <Route path="/sign/dashboard" element={<SignDashboard />} />
          <Route path="/sign/requests" element={<SignatureRequests />} />
          <Route
            path="/sign/templates"
            element={
              <AdminOnlyRoute>
                <TemplateBuilder />
              </AdminOnlyRoute>
            }
          />
          <Route path="/sign/flow" element={<SignDocumentFlow />} />
          <Route path="/sign/handbook" element={<EmployeeHandbookPage />} />
          <Route path="/sign/policies" element={<HRPoliciesPage />} />
          <Route
            path="/sign/acknowledgements"
            element={
              <AdminOnlyRoute>
                <PolicyAcknowledgementsPage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/doc-sign" element={<SignDashboard />} />
          <Route path="/doc-sign/dashboard" element={<SignDashboard />} />
          <Route path="/doc-sign/requests" element={<SignatureRequests />} />
          <Route
            path="/doc-sign/templates"
            element={
              <AdminOnlyRoute>
                <TemplateBuilder />
              </AdminOnlyRoute>
            }
          />
          <Route path="/doc-sign/flow" element={<SignDocumentFlow />} />
          <Route path="/doc-sign/handbook" element={<EmployeeHandbookPage />} />
          <Route path="/doc-sign/policies" element={<HRPoliciesPage />} />
          <Route
            path="/doc-sign/acknowledgements"
            element={
              <AdminOnlyRoute>
                <PolicyAcknowledgementsPage />
              </AdminOnlyRoute>
            }
          />

          {/* ============================================================= */}
          {/* CONNECT & ENGAGEMENT ROUTES */}
          {/* ============================================================= */}
          <Route path="/connect" element={<CompanyFeedPage />} />
          <Route path="/connect/feed" element={<CompanyFeedPage />} />
          <Route path="/connect/events" element={<CompanyEventsPage />} />
          <Route path="/connect/celebrations" element={<CelebrationsPage />} />
          <Route path="/connect/birthdays" element={<CelebrationsPage />} />
          <Route path="/connect/announcements" element={<CompanyEventsPage />} />
          <Route path="/connect/feedback" element={<EmployeeFeedbackPage />} />
          <Route path="/connect/townhall" element={<TownHallMeetingsPage />} />
          <Route
            path="/connect/helpdesk"
            element={
              <AdminOnlyRoute>
                <HelpdeskQueuePage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/engagement/feed" element={<CompanyFeedPage />} />

          {/* ============================================================= */}
          {/* SUITE ADMIN & GOVERNANCE ROUTES */}
          {/* ============================================================= */}
          <Route path="/suite" element={<SuiteDashboardView />} />
          <Route path="/suite/dashboard" element={<SuiteDashboardView />} />
          <Route path="/suite/approvals" element={<ApprovalsInboxView />} />
          <Route path="/approvals" element={<ApprovalsInboxView />} />
          <Route path="/suite/reports" element={<ReportsAnalyticsView />} />
          <Route path="/reports" element={<ReportsAnalyticsView />} />
          <Route
            path="/suite/access"
            element={
              <AdminOnlyRoute>
                <AccessPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/suite/actions"
            element={
              <AdminOnlyRoute>
                <ActionsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/suite/notifications"
            element={
              <AdminOnlyRoute>
                <NotificationsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/suite/audit"
            element={
              <AdminOnlyRoute>
                <AuditLogPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/suite/backup"
            element={
              <AdminOnlyRoute>
                <BackupPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/suite/records"
            element={
              <AdminOnlyRoute>
                <RecordsPage />
              </AdminOnlyRoute>
            }
          />

          {/* Backwards compatibility redirects */}
          <Route path="/recruitment" element={<SmartHomeRedirect />} />
          <Route path="/employees" element={<Navigate to="/people/directory" replace />} />
          <Route path="/performance" element={<Navigate to="/people/goals" replace />} />
        </Route>
      </Route>

      {/* Catch-all 404 Redirect */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;

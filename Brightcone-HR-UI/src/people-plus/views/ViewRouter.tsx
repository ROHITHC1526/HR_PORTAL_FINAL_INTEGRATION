import React from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { EmployeesPage } from '@/features/people/EmployeesPage'
import { DocumentsPage } from '@/features/people/DocumentsPage'
import { CsvImportPage } from '@/features/people/CsvImportPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { RecordsPage } from '@/features/records/RecordsPage'
import { NotificationsPage } from '@/features/advanced-hr/NotificationsPage'
import { ActionsPage } from '@/features/actions/ActionsPage'
import { AccessPage } from '@/features/access/AccessPage'
import { BackupPage } from '@/features/backup/BackupPage'
import { DependentsPage } from '@/features/people/DependentsPage'
import { ProbationPage } from '@/features/people/ProbationPage'
import { RecognitionPage } from '@/features/people/RecognitionPage'
import { AccessCardPage } from '@/features/people/AccessCardPage'
import { FacilitiesPage } from '@/features/people/FacilitiesPage'
import { VendorPage } from '@/features/people/VendorPage'
import { ExitPage } from '@/features/people/ExitPage'
import { PeopleDashboardPage } from '@/features/people/PeopleDashboardPage'
import { LeaveManagementPage } from '@/features/people/LeaveManagementPage'
import { AssetsAdminPage } from '@/features/people/AssetsAdminPage'
import { HelpdeskQueuePage } from '@/features/people/HelpdeskQueuePage'
import { OrgStructurePage } from '@/features/people/OrgStructurePage'
import { LetterGeneratorPage } from '@/features/documents/LetterGeneratorPage'
import { PolicyPage } from '@/features/documents/PolicyPage'
import { DocWorkflowPage } from '@/features/documents/DocWorkflowPage'
import { TemplatesPage } from '@/features/documents/TemplatesPage'
import { DocCompliancePage } from '@/features/documents/DocCompliancePage'
import { DocAcknowledgePage } from '@/features/documents/DocAcknowledgePage'
import { CompanyDirectoryPage } from '@/features/pages/CompanyDirectoryPage'
import { SelfServicePage } from '@/features/pages/SelfServicePage'
import { OnboardingPage } from '@/features/people/OnboardingPage'
import { BenefitsPage } from '@/features/people/BenefitsPage'
import { SuiteDashboardView } from './SuiteDashboardView'
import { ApprovalsInboxView } from './ApprovalsInboxView'
import { ReportsAnalyticsView } from './ReportsAnalyticsView'
import { PeopleViews } from './PeopleViews'
import { AdvancedHrViews } from './AdvancedHrViews'
import { PerformanceViews } from './PerformanceViews'
import { RecruitViews } from './RecruitViews'
import { PayViews } from './PayViews'
import { ExpenseViews } from './ExpenseViews'
import { SignViews } from './SignViews'
import { ConnectViews } from './ConnectViews'
import { LearningViews } from './LearningViews'
import { ShiftViews } from './ShiftViews'
import { WorkplaceViews } from './WorkplaceViews'

export const ViewRouter: React.FC = () => {
  const { activeApp, activeView } = usePeoplePlus()

  if (activeApp === 'people') {
    if (activeView === 'adminDash') return <PeopleDashboardPage />
    if (activeView === 'employees') return <EmployeesPage />
    if (activeView === 'orgStructure') return <OrgStructurePage />
    if (activeView === 'onboarding') return <OnboardingPage />
    if (activeView === 'exits' || activeView === 'myExit') return <ExitPage />
    if (activeView === 'leaveAdmin' || activeView === 'myLeave') return <LeaveManagementPage />
    if (activeView === 'performanceAdmin' || activeView === 'myPerformance') return <PerformanceViews />
    if (activeView === 'probation') return <ProbationPage />
    if (activeView === 'dependents') return <DependentsPage />
    if (activeView === 'recognition') return <RecognitionPage />
    if (activeView === 'accessCards') return <AccessCardPage />
    if (activeView === 'assetsAdmin' || activeView === 'myAssets') return <AssetsAdminPage />
    if (activeView === 'docsAdmin' || activeView === 'myDocs') return <DocumentsPage />
    if (activeView === 'helpAdmin' || activeView === 'myHelp') return <HelpdeskQueuePage />
    if (activeView === 'facilities') return <FacilitiesPage />
    if (activeView === 'vendors') return <VendorPage />
    if (activeView === 'profile') return <SelfServicePage />
    if (activeView === 'myAttendance') return <LeaveManagementPage />
    return <PeopleDashboardPage />
  }

  if (activeApp === 'recruit') return <RecruitViews />
  if (activeApp === 'payroll') return <PayViews />
  if (activeApp === 'expense') return <ExpenseViews />
  if (activeApp === 'sign') return <SignViews />
  if (activeApp === 'connect') return <ConnectViews />
  if (activeApp === 'learn') return <LearningViews />
  if (activeApp === 'shift') return <ShiftViews />

  if (activeView === 'suiteDash') return <SuiteDashboardView />
  if (activeView === 'audit') return <AuditLogPage />

  if (activeView === 'approvals') return <ApprovalsInboxView />
  if (activeView === 'reports') return <ReportsAnalyticsView />

  if (activeView === 'm_perf') return <PerformanceViews />
  if (activeView === 'm_career') return <AdvancedHrViews />
  if (activeView === 'm_wfa') return <AdvancedHrViews />
  if (activeView === 'm_eng') return <AdvancedHrViews />
  if (activeView === 'm_comp') return <AdvancedHrViews />
  if (activeView === 'm_actions') return <ActionsPage />
  if (activeView === 'm_access') return <AccessPage />

  if (activeView === 'settings') return <AccessPage settings />
  if (activeView === 'm_backup') return <BackupPage />

  if (activeView === 'employees') return <EmployeesPage />
  if (activeView === 'docsAdmin' || activeView === 'myDocs') return <DocumentsPage />
  if (activeView === 'csvImport') return <CsvImportPage />
  if (activeView === 'performanceAdmin' || activeView === 'myPerformance') return <PerformanceViews />

  if (activeView === 'dependents') return <DependentsPage />
  if (activeView === 'probation') return <ProbationPage />
  if (activeView === 'recognition') return <RecognitionPage />
  if (activeView === 'accessCards') return <AccessCardPage />
  if (activeView === 'assetsAdmin') return <AssetsAdminPage />
  if (activeView === 'helpAdmin') return <HelpdeskQueuePage />
  if (activeView === 'leaveAdmin') return <LeaveManagementPage />
  if (activeView === 'orgStructure') return <OrgStructurePage />
  if (activeView === 'facilities') return <FacilitiesPage />
  if (activeView === 'vendors') return <VendorPage />
  if (activeView === 'exits' || activeView === 'myExit') return <ExitPage />
  if (activeView === 'onboarding') return <OnboardingPage />
  if (activeView === 'benefitsAdmin' || activeView === 'myBenefits') return <BenefitsPage />

  if (activeView === 'letterGen') return <LetterGeneratorPage />
  if (activeView === 'policies') return <PolicyPage />
  if (activeView === 'docWorkflows') return <DocWorkflowPage />
  if (activeView === 'letterTemplates') return <TemplatesPage />
  if (activeView === 'docCompliance') return <DocCompliancePage />
  if (activeView === 'docAcknowledge') return <DocAcknowledgePage />

  if (activeView === 'directory') return <CompanyDirectoryPage />
  if (activeView === 'profile' || activeView === 'home') return <SelfServicePage />

  return <WorkplaceViews />
}

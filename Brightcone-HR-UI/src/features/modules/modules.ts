/**
 * Modules whose backend does not exist yet. Each one shows a "Coming soon" page.
 *
 * To build a module for real: create `src/features/<module>/`, point its route in
 * `src/routes/route-table.tsx` at the new page, and delete its line here. The `phase` and `ticket`
 * fields say which part of the project plan delivers the backend (see docs/api-migration.md).
 */
export type ModuleStub = {
  /** URL path without the leading slash. */
  path: string
  title: string
  subtitle: string
  /** Title shown to employees when it differs from `title` (for example "My leave"). */
  employeeTitle?: string
  employeeSubtitle?: string
  phase: string
  ticket: string
}

export const MODULE_STUBS: readonly ModuleStub[] = [
  {
    path: 'people-dashboard',
    title: 'People dashboard',
    subtitle: 'Workforce information from connected People services',
    phase: 'P2 People',
    ticket: 'P2-02',
  },
  {
    path: 'profile',
    title: 'My profile',
    subtitle: 'Personal, job and bank details',
    phase: 'P2 People',
    ticket: 'P2-08',
  },
  {
    path: 'directory',
    title: 'People directory',
    subtitle: 'Search colleagues and see who reports to whom',
    phase: 'P2 People',
    ticket: 'P2-05',
  },
  {
    path: 'attendance',
    title: 'Attendance',
    subtitle: 'Clock history, regularisations and week view',
    phase: 'P3 Time',
    ticket: 'P3-02',
  },
  {
    path: 'leave',
    title: 'Leave',
    subtitle: 'Team leave calendar and requests',
    employeeTitle: 'My leave',
    employeeSubtitle: 'Leave balance, requests and history',
    phase: 'P3 Time',
    ticket: 'P3-05',
  },
  {
    path: 'roster',
    title: 'Shift',
    subtitle: 'Shift schedule and attendance',
    phase: 'P3 Time',
    ticket: 'P3-01',
  },
  {
    path: 'approvals',
    title: 'Approvals',
    subtitle: 'Approval records and review actions',
    phase: 'P1 Core / P4',
    ticket: 'P1-13',
  },
  {
    path: 'expenses',
    title: 'Expense',
    subtitle: 'Expense review and reimbursement',
    employeeTitle: 'My expenses',
    employeeSubtitle: 'Expense claims and reimbursement status',
    phase: 'P4 Requests',
    ticket: 'P4-01',
  },
  {
    path: 'feed',
    title: 'Connect',
    subtitle: 'Company updates and team announcements',
    phase: 'P4 Requests',
    ticket: 'P4-04',
  },
  {
    path: 'payroll',
    title: 'Payroll',
    subtitle: 'Payroll runs, payslips and compensation',
    employeeTitle: 'My payslips',
    employeeSubtitle: 'Your payroll documents and payment history',
    phase: 'P5 Pay',
    ticket: 'P5-02',
  },
  {
    path: 'recruitment',
    title: 'Recruit',
    subtitle: 'Candidate pipelines, interviews and hiring activity',
    employeeTitle: 'Jobs & referrals',
    employeeSubtitle: 'Job listings and employee referrals',
    phase: 'P6 Talent',
    ticket: 'P6-01',
  },
  {
    path: 'learn',
    title: 'Learn',
    subtitle: 'Learning paths and employee development',
    employeeTitle: 'My learning',
    employeeSubtitle: 'Courses assigned to you and your progress',
    phase: 'P6 Talent',
    ticket: 'P6-04',
  },
  {
    path: 'sign',
    title: 'Sign',
    subtitle: 'Documents awaiting signature',
    phase: 'P7 Workplace',
    ticket: 'P7-02',
  },
  {
    path: 'reports',
    title: 'Reports',
    subtitle: 'People operations and workforce insights',
    phase: 'P8 Insight',
    ticket: 'P8-01',
  },
  {
    path: 'settings',
    title: 'Settings',
    subtitle: 'Workspace preferences and account options',
    phase: 'P8 Insight',
    ticket: 'P8-03',
  },
]

/** Old URLs that still work and show the same page as the path they point to. */
export const MODULE_ALIASES: Readonly<Record<string, string>> = {
  careers: 'recruitment',
  pay: 'payroll',
  'my-expenses': 'expenses',
  'my-sign': 'sign',
  'my-learning': 'learn',
  'my-schedule': 'roster',
}

export function findModule(path: string): ModuleStub | undefined {
  const target = MODULE_ALIASES[path] ?? path
  return MODULE_STUBS.find((m) => m.path === target)
}

/** Builds a page title from a URL slug such as `org-structure` for modules not listed above. */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

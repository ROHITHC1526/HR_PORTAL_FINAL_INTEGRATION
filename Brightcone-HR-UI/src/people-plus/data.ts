export type AppKey =
  | 'people'
  | 'recruit'
  | 'payroll'
  | 'expense'
  | 'sign'
  | 'connect'
  | 'learn'
  | 'shift'
  | 'plus'

export type AppDefinition = {
  key: AppKey
  name: string
  icon: string
  color: string
  description: string
  path: string
}

export type SideLink = {
  key: string
  label: string
  to: string
  icon: string
  group: string
  permission?: string
}

export const APPS: AppDefinition[] = [
  {
    key: 'people',
    name: 'People',
    icon: 'users',
    color: '#12A58E',
    description: 'Employee records, time off and HR operations',
    path: '/people',
  },
  {
    key: 'recruit',
    name: 'Recruit',
    icon: 'briefcase',
    color: '#7C5CFF',
    description: 'Jobs, candidates, interviews and offers',
    path: '/recruit',
  },
  {
    key: 'payroll',
    name: 'Payroll',
    icon: 'pay',
    color: '#0F9F6E',
    description: 'Payroll runs, salary register and compliance',
    path: '/payroll',
  },
  {
    key: 'expense',
    name: 'Expense',
    icon: 'receipt',
    color: '#E07A1D',
    description: 'Claims, approvals and reimbursements',
    path: '/expense',
  },
  {
    key: 'sign',
    name: 'Sign',
    icon: 'pen',
    color: '#D9466F',
    description: 'E-signatures for offers, NDAs and letters',
    path: '/sign',
  },
  {
    key: 'connect',
    name: 'Connect',
    icon: 'chat',
    color: '#0BA6CC',
    description: 'Company feed, kudos and announcements',
    path: '/connect',
  },
  {
    key: 'learn',
    name: 'Learn',
    icon: 'learn',
    color: '#6366F1',
    description: 'Courses, compliance training and skills',
    path: '/learn',
  },
  {
    key: 'shift',
    name: 'Shift',
    icon: 'calendar',
    color: '#3B82C4',
    description: 'Rosters, shift swaps and attendance',
    path: '/shift',
  },
  {
    key: 'plus',
    name: 'People Plus',
    icon: 'grid',
    color: '#0B6FDB',
    description: 'Your whole HR suite on one dashboard',
    path: '/',
  },
]

export const NAV_STRUCTURE = {
  admin: {
    plus: [
      {
        group: 'Overview',
        items: [
          { key: 'suiteDash', label: 'Suite dashboard', to: '/', icon: 'dashboard' },
          { key: 'approvals', label: 'Approvals inbox', to: '/approvals', icon: 'inbox' },
          { key: 'reports', label: 'Reports & analytics', to: '/reports', icon: 'chart' },
        ],
      },
      {
        group: 'Advanced HR',
        items: [
          { key: 'm_perf', label: 'Performance management', to: '/advanced/performance', icon: 'chart' },
          { key: 'm_career', label: 'Career growth & promotions', to: '/advanced/career', icon: 'star' },
          { key: 'm_wfa', label: 'Workforce analytics', to: '/advanced/workforce', icon: 'chart' },
          { key: 'm_eng', label: 'Engagement analytics', to: '/advanced/engagement', icon: 'heart' },
          { key: 'm_comp', label: 'HR compliance dashboard', to: '/advanced/compliance', icon: 'shield' },
          { key: 'm_actions', label: 'Actions & reminders', to: '/advanced/actions', icon: 'bell' },
          { key: 'm_access', label: 'Access control', to: '/advanced/access', icon: 'gear' },
        ],
      },
      {
        group: 'Documents',
        items: [
          { key: 'letterGen', label: 'Letter generator', to: '/letter-gen', icon: 'doc' },
          { key: 'letterTemplates', label: 'Letter templates', to: '/letter-templates', icon: 'doc' },
          { key: 'policies', label: 'Company policies', to: '/policies', icon: 'shield' },
          { key: 'docWorkflows', label: 'Doc workflows', to: '/doc-workflows', icon: 'pen' },
          { key: 'docCompliance', label: 'Doc compliance', to: '/doc-compliance', icon: 'chart' },
          { key: 'docAcknowledge', label: 'Acknowledgements', to: '/doc-acknowledge', icon: 'check' },
        ],
      },
      {
        group: 'Administration',
        items: [
          { key: 'settings', label: 'Settings & access', to: '/settings', icon: 'gear' },
          { key: 'audit', label: 'Audit log', to: '/audit', icon: 'shield' },
          { key: 'm_backup', label: 'Data & backup', to: '/data-backup', icon: 'download' },
        ],
      },
    ],
    people: [
      {
        group: 'Overview',
        items: [{ key: 'adminDash', label: 'People dashboard', to: '/people', icon: 'dashboard' }],
      },
      {
        group: 'Workforce',
        items: [
          { key: 'employees', label: 'Employees', to: '/employees', icon: 'users' },
          { key: 'orgStructure', label: 'Org structure', to: '/org-structure', icon: 'org' },
          { key: 'onboarding', label: 'Onboarding', to: '/onboarding', icon: 'login' },
          { key: 'exits', label: 'Exits & offboarding', to: '/exits', icon: 'logout' },
        ],
      },
      {
        group: 'Time off',
        items: [{ key: 'leaveAdmin', label: 'Leave management', to: '/leave-admin', icon: 'leave' }],
      },
      {
        group: 'Operations',
        items: [
          { key: 'performanceAdmin', label: 'Performance', to: '/performance-admin', icon: 'chart' },
          { key: 'probation', label: 'Probation tracker', to: '/probation', icon: 'clock' },
          { key: 'dependents', label: 'Dependents', to: '/dependents', icon: 'users' },
          { key: 'recognition', label: 'Recognition', to: '/recognition', icon: 'star' },
          { key: 'accessCards', label: 'Access cards', to: '/access-cards', icon: 'key' },
          { key: 'assetsAdmin', label: 'Assets', to: '/assets-admin', icon: 'laptop' },
          { key: 'docsAdmin', label: 'Documents & letters', to: '/docs-admin', icon: 'doc' },
          { key: 'helpAdmin', label: 'Helpdesk queue', to: '/help-admin', icon: 'chat' },
          { key: 'facilities', label: 'Facilities', to: '/facilities', icon: 'building' },
          { key: 'vendors', label: 'Vendors', to: '/vendors', icon: 'building' },
        ],
      },
    ],
    recruit: [
      {
        group: 'Overview',
        items: [{ key: 'recruitDash', label: 'Recruit dashboard', to: '/recruit', icon: 'dashboard' }],
      },
      {
        group: 'Hiring',
        items: [{ key: 'recruitment', label: 'Pipeline & jobs', to: '/recruitment', icon: 'briefcase' }],
      },
    ],
    payroll: [
      {
        group: 'Overview',
        items: [{ key: 'payrollDash', label: 'Payroll dashboard', to: '/payroll', icon: 'dashboard' }],
      },
      {
        group: 'Payroll',
        items: [
          { key: 'payrollAdmin', label: 'Payroll runs', to: '/payroll-admin', icon: 'pay' },
          { key: 'benefitsAdmin', label: 'Benefits', to: '/benefits-admin', icon: 'heart' },
        ],
      },
    ],
    expense: [
      {
        group: 'Overview',
        items: [{ key: 'expenseDash', label: 'Expense dashboard', to: '/expense', icon: 'dashboard' }],
      },
      {
        group: 'Claims',
        items: [{ key: 'expensesAdmin', label: 'All claims', to: '/expenses-admin', icon: 'receipt' }],
      },
    ],
    sign: [
      {
        group: 'Overview',
        items: [{ key: 'signDash', label: 'Sign dashboard', to: '/sign', icon: 'dashboard' }],
      },
      {
        group: 'Documents',
        items: [
          { key: 'signDocs', label: 'Signature requests', to: '/sign-docs', icon: 'pen' },
          { key: 'signTemplates', label: 'Templates', to: '/sign-templates', icon: 'doc' },
        ],
      },
    ],
    connect: [
      {
        group: 'Overview',
        items: [{ key: 'feed', label: 'Company feed', to: '/connect', icon: 'chat' }],
      },
      {
        group: 'Communicate',
        items: [
          { key: 'announcements', label: 'Announcements', to: '/announcements', icon: 'mega' },
          { key: 'directory', label: 'People directory', to: '/directory', icon: 'users' },
        ],
      },
    ],
    learn: [
      {
        group: 'Overview',
        items: [{ key: 'learnDash', label: 'Learn dashboard', to: '/learn', icon: 'dashboard' }],
      },
      {
        group: 'Catalogue',
        items: [{ key: 'learningAdmin', label: 'Courses', to: '/courses-admin', icon: 'learn' }],
      },
    ],
    shift: [
      {
        group: 'Overview',
        items: [{ key: 'shiftRoster', label: 'Weekly roster', to: '/shift', icon: 'calendar' }],
      },
      {
        group: 'Attendance & Leave',
        items: [
          { key: 'dailyAttendance', label: 'Daily attendance', to: '/daily-attendance', icon: 'clock' },
          { key: 'loginLogout', label: 'Login & logout', to: '/login-logout', icon: 'logout' },
          { key: 'leaveRequests', label: 'Leave requests', to: '/leave-requests', icon: 'leave' },
          { key: 'leaveBalance', label: 'Leave balance', to: '/leave-balance', icon: 'doc' },
          { key: 'wfh', label: 'Work from home', to: '/wfh', icon: 'home' },
          { key: 'compOff', label: 'Comp-off tracker', to: '/comp-off', icon: 'swap' },
          { key: 'holidays', label: 'Holiday calendar', to: '/holidays', icon: 'gift' },
        ],
      },
      {
        group: 'Manage',
        items: [
          { key: 'shiftSwaps', label: 'Swap requests', to: '/shift-swaps', icon: 'swap' },
          { key: 'attendanceAdmin', label: 'Attendance & shifts', to: '/attendance-admin', icon: 'clock' },
        ],
      },
    ],
  },
  employee: {
    plus: [
      {
        group: 'Overview',
        items: [{ key: 'home', label: 'My dashboard', to: '/', icon: 'home' }],
      },
    ],
    people: [
      {
        group: 'Me',
        items: [
          { key: 'profile', label: 'My profile', to: '/profile', icon: 'user' },
          { key: 'myLeave', label: 'Leave', to: '/leave', icon: 'leave' },
          { key: 'myAttendance', label: 'Attendance', to: '/attendance', icon: 'clock' },
        ],
      },
      {
        group: 'Grow',
        items: [{ key: 'myPerformance', label: 'Goals & reviews', to: '/performance', icon: 'chart' }],
      },
      {
        group: 'Workplace',
        items: [
          { key: 'myDocs', label: 'Documents & letters', to: '/documents', icon: 'doc' },
          { key: 'myAssets', label: 'My assets', to: '/assets', icon: 'laptop' },
          { key: 'myHelp', label: 'HR helpdesk', to: '/helpdesk', icon: 'chat' },
          { key: 'myExit', label: 'Resignation', to: '/resignation', icon: 'logout' },
        ],
      },
    ],
    recruit: [
      {
        group: 'Careers',
        items: [{ key: 'careers', label: 'Jobs & referrals', to: '/careers', icon: 'briefcase' }],
      },
    ],
    payroll: [
      {
        group: 'Pay',
        items: [
          { key: 'myPay', label: 'Payslips & tax', to: '/payslips', icon: 'pay' },
          { key: 'myBenefits', label: 'Benefits', to: '/benefits', icon: 'heart' },
        ],
      },
    ],
    expense: [
      {
        group: 'Claims',
        items: [{ key: 'myExpenses', label: 'My expenses', to: '/expenses', icon: 'receipt' }],
      },
    ],
    sign: [
      {
        group: 'Documents',
        items: [{ key: 'mySign', label: 'Documents to sign', to: '/documents-to-sign', icon: 'pen' }],
      },
    ],
    connect: [
      {
        group: 'Community',
        items: [
          { key: 'feed', label: 'Company feed', to: '/connect', icon: 'chat' },
          { key: 'directory', label: 'People directory', to: '/directory', icon: 'users' },
        ],
      },
    ],
    learn: [
      {
        group: 'Learning',
        items: [{ key: 'myLearning', label: 'My learning', to: '/learning', icon: 'learn' }],
      },
    ],
    shift: [
      {
        group: 'Overview',
        items: [{ key: 'shiftRoster', label: 'Weekly roster', to: '/shift', icon: 'calendar' }],
      },
      {
        group: 'Attendance & Leave',
        items: [
          { key: 'dailyAttendance', label: 'Daily attendance', to: '/daily-attendance', icon: 'clock' },
          { key: 'loginLogout', label: 'Login & logout', to: '/login-logout', icon: 'logout' },
          { key: 'leaveRequests', label: 'Leave requests', to: '/leave-requests', icon: 'leave' },
          { key: 'leaveBalance', label: 'Leave balance', to: '/leave-balance', icon: 'doc' },
          { key: 'wfh', label: 'Work from home', to: '/wfh', icon: 'home' },
          { key: 'compOff', label: 'Comp-off tracker', to: '/comp-off', icon: 'swap' },
          { key: 'holidays', label: 'Holiday calendar', to: '/holidays', icon: 'gift' },
        ],
      },
      {
        group: 'Manage',
        items: [
          { key: 'shiftSwaps', label: 'Swap requests', to: '/shift-swaps', icon: 'swap' },
        ],
      },
    ],
  },
}

export type NavItem = {
  key: string
  label: string
  to: string
  icon: string
  comingSoon?: boolean
  permission?: string
}

export const NAV_BY_ROLE: Record<'admin' | 'employee', Record<string, NavItem[]>> = {
  admin: Object.fromEntries(
    Object.entries(NAV_STRUCTURE.admin).map(([appKey, groups]) => [
      appKey,
      (groups as any[]).flatMap((g) => g.items || []),
    ])
  ),
  employee: Object.fromEntries(
    Object.entries(NAV_STRUCTURE.employee).map(([appKey, groups]) => [
      appKey,
      (groups as any[]).flatMap((g) => g.items || []),
    ])
  ),
}

export function getAppForPath(path: string): AppDefinition {
  if (path.startsWith('/people') || path === '/employees' || path === '/profile' || path === '/leave' || path === '/attendance' || path === '/org-structure' || path === '/onboarding' || path === '/exits' || path === '/leave-admin' || path === '/performance-admin' || path === '/assets-admin' || path === '/docs-admin' || path === '/help-admin' || path === '/probation' || path === '/dependents' || path === '/recognition' || path === '/access-cards' || path === '/facilities' || path === '/vendors' || path === '/helpdesk' || path === '/assets' || path === '/documents' || path === '/resignation') {
    return APPS.find((a) => a.key === 'people')!
  }
  if (path.startsWith('/recruit') || path === '/recruitment' || path === '/careers') {
    return APPS.find((a) => a.key === 'recruit')!
  }
  if (path.startsWith('/payroll') || path === '/payslips' || path === '/benefits' || path === '/payroll-admin' || path === '/benefits-admin') {
    return APPS.find((a) => a.key === 'payroll')!
  }
  if (path.startsWith('/expense') || path === '/expenses' || path === '/expenses-admin') {
    return APPS.find((a) => a.key === 'expense')!
  }
  if (path.startsWith('/sign') || path === '/sign-docs' || path === '/sign-templates' || path === '/documents-to-sign') {
    return APPS.find((a) => a.key === 'sign')!
  }
  if (path.startsWith('/connect') || path === '/announcements' || path === '/directory') {
    return APPS.find((a) => a.key === 'connect')!
  }
  if (path.startsWith('/learn') || path === '/learning' || path === '/courses-admin') {
    return APPS.find((a) => a.key === 'learn')!
  }
  if (path.startsWith('/shift') || path === '/schedule' || path === '/shift-swaps' || path === '/attendance-admin') {
    return APPS.find((a) => a.key === 'shift')!
  }
  return APPS.find((a) => a.key === 'plus')!
}

export const initials = (name: string) =>
  name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()

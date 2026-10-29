import type { SuiteState } from './types'

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function emptyState(): SuiteState {
  return {
    role: 'employee',
    clockedIn: false,
    clockStart: null,
    company: { name: '', fy: '', week: '', tz: '', probation: '', notice: '' },
    employees: [], depts: [], grades: [], locations: [], shifts: [], leaveTypes: [], holidays: [],
    leaves: [], regs: [], expenses: [], tickets: [], announcements: [], policies: [], letters: [],
    empDocs: [], assets: [], assetReqs: [], jobs: [], cands: [], interviews: [], referrals: [],
    cycle: { n: '', stage: 0, due: '' }, reviews: {}, goals: [], feedback: [], courses: [],
    progress: {}, plans: [], dependents: {}, onboard: [], resignations: [],
    payroll: { month: '', step: 0, runs: [], inputs: [] }, decl: {}, perms: {}, workflows: [],
    notif: { email: false, slack: false, digest: false, birthdays: false }, audit: [], sign: [],
    signTpls: [], posts: [], groups: [], swaps: [], roster: {}, published: false, accounts: [], v: 1,
  }
}

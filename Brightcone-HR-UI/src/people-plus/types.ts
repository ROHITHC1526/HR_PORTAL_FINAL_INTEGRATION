export type Role = 'admin' | 'employee'

export interface Employee {
  id: string
  name: string
  role: string
  dept: string
  loc: string
  status: 'Active' | 'Probation' | 'On leave' | 'Notice period' | 'Inactive'
  joined: string
  mgr: string
  ctc: number
  phone: string
  shift: string
  grade: string
  email?: string
  address?: string
  emergency?: string
  blood?: string
  dob?: string
  pan?: string
  uan?: string
  bank?: string
}

export interface Department {
  n: string
  head: string
  cc: string
}

export interface Shift {
  n: string
  s: string
  e: string
  grace: number
}

export interface LeaveType {
  n: string
  q: number
  carry: string
  paid: 'Paid' | 'Unpaid'
}

export interface Holiday {
  d: string
  n: string
  t: 'National' | 'Festival' | 'Optional' | 'Company'
}

export interface LeaveRequest {
  id: string
  emp: string
  type: string
  from: string
  to: string
  days: number
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
}

export interface AttendanceRegularisation {
  id: string
  emp: string
  date: string
  in: string
  out: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface ExpenseClaim {
  id: string
  emp: string
  cat: string
  amt: number
  date: string
  desc: string
  status: 'Pending' | 'Approved' | 'Paid' | 'Withdrawn' | 'Rejected'
}

export interface Ticket {
  id: string
  emp: string
  sub: string
  cat: string
  pri: 'Normal' | 'High' | 'Urgent'
  status: 'Open' | 'In progress' | 'Resolved'
  to: string
  date: string
  notes: string[]
}

export interface Announcement {
  id: string
  t: string
  b: string
  d: string
  pin: boolean
}

export interface Policy {
  id: string
  n: string
  v: string
  d: string
  mand: boolean
  ack: string[]
}

export interface LetterRequest {
  id: string
  emp: string
  type: string
  to: string
  status: 'Pending' | 'Issued' | 'Rejected'
  date: string
}

export interface EmployeeDoc {
  emp: string
  doc: string
  status: 'Submitted' | 'Verified' | 'Not submitted' | 'Rejected'
}

export interface Asset {
  tag: string
  type: string
  model: string
  emp: string
  status: 'Assigned' | 'In stock' | 'In repair' | 'Retired'
  since: string
}

export interface AssetRequest {
  id: string
  emp: string
  item: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface Job {
  id: string
  t: string
  dept: string
  loc: string
  type: 'Full-time' | 'Contract' | 'Intern'
  status: 'Open' | 'Closed'
  bonus: number
}

export interface Candidate {
  id: string
  n: string
  job: string
  s: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'
  sc: number
  src: string
  offer?: 'Draft' | 'Submitted' | 'Accepted' | 'Declined'
  ctc?: number
  join?: string
}

export interface Interview {
  id: string
  cand: string
  round: string
  when: string
  panel: string
}

export interface Referral {
  id: string
  by: string
  cand: string
  job: string
  status: string
}

export interface ReviewCycle {
  n: string
  stage: number
  due: string
}

export interface Goal {
  id: string
  emp: string
  t: string
  due: string
  p: number
}

export interface Feedback {
  from: string
  to: string
  t: string
  d: string
}

export interface Course {
  id: string
  t: string
  type: 'Mandatory' | 'Elective'
  dur: string
  aud: string
  due: string
}

export interface Plan {
  n: string
  prov: string
  cover: string
  cost: string
}

export interface Dependent {
  n: string
  rel: string
  dob: string
}

export interface Onboarding {
  emp: string
  tasks: [string, 0 | 1][]
}

export interface Resignation {
  id: string
  emp: string
  date: string
  lwd: string
  reason: string
  status: 'Pending' | 'Accepted' | 'Completed' | 'Withdrawn' | 'Rejected'
  check?: [string, 0 | 1][]
}

export interface PayrollRun {
  m: string
  emps: number
  gross: number
  net: number
  d: string
}

export interface TaxDecl {
  '80C': number
  '80D': number
  HRA: number
  '80CCD(1B)': number
  regime: 'Old regime' | 'New regime'
  status: 'Submitted' | 'Not submitted'
}

export interface SignEnvelope {
  id: string
  doc: string
  tpl: string
  to: string
  ext?: boolean
  from: string
  sent: string
  due: string
  status: 'Awaiting signature' | 'Viewed' | 'Completed' | 'Declined' | 'Voided'
  signed?: string
}

export interface SignTemplate {
  n: string
  f: number
  used: number
}

export interface Post {
  id: string
  by: string
  type: 'Kudos' | 'Update' | 'Announcement' | 'Welcome' | 'Celebration'
  to?: string
  t: string
  d: string
  likes: string[]
  comments: { by: string; t: string }[]
}

export interface Group {
  n: string
  m: number
}

export interface ShiftSwap {
  id: string
  emp: string
  date: string
  from: string
  to: string
  with: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface UserAccount {
  email: string
  name: string
  role: 'HR Admin' | 'Employee'
  pass: string
  status: 'Active' | 'Locked' | 'Disabled'
  fails: number
  last: string | null
}

export interface AuditLogEntry {
  t: string
  who: string
  a: string
}

export interface SuiteState {
  role: Role
  clockedIn: boolean
  clockStart: number | null
  company: {
    name: string
    fy: string
    week: string
    tz: string
    probation: string
    notice: string
  }
  employees: Employee[]
  depts: Department[]
  grades: [string, string][]
  locations: string[]
  shifts: Shift[]
  leaveTypes: LeaveType[]
  holidays: Holiday[]
  leaves: LeaveRequest[]
  regs: AttendanceRegularisation[]
  expenses: ExpenseClaim[]
  tickets: Ticket[]
  announcements: Announcement[]
  policies: Policy[]
  letters: LetterRequest[]
  empDocs: EmployeeDoc[]
  assets: Asset[]
  assetReqs: AssetRequest[]
  jobs: Job[]
  cands: Candidate[]
  interviews: Interview[]
  referrals: Referral[]
  cycle: ReviewCycle
  reviews: Record<string, { self?: { win: string; grow: string; score: string }; rating?: string; hike?: number }>
  goals: Goal[]
  feedback: Feedback[]
  courses: Course[]
  progress: Record<string, Record<string, number>>
  plans: Plan[]
  dependents: Record<string, Dependent[]>
  onboard: Onboarding[]
  resignations: Resignation[]
  payroll: {
    month: string
    step: number
    runs: PayrollRun[]
    inputs: { emp: string; k: string; amt: number }[]
  }
  decl: Record<string, TaxDecl>
  perms: Record<string, number[]>
  workflows: [string, string, string][]
  notif: { email: boolean; slack: boolean; digest: boolean; birthdays: boolean }
  audit: AuditLogEntry[]
  sign: SignEnvelope[]
  signTpls: SignTemplate[]
  posts: Post[]
  groups: Group[]
  swaps: ShiftSwap[]
  roster: Record<string, string>
  published: boolean
  accounts: UserAccount[]
  v: number
}

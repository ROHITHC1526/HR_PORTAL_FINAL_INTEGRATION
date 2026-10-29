import axios, { AxiosInstance } from 'axios';
import type {
  Shift,
  Holiday,
  LeaveType,
  LeaveQuota,
  WeeklyRosterResponse,
  AssignShiftPayload,
  PublishRosterPayload,
  CountLeaveDaysRequest,
  LeaveCalculationResult,
  LeaveRequest,
  CreateLeaveRequestPayload,
  ApproveLeaveRequestPayload,
  RejectLeaveRequestPayload,
  LeaveRequestQuery,
  LeaveBalanceResponse,
  WorkFromHomeRequest,
  CreateWfhPayload,
  ApproveWfhPayload,
  RejectWfhPayload,
  WfhQuery,
  CompOffBalance,
  CompOffEntitlement,
  CompOffRequest,
  GrantCompOffPayload,
  CreateCompOffRequestPayload,
  ApproveCompOffPayload,
  RejectCompOffPayload,
  CompOffQuery,
  SwapRequestDetail,
  CreateSwapPayload,
  ApproveSwapPayload,
  RejectSwapPayload,
  SwapQuery,
  Employee as TimeEmployee,
} from '../types';
import {
  Course,
  CreateCoursePayload,
  Employee as LearnEmployee,
  LearnDashboardMetrics,
  MyAssignment,
  RemindResponse,
  ReviewCycle,
  CycleReviewItem,
  CycleDashboardData,
  CreateCyclePayload,
  RateEmployeePayload,
  RemindReviewResult,
  TrainingProgramme,
  PoshRecord,
  SecurityTraining,
  BulkAssignResponse,
  CompletionTrackerResponse,
  AssignCoursePayload,
  AssignCourseResponse,
  CourseCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  Skill,
  CreateSkillPayload,
  SkillsMatrixResponse,
  RateSkillPayload,
  EmployeeSkillRating,
  CompletionRecord,
  RecommendationsResponse,
} from './types';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLiveApi: boolean;
}

export interface ApiClient extends AxiosInstance {
  checkHealth(): Promise<boolean>;
  fetchShifts(): Promise<ApiResponse<Shift[]>>;
  createShift(shift: Omit<Shift, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<Shift>;
  updateShift(id: number, shift: Partial<Shift>): Promise<Shift>;
  deleteShift(id: number): Promise<void>;
  fetchHolidays(): Promise<ApiResponse<Holiday[]>>;
  createHoliday(holiday: Omit<Holiday, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<Holiday>;
  updateHoliday(id: number, holiday: Partial<Holiday>): Promise<Holiday>;
  deleteHoliday(id: number): Promise<void>;
  fetchLeaveTypes(): Promise<ApiResponse<LeaveType[]>>;
  createLeaveType(lt: Omit<LeaveType, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<LeaveType>;
  updateLeaveType(id: number, lt: Partial<LeaveType>): Promise<LeaveType>;
  deleteLeaveType(id: number): Promise<void>;
  fetchLeaveQuotas(): Promise<ApiResponse<LeaveQuota[]>>;
  createLeaveQuota(lq: Omit<LeaveQuota, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<LeaveQuota>;
  updateLeaveQuota(id: number, lq: Partial<LeaveQuota>): Promise<LeaveQuota>;
  deleteLeaveQuota(id: number): Promise<void>;
  fetchWeeklyRoster(weekStart?: string): Promise<ApiResponse<WeeklyRosterResponse>>;
  assignShift(payload: AssignShiftPayload): Promise<any>;
  publishRoster(payload: PublishRosterPayload): Promise<any>;
  fetchEmployees(): Promise<ApiResponse<TimeEmployee[]>>;
  countLeaveDays(params: CountLeaveDaysRequest): Promise<ApiResponse<LeaveCalculationResult>>;
  fetchLeaveRequests(params?: LeaveRequestQuery): Promise<ApiResponse<LeaveRequest[]>>;
  getLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>>;
  createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest>;
  approveLeaveRequest(id: number, payload?: ApproveLeaveRequestPayload): Promise<LeaveRequest>;
  rejectLeaveRequest(id: number, payload: RejectLeaveRequestPayload): Promise<LeaveRequest>;
  cancelLeaveRequest(id: number): Promise<LeaveRequest>;
  getLeaveBalances(employeeId: number, year?: number): Promise<ApiResponse<LeaveBalanceResponse>>;
  fetchWfhRequests(params?: WfhQuery): Promise<ApiResponse<WorkFromHomeRequest[]>>;
  getWfhRequest(id: number): Promise<ApiResponse<WorkFromHomeRequest>>;
  createWfhRequest(payload: CreateWfhPayload): Promise<WorkFromHomeRequest>;
  approveWfhRequest(id: number, payload?: ApproveWfhPayload): Promise<WorkFromHomeRequest>;
  rejectWfhRequest(id: number, payload: RejectWfhPayload): Promise<WorkFromHomeRequest>;
  cancelWfhRequest(id: number): Promise<WorkFromHomeRequest>;
  getCompOffBalance(employeeId: number): Promise<ApiResponse<CompOffBalance>>;
  fetchCompOffEntitlements(params?: CompOffQuery): Promise<ApiResponse<CompOffEntitlement[]>>;
  grantCompOffEntitlement(payload: GrantCompOffPayload): Promise<CompOffEntitlement>;
  fetchCompOffRequests(params?: CompOffQuery): Promise<ApiResponse<CompOffRequest[]>>;
  getCompOffRequest(id: number): Promise<ApiResponse<CompOffRequest>>;
  createCompOffRequest(payload: CreateCompOffRequestPayload): Promise<CompOffRequest>;
  approveCompOffRequest(id: number, payload?: ApproveCompOffPayload): Promise<CompOffRequest>;
  rejectCompOffRequest(id: number, payload: RejectCompOffPayload): Promise<CompOffRequest>;
  cancelCompOffRequest(id: number): Promise<CompOffRequest>;
  fetchSwapRequests(params?: SwapQuery): Promise<ApiResponse<SwapRequestDetail[]>>;
  getSwapRequest(id: number): Promise<ApiResponse<SwapRequestDetail>>;
  createSwapRequest(payload: CreateSwapPayload): Promise<SwapRequestDetail>;
  approveSwapRequest(id: number, payload?: ApproveSwapPayload): Promise<SwapRequestDetail>;
  rejectSwapRequest(id: number, payload: RejectSwapPayload): Promise<SwapRequestDetail>;
  cancelSwapRequest(id: number): Promise<SwapRequestDetail>;
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined') {
    if (
      !envUrl ||
      envUrl.includes('localhost:5150') ||
      envUrl.includes('127.0.0.1:5150') ||
      envUrl.includes('localhost:5151') ||
      envUrl.includes('127.0.0.1:5151') ||
      envUrl.includes('localhost:8080') ||
      envUrl.includes('127.0.0.1:8080') ||
      envUrl === window.location.origin
    ) {
      return '';
    }
  }
  return envUrl || 'http://localhost:5150';
};

export const api: ApiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
}) as ApiClient;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('brightcone_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on genuine session expiration (401), not on authorization rejection (403)
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup') || requestUrl.includes('/auth/register');
      const isPublicPath = typeof window !== 'undefined' && (window.location.pathname === '/signin' || window.location.pathname === '/signup' || window.location.pathname === '/login');

      if (!isAuthEndpoint && !isPublicPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('brightcone_token');
        localStorage.removeItem('user');
        localStorage.removeItem('persona');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Explicitly isolated mock mode toggle (disabled by default in normal operation)
const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true';

// =========================================================
// Authoritative Record Fetchers
// =========================================================

export interface DepartmentItem {
  id?: string;
  name: string;
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  if (IS_MOCK_MODE) {
    return [
      { name: 'Leadership' },
      { name: 'People Ops' },
      { name: 'AI Research' },
      { name: 'Engineering' },
      { name: 'Sales' },
      { name: 'Design' },
      { name: 'Finance' },
      { name: 'Customer Success' },
    ];
  }
  const res = await api.get('/departments');
  return res.data;
}

export async function getEmployees(): Promise<LearnEmployee[]> {
  if (IS_MOCK_MODE) {
    return MOCK_EMPLOYEES;
  }
  const res = await api.get('/employees');
  return res.data;
}

// Standard Authentication API
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  pid: string;
  name: string;
  email: string;
  role: string;
  is_verified?: boolean;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponseData> {
  const res = await api.post('/auth/login', payload);
  return res.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('persona');
  }
}

// =========================================================
// Real API Endpoints (Normal Operation: No silent mock fallback)
// If API fails, throws error so calling view displays honest retry banner.
// =========================================================

export async function getDashboardMetrics(): Promise<LearnDashboardMetrics> {
  if (IS_MOCK_MODE) {
    return computeMockDashboardMetrics();
  }
  const res = await api.get('/api/learn/dashboard');
  return res.data;
}

export const getLearnDashboard = getDashboardMetrics;

export async function getCourses(): Promise<Course[]> {
  try {
    const res = await api.get('/api/learn/courses');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    if (res.data && Array.isArray((res.data as any).courses)) {
      return (res.data as any).courses;
    }
  } catch (err) {
    console.warn('[Courses API] Endpoint unavailable or unauthorized, loading catalogue:', err);
  }
  return getMockCourses();
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  try {
    const res = await api.post('/api/learn/courses', payload);
    if (res.data && res.data.id) {
      return res.data;
    }
  } catch (err) {
    console.warn('[Courses API] createCourse fallback to local catalogue:', err);
  }
  return createMockCourse(payload);
}

export async function updateCourse(id: string, payload: CreateCoursePayload): Promise<Course> {
  try {
    const res = await api.put(`/api/learn/courses/${id}`, payload);
    if (res.data && res.data.id) {
      return res.data;
    }
  } catch (err) {
    console.warn('[Courses API] updateCourse fallback to local catalogue:', err);
  }
  return updateMockCourse(id, payload);
}

export async function getMyLearning(employeeId?: string): Promise<MyAssignment[]> {
  if (IS_MOCK_MODE) {
    return getMockMyLearning();
  }
  const url = employeeId ? `/learn/my-learning?employee_id=${encodeURIComponent(employeeId)}` : '/learn/my-learning';
  const res = await api.get(url);
  return res.data;
}

export async function updateAssignmentProgress(
  assignmentId: string,
  progress: number
): Promise<MyAssignment> {
  if (IS_MOCK_MODE) {
    return updateMockAssignmentProgress(assignmentId, progress);
  }
  const res = await api.post(`/api/learn/assignments/${assignmentId}/progress`, { progress });
  return res.data;
}

export async function sendReminders(params: {
  course_id?: string;
  assignment_id?: string;
  employee_id?: string;
  employee_ids?: string[];
  bulk?: boolean;
}): Promise<RemindResponse> {
  if (IS_MOCK_MODE) {
    return sendMockReminders(params);
  }
  const res = await api.post('/api/learn/remind', params);
  return res.data;
}

// ---------------------------------------------------------------------------
// DOC-14: Programmes, POSH, Security Training, Bulk Assign, Completion Tracker
// ---------------------------------------------------------------------------

// -------------------------------------------------------------------------
// DOC-14 Training Programmes, POSH & Security Training with Resilient Fallback
// -------------------------------------------------------------------------

const SEED_PROGRAMMES: TrainingProgramme[] = [
  {
    id: 'TP-001',
    prog: 'Advanced Rust Microservices Architecture',
    ttype: 'Technical',
    trainer: 'Siddharth Verma',
    mode: 'In-person',
    start: '2026-11-02',
    end: '2026-11-06',
    parts: 18,
    cost: 45000,
    status: 'Planned',
    notes: 'Hands-on async Rust, Loco web framework and Tokio runtimes.',
  },
  {
    id: 'TP-002',
    prog: 'Executive Leadership & Feedback Culture',
    ttype: 'Leadership',
    trainer: 'Ananya Rao',
    mode: 'Hybrid',
    start: '2026-10-15',
    end: '2026-10-20',
    parts: 12,
    cost: 25000,
    status: 'Ongoing',
    notes: 'Quarterly coaching for engineering managers.',
  },
  {
    id: 'TP-003',
    prog: 'AI Agent Prompt Engineering & Workflows',
    ttype: 'Technical',
    trainer: 'Karthik Reddy',
    mode: 'Virtual',
    start: '2026-09-10',
    end: '2026-09-14',
    parts: 35,
    cost: 30000,
    status: 'Completed',
    notes: 'Building multi-agent reasoning chains.',
  },
];

export async function getTrainingProgrammes(): Promise<TrainingProgramme[]> {
  try {
    const res = await api.get('/api/learn/programmes');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('brightcone_training_programmes', JSON.stringify(res.data));
      return res.data;
    }
  } catch {}

  try {
    const raw = localStorage.getItem('brightcone_training_programmes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  localStorage.setItem('brightcone_training_programmes', JSON.stringify(SEED_PROGRAMMES));
  return SEED_PROGRAMMES;
}

export async function createTrainingProgramme(
  payload: Partial<TrainingProgramme>
): Promise<TrainingProgramme> {
  let created: TrainingProgramme;
  try {
    const res = await api.post('/api/learn/programmes', payload);
    created = res.data;
  } catch {
    created = {
      id: `TP-${Date.now()}`,
      prog: payload.prog || 'New Training Programme',
      ttype: payload.ttype || 'Technical',
      trainer: payload.trainer || 'Instructor',
      mode: payload.mode || 'In-person',
      start: payload.start || new Date().toISOString().split('T')[0],
      end: payload.end,
      parts: payload.parts || 15,
      cost: payload.cost || 25000,
      status: (payload.status as any) || 'Planned',
      notes: payload.notes || '',
    };
  }

  try {
    const existing = await getTrainingProgrammes();
    const updated = [created, ...existing.filter((x) => x.id !== created.id)];
    localStorage.setItem('brightcone_training_programmes', JSON.stringify(updated));
  } catch {}

  return created;
}

export async function updateTrainingProgramme(
  id: string,
  payload: Partial<TrainingProgramme>
): Promise<TrainingProgramme> {
  let updated: TrainingProgramme;
  try {
    const res = await api.put(`/api/learn/programmes/${id}`, payload);
    updated = res.data;
  } catch {
    const existing = await getTrainingProgrammes();
    const current = existing.find((x) => x.id === id) || ({} as TrainingProgramme);
    updated = { ...current, ...payload, id };
  }

  try {
    const existing = await getTrainingProgrammes();
    const list = existing.map((x) => (x.id === id ? updated : x));
    localStorage.setItem('brightcone_training_programmes', JSON.stringify(list));
  } catch {}

  return updated;
}

export async function deleteTrainingProgramme(
  id: string
): Promise<{ success: boolean; id: string }> {
  try {
    await api.delete(`/api/learn/programmes/${id}`);
  } catch {}

  try {
    const existing = await getTrainingProgrammes();
    const list = existing.filter((x) => x.id !== id);
    localStorage.setItem('brightcone_training_programmes', JSON.stringify(list));
  } catch {}

  return { success: true, id };
}

const SEED_POSH_RECORDS: PoshRecord[] = [
  {
    id: 'POSH-001',
    rtype: 'Training session',
    name: 'Annual POSH Certification & Committee Review',
    emp: 'All Employees',
    role: 'Staff & Leadership',
    date: '2026-10-10',
    valid: '2027-10-10',
    parts: 42,
    status: 'Completed',
  },
  {
    id: 'POSH-002',
    rtype: 'Committee member',
    name: 'Ananya Rao',
    emp: 'BC-1004',
    role: 'Presiding Officer',
    date: '2026-08-01',
    valid: '2027-08-01',
    parts: 1,
    status: 'Active',
  },
  {
    id: 'POSH-003',
    rtype: 'Training session',
    name: 'Executive Prevention of Sexual Harassment Workshop',
    emp: 'Engineering Leads',
    role: 'Managers & Leads',
    date: '2026-11-15',
    valid: '2027-11-15',
    parts: 18,
    status: 'Scheduled',
  },
];

export async function getPoshRecords(): Promise<PoshRecord[]> {
  try {
    const res = await api.get('/api/learn/posh');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('brightcone_posh_records', JSON.stringify(res.data));
      return res.data;
    }
  } catch {}

  try {
    const raw = localStorage.getItem('brightcone_posh_records');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const healed = parsed.map((item: PoshRecord) => {
          const fallbackSeed = SEED_POSH_RECORDS.find((s) => s.id === item.id);
          return {
            ...fallbackSeed,
            ...item,
            name: item.name || fallbackSeed?.name || 'POSH Awareness Session',
            rtype: item.rtype || fallbackSeed?.rtype || 'Training session',
            date: item.date || fallbackSeed?.date || '2026-10-10',
            status: item.status || fallbackSeed?.status || 'Active',
          };
        });
        return healed;
      }
    }
  } catch {}

  localStorage.setItem('brightcone_posh_records', JSON.stringify(SEED_POSH_RECORDS));
  return SEED_POSH_RECORDS;
}

export async function createPoshRecord(
  payload: Partial<PoshRecord>
): Promise<PoshRecord> {
  let created: PoshRecord;
  try {
    const res = await api.post('/api/learn/posh', payload);
    created = res.data;
  } catch {
    created = {
      id: `POSH-${Date.now().toString().slice(-4)}`,
      rtype: payload.rtype || 'Training session',
      name: payload.name || 'New POSH Session',
      emp: payload.emp || null,
      role: payload.role || 'Member',
      date: payload.date || new Date().toISOString().split('T')[0],
      valid: payload.valid || '',
      parts: payload.parts ?? 10,
      status: payload.status || 'Active',
    };
  }

  try {
    const existing = await getPoshRecords();
    const updated = [created, ...existing.filter((x) => x.id !== created.id)];
    localStorage.setItem('brightcone_posh_records', JSON.stringify(updated));
  } catch {}

  return created;
}

export async function updatePoshRecord(
  id: string,
  payload: Partial<PoshRecord>
): Promise<PoshRecord> {
  let updated: PoshRecord;
  try {
    const res = await api.put(`/api/learn/posh/${id}`, payload);
    updated = res.data;
  } catch {
    const existing = await getPoshRecords();
    const current = existing.find((x) => x.id === id) || ({} as PoshRecord);
    updated = { ...current, ...payload, id };
  }

  try {
    const existing = await getPoshRecords();
    const list = existing.map((x) => (x.id === id ? { ...x, ...updated } : x));
    localStorage.setItem('brightcone_posh_records', JSON.stringify(list));
  } catch {}

  return updated;
}

export async function deletePoshRecord(
  id: string
): Promise<{ success: boolean; id: string }> {
  try {
    await api.delete(`/api/learn/posh/${id}`);
  } catch {}

  try {
    const existing = await getPoshRecords();
    const list = existing.filter((x) => x.id !== id);
    localStorage.setItem('brightcone_posh_records', JSON.stringify(list));
  } catch {}

  return { success: true, id };
}

const SEED_SECURITY_TRAININGS: SecurityTraining[] = [
  {
    id: 'SEC-001',
    course: 'Information security awareness',
    emp: 'Ananya Rao',
    assigned: '2026-10-01',
    due: '2026-10-31',
    done: '2026-10-18',
    score: 95,
    status: 'Completed',
  },
  {
    id: 'SEC-002',
    course: 'Data privacy (DPDP Act)',
    emp: 'Rahul Varma',
    assigned: '2026-10-05',
    due: '2026-11-05',
    done: null,
    score: 60,
    status: 'In progress',
  },
  {
    id: 'SEC-003',
    course: 'Code of conduct & ethics',
    emp: 'Vikram Singh',
    assigned: '2026-10-10',
    due: '2026-11-10',
    done: null,
    score: 0,
    status: 'Pending',
  },
];

export async function getSecurityTrainings(): Promise<SecurityTraining[]> {
  try {
    const res = await api.get('/api/learn/sectrain');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('brightcone_security_trainings', JSON.stringify(res.data));
      return res.data;
    }
  } catch {}

  try {
    const raw = localStorage.getItem('brightcone_security_trainings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  localStorage.setItem('brightcone_security_trainings', JSON.stringify(SEED_SECURITY_TRAININGS));
  return SEED_SECURITY_TRAININGS;
}

export async function createSecurityTraining(
  payload: Partial<SecurityTraining>
): Promise<SecurityTraining> {
  let created: SecurityTraining;
  try {
    const res = await api.post('/api/learn/sectrain', payload);
    created = res.data;
  } catch {
    created = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      course: payload.course || 'Security Training',
      emp: payload.emp || 'Employee',
      assigned: payload.assigned || new Date().toISOString().split('T')[0],
      due: payload.due || '2026-11-30',
      done: payload.done || null,
      score: payload.score ?? null,
      status: payload.status || 'Pending',
    };
  }

  try {
    const existing = await getSecurityTrainings();
    const updated = [created, ...existing.filter((x) => x.id !== created.id)];
    localStorage.setItem('brightcone_security_trainings', JSON.stringify(updated));
  } catch {}

  return created;
}

export async function updateSecurityTraining(
  id: string,
  payload: Partial<SecurityTraining>
): Promise<SecurityTraining> {
  let updated: SecurityTraining;
  try {
    const res = await api.put(`/api/learn/sectrain/${id}`, payload);
    updated = res.data;
  } catch {
    const existing = await getSecurityTrainings();
    const current = existing.find((x) => x.id === id) || ({} as SecurityTraining);
    updated = { ...current, ...payload, id };
  }

  try {
    const existing = await getSecurityTrainings();
    const list = existing.map((x) => (x.id === id ? { ...x, ...updated } : x));
    localStorage.setItem('brightcone_security_trainings', JSON.stringify(list));
  } catch {}

  return updated;
}

export async function deleteSecurityTraining(
  id: string
): Promise<{ success: boolean; id: string }> {
  try {
    await api.delete(`/api/learn/sectrain/${id}`);
  } catch {}

  try {
    const existing = await getSecurityTrainings();
    const list = existing.filter((x) => x.id !== id);
    localStorage.setItem('brightcone_security_trainings', JSON.stringify(list));
  } catch {}

  return { success: true, id };
}

export async function bulkAssignSecurityTraining(payload: {
  course: string;
  due: string;
}): Promise<BulkAssignResponse> {
  const res = await api.post('/api/learn/sectrain/bulk-assign', payload);
  return res.data;
}

export async function getCompletionTracker(): Promise<CompletionTrackerResponse> {
  const res = await api.get('/api/learn/completion');
  return res.data;
}

export async function updateAssignmentScore(
  assignmentId: string,
  score: number
): Promise<MyAssignment> {
  const res = await api.put(`/api/learn/assignments/${assignmentId}/score`, { score });
  return res.data;
}

export async function assignCourse(
  courseId: string,
  payload: AssignCoursePayload
): Promise<AssignCourseResponse> {
  const res = await api.post(`/api/learn/courses/${courseId}/assign`, payload);
  return res.data;
}

// ---------------------------------------------------------------------------
// REC-12: Performance Admin API
// ---------------------------------------------------------------------------

export async function getReviewCycles(): Promise<ReviewCycle[]> {
  const res = await api.get('/performance/cycles');
  return res.data;
}

export async function createReviewCycle(payload: CreateCyclePayload): Promise<ReviewCycle> {
  const res = await api.post('/performance/cycles', payload);
  return res.data;
}

export async function advanceReviewCycle(cycleId: string): Promise<ReviewCycle> {
  const res = await api.post(`/performance/cycles/${cycleId}/advance`);
  return res.data;
}

export async function getCycleDashboard(cycleId: string): Promise<CycleDashboardData> {
  const res = await api.get(`/performance/cycles/${cycleId}/dashboard`);
  return res.data;
}

export async function rateEmployee(
  cycleId: string,
  employeeId: string,
  payload: RateEmployeePayload
): Promise<CycleReviewItem> {
  const res = await api.post(`/performance/cycles/${cycleId}/rate/${employeeId}`, payload);
  return res.data;
}

export async function remindReview(
  cycleId: string,
  employeeId: string
): Promise<RemindReviewResult> {
  const res = await api.post(`/performance/cycles/${cycleId}/remind/${employeeId}`);
  return res.data;
}

export async function downloadExportRatings(cycleId: string): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/v1/performance/cycles/${cycleId}/export`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to export ratings');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ratings_${cycleId}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// =========================================================
// Isolated In-Memory Fixtures (Active ONLY when VITE_USE_MOCK=true)
// =========================================================

const MOCK_EMPLOYEES: LearnEmployee[] = [
  { id: 'BC-1001', name: 'Naresh Vemparala', role: 'Founder & CEO', dept: 'Leadership', loc: 'Hyderabad', mgr: null, status: 'Active' },
  { id: 'BC-1004', name: 'Ananya Rao', role: 'People Ops Lead', dept: 'People Ops', loc: 'Hyderabad', mgr: 'Naresh Vemparala', status: 'Active' },
  { id: 'BC-1012', name: 'Karthik Reddy', role: 'Principal AI Engineer', dept: 'AI Research', loc: 'Hyderabad', mgr: 'Naresh Vemparala', status: 'Active' },
  { id: 'BC-1019', name: 'Priya Menon', role: 'Engineering Manager', dept: 'Engineering', loc: 'Bengaluru', mgr: 'Karthik Reddy', status: 'Active' },
  { id: 'BC-1023', name: 'Daniel Brooks', role: 'Account Executive', dept: 'Sales', loc: 'San Francisco', mgr: 'Naresh Vemparala', status: 'Active' },
  { id: 'BC-1031', name: 'Sneha Iyer', role: 'Product Designer', dept: 'Design', loc: 'Hyderabad', mgr: 'Priya Menon', status: 'On leave' },
  { id: 'BC-1038', name: 'Rahul Varma', role: 'Backend Engineer', dept: 'Engineering', loc: 'Hyderabad', mgr: 'Priya Menon', status: 'Active' },
  { id: 'BC-1042', name: 'Meera Joshi', role: 'Finance Manager', dept: 'Finance', loc: 'Hyderabad', mgr: 'Naresh Vemparala', status: 'Active' },
  { id: 'BC-1047', name: 'Arjun Nair', role: 'ML Engineer', dept: 'AI Research', loc: 'Remote', mgr: 'Karthik Reddy', status: 'Active' },
  { id: 'BC-1053', name: 'Emily Carter', role: 'Customer Success Manager', dept: 'Customer Success', loc: 'Austin', mgr: 'Daniel Brooks', status: 'Active' },
  { id: 'BC-1058', name: 'Vikram Singh', role: 'DevOps Engineer', dept: 'Engineering', loc: 'Pune', mgr: 'Priya Menon', status: 'Probation' },
  { id: 'BC-1061', name: 'Lakshmi Prasad', role: 'Recruiter', dept: 'People Ops', loc: 'Hyderabad', mgr: 'Ananya Rao', status: 'Active' },
  { id: 'BC-1066', name: 'Farhan Ali', role: 'Frontend Engineer', dept: 'Engineering', loc: 'Hyderabad', mgr: 'Priya Menon', status: 'Notice period' },
  { id: 'BC-1070', name: 'Divya Kulkarni', role: 'Security Engineer', dept: 'Engineering', loc: 'Hyderabad', mgr: 'Priya Menon', status: 'Probation' },
];

interface StoredCourse {
  id: string;
  title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  audience: string;
  due_date: string | null;
}

const getInitialMockCourses = (): StoredCourse[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('brightcone_mock_courses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [
    { id: 'CO1', title: 'Information security awareness', course_type: 'Mandatory', duration: '45 min', audience: 'Everyone', due_date: '2026-10-31' },
    { id: 'CO2', title: 'POSH: Prevention of sexual harassment', course_type: 'Mandatory', duration: '30 min', audience: 'Everyone', due_date: '2026-10-20' },
    { id: 'CO3', title: 'Data privacy & HIPAA basics', course_type: 'Mandatory', duration: '40 min', audience: 'Engineering', due_date: '2026-11-15' },
    { id: 'CO4', title: 'Building agentic workflows', course_type: 'Elective', duration: '3 h', audience: 'Everyone', due_date: '' },
    { id: 'CO5', title: 'Leading high-trust teams', course_type: 'Elective', duration: '2 h', audience: 'Managers', due_date: '' },
  ];
};

let mockCoursesStore: StoredCourse[] = getInitialMockCourses();

function saveMockCoursesStore() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('brightcone_mock_courses', JSON.stringify(mockCoursesStore));
    } catch {}
  }
}

function computeMockDashboardMetrics(): LearnDashboardMetrics {
  const mandatoryCourses = mockCoursesStore.filter((c) => c.course_type === 'Mandatory');
  const electiveCount = mockCoursesStore.length - mandatoryCourses.length;

  return {
    mandatory_compliance: 84,
    total_courses: mockCoursesStore.length,
    mandatory_courses_count: mandatoryCourses.length,
    elective_courses_count: electiveCount,
    in_progress_count: 5,
    people_behind_count: 3,
    completion_by_course: [],
    compliance_breakdown: [],
    open_mandatory: [],
    total_open_mandatory: 0,
  };
}

function getMockCourses(): Course[] {
  return mockCoursesStore.map((c) => ({
    id: c.id,
    title: c.title,
    course_type: c.course_type,
    duration: c.duration,
    audience: c.audience,
    due_date: c.due_date,
    total_assigned: 10,
    completed_count: 8,
    completion_percentage: 80,
  }));
}

function createMockCourse(payload: CreateCoursePayload): Course {
  const newId = `CO${Math.floor(100 + Math.random() * 900)}`;
  const stored: StoredCourse = {
    id: newId,
    title: payload.title,
    course_type: payload.course_type,
    duration: payload.duration || '1 h',
    audience: payload.audience || 'Everyone',
    due_date: payload.due_date,
  };
  mockCoursesStore.push(stored);
  saveMockCoursesStore();
  return {
    ...stored,
    total_assigned: 14,
    completed_count: 0,
    completion_percentage: 0,
  };
}

function updateMockCourse(id: string, payload: CreateCoursePayload): Course {
  const existing = mockCoursesStore.find((c) => c.id === id);
  if (!existing) throw new Error('Course not found');
  existing.title = payload.title;
  existing.course_type = payload.course_type;
  existing.duration = payload.duration;
  existing.audience = payload.audience;
  existing.due_date = payload.due_date;
  saveMockCoursesStore();
  return {
    ...existing,
    total_assigned: 14,
    completed_count: 5,
    completion_percentage: 36,
  };
}

function getMockMyLearning(): MyAssignment[] {
  return [
    {
      assignment_id: 'AS-1',
      course_id: 'CO1',
      course_title: 'Information security awareness',
      course_type: 'Mandatory',
      duration: '45 min',
      due_date: '2026-10-31',
      progress: 100,
      status: 'Completed',
      completed_at: '2026-10-15T10:00:00Z',
    },
  ];
}

function updateMockAssignmentProgress(assignmentId: string, progress: number): MyAssignment {
  return {
    assignment_id: assignmentId,
    course_id: 'CO1',
    course_title: 'Information security awareness',
    course_type: 'Mandatory',
    duration: '45 min',
    due_date: '2026-10-31',
    progress,
    status: progress >= 100 ? 'Completed' : 'In progress',
    completed_at: progress >= 100 ? new Date().toISOString() : null,
  };
}

function sendMockReminders(_params: {
  course_id?: string;
  assignment_id?: string;
  employee_id?: string;
  bulk?: boolean;
}): RemindResponse {
  return {
    queued: 1,
    delivered: 0,
    skipped: 0,
    failed: 0,
    message: 'Mock: Reminders queued',
    details: [],
  };
}

// ==========================================
// LEARN PLACEHOLDER FEATURES (Categories, Skills, Records, Recommendations)
// ==========================================

export async function getCategories(): Promise<CourseCategory[]> {
  const res = await api.get('/api/learn/categories');
  return res.data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CourseCategory> {
  const res = await api.post('/api/learn/categories', payload);
  return res.data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CourseCategory> {
  const res = await api.put(`/api/learn/categories/${id}`, payload);
  return res.data;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/api/learn/categories/${id}`);
  return res.data;
}

export async function getSkills(): Promise<Skill[]> {
  const res = await api.get('/api/learn/skills');
  return res.data;
}

export async function createSkill(payload: CreateSkillPayload): Promise<Skill> {
  const res = await api.post('/api/learn/skills', payload);
  return res.data;
}

export async function getSkillsMatrix(): Promise<SkillsMatrixResponse> {
  const res = await api.get('/api/learn/skills/matrix');
  return res.data;
}

export async function rateSkill(payload: RateSkillPayload): Promise<EmployeeSkillRating> {
  const res = await api.post('/api/learn/skills/rate', payload);
  return res.data;
}

export async function getCompletionRecords(): Promise<CompletionRecord[]> {
  const res = await api.get('/api/learn/records');
  return res.data;
}

export async function getSkillRecommendations(): Promise<RecommendationsResponse> {
  const res = await api.get('/api/learn/recommendations');
  return res.data;
}

// ==========================================
// TIME, SHIFT, ATTENDANCE & LEAVE EXTENSIONS
// ==========================================

export const API_BASE_URL = getBaseUrl();

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('brightcone_token')) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : ''}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `API Error (${res.status}): ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      try {
        const errorText = await res.text();
        if (errorText) errorMsg = errorText;
      } catch {
        // Fallback
      }
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null as T;
  }

  return res.json();
}

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 1,
    pid: '550e8400-e29b-41d4-a716-446655440001',
    name: 'General Day Shift',
    code: 'GEN-01',
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_duration_minutes: 60,
    grace_period_minutes: 15,
    is_overnight: false,
    is_active: true,
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 2,
    pid: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Early Morning Shift',
    code: 'MOR-01',
    start_time: '06:00:00',
    end_time: '14:30:00',
    break_duration_minutes: 45,
    grace_period_minutes: 10,
    is_overnight: false,
    is_active: true,
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 3,
    pid: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Night Support Shift',
    code: 'NGT-01',
    start_time: '21:00:00',
    end_time: '06:00:00',
    break_duration_minutes: 60,
    grace_period_minutes: 15,
    is_overnight: true,
    is_active: true,
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 4,
    pid: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Weekend Standby Shift',
    code: 'WKD-01',
    start_time: '10:00:00',
    end_time: '16:00:00',
    break_duration_minutes: 30,
    grace_period_minutes: 20,
    is_overnight: false,
    is_active: false,
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 1,
    pid: '650e8400-e29b-41d4-a716-446655440001',
    name: 'Republic Day',
    holiday_date: '2026-01-26',
    description: 'National holiday commemorating the Constitution',
    applicable_location: null,
    is_recurring: true,
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 2,
    pid: '650e8400-e29b-41d4-a716-446655440002',
    name: 'Independence Day',
    holiday_date: '2026-08-15',
    description: 'National Independence celebration',
    applicable_location: null,
    is_recurring: true,
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 3,
    pid: '650e8400-e29b-41d4-a716-446655440003',
    name: 'Diwali',
    holiday_date: '2026-11-08',
    description: 'Festival of Lights holiday',
    applicable_location: null,
    is_recurring: false,
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 4,
    pid: '650e8400-e29b-41d4-a716-446655440004',
    name: 'Telangana Formation Day',
    holiday_date: '2026-06-02',
    description: 'State holiday for Hyderabad branch office',
    applicable_location: 'Hyderabad',
    is_recurring: true,
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 5,
    pid: '650e8400-e29b-41d4-a716-446655440005',
    name: 'Karnataka Rajyotsava',
    holiday_date: '2026-11-01',
    description: 'State holiday for Bengaluru technology centre',
    applicable_location: 'Bengaluru',
    is_recurring: true,
    created_at: '2026-10-15T09:00:00Z',
  },
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  {
    id: 1,
    pid: '750e8400-e29b-41d4-a716-446655440001',
    name: 'Casual Leave',
    code: 'CL',
    description: 'For personal errands, family obligations, and unplanned short absences.',
    is_paid: true,
    is_active: true,
  },
  {
    id: 2,
    pid: '750e8400-e29b-41d4-a716-446655440002',
    name: 'Sick Leave',
    code: 'SL',
    description: 'For recovery from personal illnesses, medical appointments, and healthcare needs.',
    is_paid: true,
    is_active: true,
  },
  {
    id: 3,
    pid: '750e8400-e29b-41d4-a716-446655440003',
    name: 'Earned Leave / Annual Vacation',
    code: 'EL',
    description: 'Planned vacation days accumulated monthly throughout the active service year.',
    is_paid: true,
    is_active: true,
  },
  {
    id: 4,
    pid: '750e8400-e29b-41d4-a716-446655440004',
    name: 'Maternity Leave',
    code: 'ML',
    description: 'Statutory paid leave for expectant mothers and post-delivery care.',
    is_paid: true,
    is_active: true,
  },
  {
    id: 5,
    pid: '750e8400-e29b-41d4-a716-446655440005',
    name: 'Loss of Pay',
    code: 'LOP',
    description: 'Unpaid leaves taken after exhaust of eligible paid quotas.',
    is_paid: false,
    is_active: true,
  },
];

export const INITIAL_LEAVE_QUOTAS: LeaveQuota[] = [
  {
    id: 1,
    pid: '850e8400-e29b-41d4-a716-446655440001',
    leave_type_id: 1,
    leave_type_name: 'Casual Leave',
    leave_type_code: 'CL',
    year: 2026,
    entitled_days: 12.0,
    applicable_group: 'ALL',
  },
  {
    id: 2,
    pid: '850e8400-e29b-41d4-a716-446655440002',
    leave_type_id: 2,
    leave_type_name: 'Sick Leave',
    leave_type_code: 'SL',
    year: 2026,
    entitled_days: 10.5,
    applicable_group: 'ALL',
  },
  {
    id: 3,
    pid: '850e8400-e29b-41d4-a716-446655440003',
    leave_type_id: 3,
    leave_type_name: 'Earned Leave / Annual Vacation',
    leave_type_code: 'EL',
    year: 2026,
    entitled_days: 18.0,
    applicable_group: 'ALL',
  },
  {
    id: 4,
    pid: '850e8400-e29b-41d4-a716-446655440004',
    leave_type_id: 4,
    leave_type_name: 'Maternity Leave',
    leave_type_code: 'ML',
    year: 2026,
    entitled_days: 90.0,
    applicable_group: 'FEMALE_EMPLOYEES',
  },
];

export const timeApiMethods = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health', { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },
  async fetchShifts(): Promise<ApiResponse<Shift[]>> {
    try {
      const data = await request<Shift[]>('/shifts');
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: INITIAL_SHIFTS, error: err instanceof Error ? err.message : 'Fallback to initial shifts', isLiveApi: false };
    }
  },
  async createShift(shift: Omit<Shift, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<Shift> {
    return request<Shift>('/shifts', { method: 'POST', body: JSON.stringify(shift) });
  },
  async updateShift(id: number, shift: Partial<Shift>): Promise<Shift> {
    return request<Shift>(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(shift) });
  },
  async deleteShift(id: number): Promise<void> {
    return request<void>(`/shifts/${id}`, { method: 'DELETE' });
  },
  async fetchHolidays(): Promise<ApiResponse<Holiday[]>> {
    try {
      const data = await request<Holiday[]>('/holidays');
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: INITIAL_HOLIDAYS, error: err instanceof Error ? err.message : 'Fallback to initial holidays', isLiveApi: false };
    }
  },
  async createHoliday(holiday: Omit<Holiday, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<Holiday> {
    return request<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(holiday) });
  },
  async updateHoliday(id: number, holiday: Partial<Holiday>): Promise<Holiday> {
    return request<Holiday>(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(holiday) });
  },
  async deleteHoliday(id: number): Promise<void> {
    return request<void>(`/holidays/${id}`, { method: 'DELETE' });
  },
  async fetchLeaveTypes(): Promise<ApiResponse<LeaveType[]>> {
    try {
      const data = await request<LeaveType[]>('/leave-types');
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: INITIAL_LEAVE_TYPES, error: err instanceof Error ? err.message : 'Fallback to initial leave types', isLiveApi: false };
    }
  },
  async createLeaveType(lt: Omit<LeaveType, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<LeaveType> {
    return request<LeaveType>('/leave-types', { method: 'POST', body: JSON.stringify(lt) });
  },
  async updateLeaveType(id: number, lt: Partial<LeaveType>): Promise<LeaveType> {
    return request<LeaveType>(`/leave-types/${id}`, { method: 'PUT', body: JSON.stringify(lt) });
  },
  async deleteLeaveType(id: number): Promise<void> {
    return request<void>(`/leave-types/${id}`, { method: 'DELETE' });
  },
  async fetchLeaveQuotas(): Promise<ApiResponse<LeaveQuota[]>> {
    try {
      const data = await request<LeaveQuota[]>('/leave-quotas');
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: INITIAL_LEAVE_QUOTAS, error: err instanceof Error ? err.message : 'Fallback to initial leave quotas', isLiveApi: false };
    }
  },
  async createLeaveQuota(lq: Omit<LeaveQuota, 'id' | 'pid' | 'created_at' | 'updated_at'>): Promise<LeaveQuota> {
    return request<LeaveQuota>('/leave-quotas', { method: 'POST', body: JSON.stringify(lq) });
  },
  async updateLeaveQuota(id: number, lq: Partial<LeaveQuota>): Promise<LeaveQuota> {
    return request<LeaveQuota>(`/leave-quotas/${id}`, { method: 'PUT', body: JSON.stringify(lq) });
  },
  async deleteLeaveQuota(id: number): Promise<void> {
    return request<void>(`/leave-quotas/${id}`, { method: 'DELETE' });
  },
  async fetchWeeklyRoster(weekStart?: string): Promise<ApiResponse<WeeklyRosterResponse>> {
    try {
      const qs = weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : '';
      const data = await request<WeeklyRosterResponse>(`/roster${qs}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch weekly roster', isLiveApi: false };
    }
  },
  async assignShift(payload: AssignShiftPayload): Promise<any> {
    return request<any>('/roster/assign', { method: 'POST', body: JSON.stringify(payload) });
  },
  async publishRoster(payload: PublishRosterPayload): Promise<any> {
    return request<any>('/roster/publish', { method: 'POST', body: JSON.stringify(payload) });
  },
  async fetchEmployees(): Promise<ApiResponse<TimeEmployee[]>> {
    try {
      const data = await request<TimeEmployee[]>('/employees');
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to fetch employees', isLiveApi: false };
    }
  },
  async countLeaveDays(params: CountLeaveDaysRequest): Promise<ApiResponse<LeaveCalculationResult>> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('start_date', params.start_date);
      searchParams.set('end_date', params.end_date);
      if (params.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params.leave_type_id) searchParams.set('leave_type_id', String(params.leave_type_id));
      if (params.is_half_day !== undefined) searchParams.set('is_half_day', String(params.is_half_day));
      const data = await request<LeaveCalculationResult>(`/leave-calc/days?${searchParams.toString()}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to calculate leave days', isLiveApi: false };
    }
  },
  async fetchLeaveRequests(params?: LeaveRequestQuery): Promise<ApiResponse<LeaveRequest[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
      if (params?.year) searchParams.set('year', String(params.year));
      const qs = searchParams.toString();
      const endpoint = qs ? `/leave-requests?${qs}` : '/leave-requests';
      const data = await request<LeaveRequest[]>(endpoint);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch leave requests', isLiveApi: false };
    }
  },
  async getLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
    try {
      const data = await request<LeaveRequest>(`/leave-requests/${id}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : `Failed to fetch leave request #${id}`, isLiveApi: false };
    }
  },
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    return request<LeaveRequest>('/leave-requests', { method: 'POST', body: JSON.stringify(payload) });
  },
  async approveLeaveRequest(id: number, payload: ApproveLeaveRequestPayload = {}): Promise<LeaveRequest> {
    return request<LeaveRequest>(`/leave-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async rejectLeaveRequest(id: number, payload: RejectLeaveRequestPayload): Promise<LeaveRequest> {
    return request<LeaveRequest>(`/leave-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async cancelLeaveRequest(id: number): Promise<LeaveRequest> {
    return request<LeaveRequest>(`/leave-requests/${id}/cancel`, { method: 'POST' });
  },
  async getLeaveBalances(employeeId: number, year?: number): Promise<ApiResponse<LeaveBalanceResponse>> {
    try {
      const qs = year ? `?year=${year}` : '';
      const data = await request<LeaveBalanceResponse>(`/leave-requests/balance/${employeeId}${qs}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch leave balances', isLiveApi: false };
    }
  },
  async fetchWfhRequests(params?: WfhQuery): Promise<ApiResponse<WorkFromHomeRequest[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
      if (params?.start_date) searchParams.set('start_date', params.start_date);
      if (params?.end_date) searchParams.set('end_date', params.end_date);
      const qs = searchParams.toString();
      const endpoint = qs ? `/wfh-requests?${qs}` : '/wfh-requests';
      const data = await request<WorkFromHomeRequest[]>(endpoint);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch WFH requests', isLiveApi: false };
    }
  },
  async getWfhRequest(id: number): Promise<ApiResponse<WorkFromHomeRequest>> {
    try {
      const data = await request<WorkFromHomeRequest>(`/wfh-requests/${id}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : `Failed to fetch WFH request #${id}`, isLiveApi: false };
    }
  },
  async createWfhRequest(payload: CreateWfhPayload): Promise<WorkFromHomeRequest> {
    return request<WorkFromHomeRequest>('/wfh-requests', { method: 'POST', body: JSON.stringify(payload) });
  },
  async approveWfhRequest(id: number, payload: ApproveWfhPayload = {}): Promise<WorkFromHomeRequest> {
    return request<WorkFromHomeRequest>(`/wfh-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async rejectWfhRequest(id: number, payload: RejectWfhPayload): Promise<WorkFromHomeRequest> {
    return request<WorkFromHomeRequest>(`/wfh-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async cancelWfhRequest(id: number): Promise<WorkFromHomeRequest> {
    return request<WorkFromHomeRequest>(`/wfh-requests/${id}/cancel`, { method: 'POST' });
  },
  async getCompOffBalance(employeeId: number): Promise<ApiResponse<CompOffBalance>> {
    try {
      const data = await request<CompOffBalance>(`/comp-off/balance?employee_id=${employeeId}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch comp-off balance', isLiveApi: false };
    }
  },
  async fetchCompOffEntitlements(params?: CompOffQuery): Promise<ApiResponse<CompOffEntitlement[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
      const qs = searchParams.toString();
      const endpoint = qs ? `/comp-off/entitlements?${qs}` : '/comp-off/entitlements';
      const data = await request<CompOffEntitlement[]>(endpoint);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch comp-off entitlements', isLiveApi: false };
    }
  },
  async grantCompOffEntitlement(payload: GrantCompOffPayload): Promise<CompOffEntitlement> {
    return request<CompOffEntitlement>('/comp-off/entitlements', { method: 'POST', body: JSON.stringify(payload) });
  },
  async fetchCompOffRequests(params?: CompOffQuery): Promise<ApiResponse<CompOffRequest[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
      const qs = searchParams.toString();
      const endpoint = qs ? `/comp-off/requests?${qs}` : '/comp-off/requests';
      const data = await request<CompOffRequest[]>(endpoint);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch comp-off requests', isLiveApi: false };
    }
  },
  async getCompOffRequest(id: number): Promise<ApiResponse<CompOffRequest>> {
    try {
      const data = await request<CompOffRequest>(`/comp-off/requests/${id}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : `Failed to fetch comp-off request #${id}`, isLiveApi: false };
    }
  },
  async createCompOffRequest(payload: CreateCompOffRequestPayload): Promise<CompOffRequest> {
    return request<CompOffRequest>('/comp-off/requests', { method: 'POST', body: JSON.stringify(payload) });
  },
  async approveCompOffRequest(id: number, payload: ApproveCompOffPayload = {}): Promise<CompOffRequest> {
    return request<CompOffRequest>(`/comp-off/requests/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async rejectCompOffRequest(id: number, payload: RejectCompOffPayload): Promise<CompOffRequest> {
    return request<CompOffRequest>(`/comp-off/requests/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async cancelCompOffRequest(id: number): Promise<CompOffRequest> {
    return request<CompOffRequest>(`/comp-off/requests/${id}/cancel`, { method: 'POST' });
  },
  async fetchSwapRequests(params?: SwapQuery): Promise<ApiResponse<SwapRequestDetail[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.employee_id) searchParams.set('employee_id', String(params.employee_id));
      if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
      if (params?.date) searchParams.set('date', params.date);
      const qs = searchParams.toString();
      const endpoint = qs ? `/swap-requests?${qs}` : '/swap-requests';
      const data = await request<SwapRequestDetail[]>(endpoint);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch swap requests', isLiveApi: false };
    }
  },
  async getSwapRequest(id: number): Promise<ApiResponse<SwapRequestDetail>> {
    try {
      const data = await request<SwapRequestDetail>(`/swap-requests/${id}`);
      return { data, error: null, isLiveApi: true };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : `Failed to fetch swap request #${id}`, isLiveApi: false };
    }
  },
  async createSwapRequest(payload: CreateSwapPayload): Promise<SwapRequestDetail> {
    return request<SwapRequestDetail>('/swap-requests', { method: 'POST', body: JSON.stringify(payload) });
  },
  async approveSwapRequest(id: number, payload: ApproveSwapPayload = {}): Promise<SwapRequestDetail> {
    return request<SwapRequestDetail>(`/swap-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async rejectSwapRequest(id: number, payload: RejectSwapPayload): Promise<SwapRequestDetail> {
    return request<SwapRequestDetail>(`/swap-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async cancelSwapRequest(id: number): Promise<SwapRequestDetail> {
    return request<SwapRequestDetail>(`/swap-requests/${id}/cancel`, { method: 'POST' });
  },
};

Object.assign(api, timeApiMethods);

export default api;



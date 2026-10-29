import { apiClient } from './client';
import {
  AttendanceRegularisation,
  AttendanceSummaryResponse,
  CandidateTracker,
  CompanyPolicy,
  CreateDependentPayload,
  CreateEmployeePayload,
  CreateLetterRequestPayload,
  CreateRegularisationPayload,
  CreateServiceRequestPayload,
  Employee,
  EmployeeAttendance,
  EmployeeDependent,
  EmployeeDocument,
  EmployeeFilterQuery,
  EmployeeLeave,
  EmployeeProfile,
  EmployeeReferral,
  LetterRequest,
  ManpowerRequirement,
  ServiceRequest,
  UploadDocumentPayload,
  WakeupStatus,
} from '../types/employee.types';

export const employeesApi = {
  // Directory (HR Admin)
  getEmployees: async (filters?: EmployeeFilterQuery): Promise<Employee[]> => {
    const res = await apiClient.get<Employee[]>('/api/employees', { params: filters });
    return res.data;
  },

  createEmployee: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const res = await apiClient.post<Employee>('/api/employees', payload);
    return res.data;
  },

  updateEmployee: async (id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> => {
    const res = await apiClient.put<Employee>(`/api/employees/${id}`, payload);
    return res.data;
  },

  exportCsv: async (): Promise<Blob> => {
    const res = await apiClient.get('/api/employees/export', {
      responseType: 'blob',
    });
    return res.data;
  },

  importCsv: async (file: File): Promise<{ count: number; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ count: number; message: string }>('/api/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Employee Personal Data Self-Service (Employee Role)
  // -------------------------------------------------------------------------
  getMyProfile: async (email?: string): Promise<EmployeeProfile> => {
    const res = await apiClient.get<EmployeeProfile>('/api/employees/me/profile', {
      params: email ? { email } : undefined,
    });
    return res.data;
  },

  updateMyProfile: async (profile: EmployeeProfile): Promise<EmployeeProfile> => {
    const res = await apiClient.put<EmployeeProfile>('/api/employees/me/profile', profile);
    return res.data;
  },

  getReferrals: async (email?: string): Promise<EmployeeReferral[]> => {
    const res = await apiClient.get<EmployeeReferral[]>('/api/employee/referrals', {
      params: email ? { email } : undefined,
    });
    return res.data;
  },

  createReferral: async (payload: {
    candidate_name: string;
    role: string;
    referred_by?: string;
    bonus?: number;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<EmployeeReferral> => {
    const res = await apiClient.post<EmployeeReferral>('/api/employee/referrals', payload);
    return res.data;
  },

  getLeaves: async (employeeId?: string): Promise<EmployeeLeave[]> => {
    const res = await apiClient.get<EmployeeLeave[]>('/api/employee/leaves', {
      params: employeeId ? { employee_id: employeeId } : undefined,
    });
    return res.data;
  },

  createLeave: async (payload: { employee_id: string; leave_type: string; from_date: string; to_date: string; days: number; reason: string }): Promise<EmployeeLeave> => {
    const res = await apiClient.post<EmployeeLeave>('/api/employee/leaves', payload);
    return res.data;
  },

  updateLeaveStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/api/employee/leaves/${id}/status`, { status });
  },

  getAttendance: async (employeeId?: string): Promise<EmployeeAttendance[]> => {
    const res = await apiClient.get<EmployeeAttendance[]>('/api/employee/attendance', {
      params: employeeId ? { employee_id: employeeId } : undefined,
    });
    return res.data;
  },

  punchAttendance: async (employeeId: string): Promise<EmployeeAttendance> => {
    const res = await apiClient.post<EmployeeAttendance>('/api/employee/attendance/punch', { employee_id: employeeId });
    return res.data;
  },

  // Modern Attendance Summary & Punches
  getAttendanceSummary: async (employeeId = 'BC-1038'): Promise<AttendanceSummaryResponse> => {
    const res = await apiClient.get<AttendanceSummaryResponse>('/api/employee/attendance/summary', {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  clockInOut: async (employeeId = 'BC-1038'): Promise<AttendanceSummaryResponse> => {
    const res = await apiClient.post<AttendanceSummaryResponse>('/api/employee/attendance/clock', {
      employee_id: employeeId,
    });
    return res.data;
  },

  getRegularisations: async (employeeId = 'BC-1038'): Promise<AttendanceRegularisation[]> => {
    const res = await apiClient.get<AttendanceRegularisation[]>('/api/employee/attendance/regularisations', {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  createRegularisation: async (payload: CreateRegularisationPayload): Promise<AttendanceRegularisation> => {
    const res = await apiClient.post<AttendanceRegularisation>('/api/employee/attendance/regularisations', payload);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Policies, Documents & Letters
  // -------------------------------------------------------------------------
  getPolicies: async (employeeId = 'BC-1038'): Promise<CompanyPolicy[]> => {
    const res = await apiClient.get<CompanyPolicy[]>('/api/documents/policies', {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  acknowledgePolicy: async (policyId: string, employeeId = 'BC-1038'): Promise<CompanyPolicy> => {
    const res = await apiClient.post<CompanyPolicy>(`/api/documents/policies/${policyId}/acknowledge`, {
      employee_id: employeeId,
    });
    return res.data;
  },

  getMyDocuments: async (employeeId = 'BC-1038'): Promise<EmployeeDocument[]> => {
    const res = await apiClient.get<EmployeeDocument[]>('/api/documents/my-documents', {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  uploadDocument: async (payload: UploadDocumentPayload): Promise<EmployeeDocument> => {
    const res = await apiClient.post<EmployeeDocument>('/api/documents/upload', payload);
    return res.data;
  },

  getLetterRequests: async (employeeId = 'BC-1038'): Promise<LetterRequest[]> => {
    const res = await apiClient.get<LetterRequest[]>('/api/documents/letters', {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  createLetterRequest: async (payload: CreateLetterRequestPayload): Promise<LetterRequest> => {
    const res = await apiClient.post<LetterRequest>('/api/documents/letters', payload);
    return res.data;
  },


  // -------------------------------------------------------------------------
  // Service Requests (Helpdesk / Bank Change)
  // -------------------------------------------------------------------------
  getServiceRequests: async (employeeId?: string): Promise<ServiceRequest[]> => {
    const res = await apiClient.get<ServiceRequest[]>('/api/employee/requests', {
      params: employeeId ? { employee_id: employeeId } : undefined,
    });
    return res.data;
  },

  createServiceRequest: async (payload: CreateServiceRequestPayload): Promise<ServiceRequest> => {
    const res = await apiClient.post<ServiceRequest>('/api/employee/requests', payload);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Employee Dependents (Family Tab)
  // -------------------------------------------------------------------------
  getDependents: async (employeeId?: string): Promise<EmployeeDependent[]> => {
    const res = await apiClient.get<EmployeeDependent[]>('/api/employee/dependents', {
      params: employeeId ? { employee_id: employeeId } : undefined,
    });
    return res.data;
  },

  createDependent: async (payload: CreateDependentPayload): Promise<EmployeeDependent> => {
    const res = await apiClient.post<EmployeeDependent>('/api/employee/dependents', payload);
    return res.data;
  },

  deleteDependent: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ success: boolean }>(`/api/employee/dependents/${id}`);
    return res.data.success;
  },
  getManpower: async (): Promise<ManpowerRequirement[]> => {
    const res = await apiClient.get<ManpowerRequirement[]>('/api/manpower');
    return res.data;
  },

  createManpower: async (payload: Partial<ManpowerRequirement>): Promise<ManpowerRequirement> => {
    const res = await apiClient.post<ManpowerRequirement>('/api/manpower', payload);
    return res.data;
  },

  updateManpower: async (id: string, payload: ManpowerRequirement): Promise<ManpowerRequirement> => {
    const res = await apiClient.put<ManpowerRequirement>(`/api/manpower/${id}`, payload);
    return res.data;
  },

  deleteManpower: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/manpower/${id}`);
  },

  // -------------------------------------------------------------------------
  // Candidate Tracker (HR Admin Role)
  // -------------------------------------------------------------------------
  getCandidateTrackers: async (): Promise<CandidateTracker[]> => {
    const res = await apiClient.get<CandidateTracker[]>('/api/candidate-tracker');
    return res.data;
  },

  createCandidateTracker: async (payload: Partial<CandidateTracker>): Promise<CandidateTracker> => {
    const res = await apiClient.post<CandidateTracker>('/api/candidate-tracker', payload);
    return res.data;
  },

  updateCandidateTracker: async (id: string, payload: CandidateTracker): Promise<CandidateTracker> => {
    const res = await apiClient.put<CandidateTracker>(`/api/candidate-tracker/${id}`, payload);
    return res.data;
  },

  deleteCandidateTracker: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/candidate-tracker/${id}`);
  },

  convertCandidateToEmployee: async (id: string): Promise<Employee> => {
    const res = await apiClient.post<Employee>(`/api/candidate-tracker/${id}/convert`);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // System Wake-Up & Background Process
  // -------------------------------------------------------------------------
  getWakeupStatus: async (): Promise<WakeupStatus> => {
    const res = await apiClient.get<WakeupStatus>('/api/system/wakeup');
    return res.data;
  },

  triggerWakeup: async (): Promise<WakeupStatus> => {
    const res = await apiClient.post<WakeupStatus>('/api/system/wakeup');
    return res.data;
  },
};

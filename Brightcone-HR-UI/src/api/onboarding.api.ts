import { apiClient } from './client';
import {
  JoiningRecord,
  CreateJoiningRecordPayload,
  UpdateJoiningStatusPayload,
  UpdateJoiningDocumentsPayload,
  OnboardingChecklist,
  OnboardingChecklistItem,
  CreateChecklistPayload,
  CreateChecklistItemPayload,
  UpdateChecklistItemPayload,
  CreateOnboardingTaskPayload,
  Internship,
  CreateInternshipPayload,
  UpdateInternshipStatusPayload,
  ConvertInternshipPayload,
} from '../types/recruitment.types';

// ============================================================================
// Joining Formalities API
// ============================================================================
export const joiningFormalitiesApi = {
  getRecords: async (params?: { status?: string; q?: string }): Promise<JoiningRecord[]> => {
    const res = await apiClient.get<JoiningRecord[]>('/api/joining-formalities', { params });
    return res.data;
  },

  getRecord: async (id: string): Promise<JoiningRecord> => {
    const res = await apiClient.get<JoiningRecord>(`/api/joining-formalities/${id}`);
    return res.data;
  },

  createRecord: async (payload: CreateJoiningRecordPayload): Promise<JoiningRecord> => {
    const res = await apiClient.post<JoiningRecord>('/api/joining-formalities', payload);
    return res.data;
  },

  updateRecord: async (id: string, payload: Partial<JoiningRecord>): Promise<JoiningRecord> => {
    const res = await apiClient.put<JoiningRecord>(`/api/joining-formalities/${id}`, payload);
    return res.data;
  },

  updateStatus: async (id: string, payload: UpdateJoiningStatusPayload): Promise<JoiningRecord> => {
    const res = await apiClient.patch<JoiningRecord>(`/api/joining-formalities/${id}/status`, payload);
    return res.data;
  },

  updateDocuments: async (id: string, payload: UpdateJoiningDocumentsPayload): Promise<JoiningRecord> => {
    const res = await apiClient.patch<JoiningRecord>(`/api/joining-formalities/${id}/documents`, payload);
    return res.data;
  },

  completeJoining: async (id: string, employeeId?: string): Promise<{ record: JoiningRecord; employee: any; success: boolean }> => {
    const res = await apiClient.post<{ record: JoiningRecord; employee: any; success: boolean }>(
      `/api/joining-formalities/${id}/complete`,
      { employee_id: employeeId }
    );
    return res.data;
  },

  deleteRecord: async (id: string): Promise<{ success: boolean; deleted_id: string }> => {
    const res = await apiClient.delete<{ success: boolean; deleted_id: string }>(`/api/joining-formalities/${id}`);
    return res.data;
  },
};

// ============================================================================
// Onboarding Checklists API
// ============================================================================
export const onboardingChecklistsApi = {
  getChecklists: async (params?: { employee_id?: string; status?: string }): Promise<OnboardingChecklist[]> => {
    const res = await apiClient.get<OnboardingChecklist[]>('/api/onboarding-checklists', { params });
    return res.data;
  },

  getChecklist: async (id: string): Promise<OnboardingChecklist> => {
    const res = await apiClient.get<OnboardingChecklist>(`/api/onboarding-checklists/${id}`);
    return res.data;
  },

  createChecklist: async (payload: CreateChecklistPayload): Promise<OnboardingChecklist> => {
    const res = await apiClient.post<OnboardingChecklist>('/api/onboarding-checklists', payload);
    return res.data;
  },

  updateChecklist: async (id: string, payload: Partial<OnboardingChecklist>): Promise<OnboardingChecklist> => {
    const res = await apiClient.put<OnboardingChecklist>(`/api/onboarding-checklists/${id}`, payload);
    return res.data;
  },

  addItem: async (checklistId: string, payload: CreateChecklistItemPayload): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.post<OnboardingChecklistItem>(`/api/onboarding-checklists/${checklistId}/items`, payload);
    return res.data;
  },

  updateItem: async (
    checklistId: string,
    itemId: string,
    payload: UpdateChecklistItemPayload
  ): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.patch<OnboardingChecklistItem>(
      `/api/onboarding-checklists/${checklistId}/items/${itemId}`,
      payload
    );
    return res.data;
  },

  updateItemStatus: async (
    checklistId: string,
    itemId: string,
    status: string
  ): Promise<OnboardingChecklist> => {
    const res = await apiClient.patch<OnboardingChecklist>(
      `/api/onboarding-checklists/${checklistId}/items/${itemId}/status`,
      { status }
    );
    return res.data;
  },

  deleteChecklist: async (id: string): Promise<{ success: boolean; deleted_id: string }> => {
    const res = await apiClient.delete<{ success: boolean; deleted_id: string }>(`/api/onboarding-checklists/${id}`);
    return res.data;
  },

  deleteItem: async (checklistId: string, itemId: string): Promise<{ success: boolean; deleted_item_id: string }> => {
    const res = await apiClient.delete<{ success: boolean; deleted_item_id: string }>(
      `/api/onboarding-checklists/${checklistId}/items/${itemId}`
    );
    return res.data;
  },
};

// ============================================================================
// Onboarding Tasks Direct API (Matching Task-level UI & Standard Checklist)
// ============================================================================
export const onboardingTasksApi = {
  getTasks: async (params?: {
    employee_id?: string;
    status?: string;
    archived?: boolean;
    q?: string;
  }): Promise<OnboardingChecklistItem[]> => {
    const res = await apiClient.get<OnboardingChecklistItem[]>('/api/onboarding-tasks', { params });
    return res.data;
  },

  getTask: async (id: string): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.get<OnboardingChecklistItem>(`/api/onboarding-tasks/${id}`);
    return res.data;
  },

  createTask: async (payload: CreateOnboardingTaskPayload): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.post<OnboardingChecklistItem>('/api/onboarding-tasks', payload);
    return res.data;
  },

  updateTask: async (id: string, payload: Partial<CreateOnboardingTaskPayload>): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.put<OnboardingChecklistItem>(`/api/onboarding-tasks/${id}`, payload);
    return res.data;
  },

  updateTaskStatus: async (
    id: string,
    status: string,
    completed_on?: string,
    timestamp?: string,
    user?: string
  ): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.patch<OnboardingChecklistItem>(`/api/onboarding-tasks/${id}/status`, {
      status,
      completed_on,
      timestamp,
      user,
    });
    return res.data;
  },

  archiveTask: async (id: string, archived: boolean = true): Promise<OnboardingChecklistItem> => {
    const res = await apiClient.patch<OnboardingChecklistItem>(`/api/onboarding-tasks/${id}/archive`, {
      archived,
    });
    return res.data;
  },

  deleteTask: async (id: string): Promise<{ success: boolean; deleted_id: string }> => {
    const res = await apiClient.delete<{ success: boolean; deleted_id: string }>(`/api/onboarding-tasks/${id}`);
    return res.data;
  },

  createStandardChecklist: async (
    employee_id: string
  ): Promise<{ success: boolean; created_count: number; tasks: OnboardingChecklistItem[] }> => {
    const res = await apiClient.post<{ success: boolean; created_count: number; tasks: OnboardingChecklistItem[] }>(
      '/api/onboarding-tasks/standard',
      { employee_id }
    );
    return res.data;
  },
};

// ============================================================================
// Internship Management API
// ============================================================================
export const internshipsApi = {
  getInternships: async (params?: {
    status?: string;
    archived?: boolean;
    department?: string;
    q?: string;
  }): Promise<Internship[]> => {
    const res = await apiClient.get<Internship[]>('/api/internships', { params });
    return res.data;
  },

  getInternship: async (id: string): Promise<Internship> => {
    const res = await apiClient.get<Internship>(`/api/internships/${id}`);
    return res.data;
  },

  createInternship: async (payload: CreateInternshipPayload): Promise<Internship> => {
    const res = await apiClient.post<Internship>('/api/internships', payload);
    return res.data;
  },

  updateInternship: async (id: string, payload: Partial<Internship>): Promise<Internship> => {
    const res = await apiClient.put<Internship>(`/api/internships/${id}`, payload);
    return res.data;
  },

  updateStatus: async (id: string, payload: UpdateInternshipStatusPayload): Promise<Internship> => {
    const res = await apiClient.patch<Internship>(`/api/internships/${id}/status`, payload);
    return res.data;
  },

  archiveInternship: async (id: string, archived: boolean = true): Promise<Internship> => {
    const res = await apiClient.patch<Internship>(`/api/internships/${id}/archive`, { archived });
    return res.data;
  },

  convertInternship: async (
    id: string,
    payload: ConvertInternshipPayload
  ): Promise<{ success: boolean; internship: Internship; employee: any }> => {
    const res = await apiClient.post<{ success: boolean; internship: Internship; employee: any }>(
      `/api/internships/${id}/convert`,
      payload
    );
    return res.data;
  },

  deleteInternship: async (id: string): Promise<{ success: boolean; deleted_id: string }> => {
    const res = await apiClient.delete<{ success: boolean; deleted_id: string }>(`/api/internships/${id}`);
    return res.data;
  },
};

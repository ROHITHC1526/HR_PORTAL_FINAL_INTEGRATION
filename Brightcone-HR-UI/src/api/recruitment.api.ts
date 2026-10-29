import { apiClient } from './client';
import {
  Candidate,
  CreateCandidatePayload,
  CreateJobPayload,
  Interview,
  Job,
  ScheduleInterviewPayload,
} from '../types/recruitment.types';

export const recruitmentApi = {
  // Jobs
  getJobs: async (): Promise<Job[]> => {
    const res = await apiClient.get<Job[]>('/api/jobs');
    return res.data;
  },

  createJob: async (payload: CreateJobPayload): Promise<Job> => {
    const res = await apiClient.post<Job>('/api/jobs', payload);
    return res.data;
  },

  updateJobStatus: async (id: number, status: string): Promise<Job> => {
    const res = await apiClient.put<Job>(`/api/jobs/${id}/status`, { status });
    return res.data;
  },

  // Candidates
  getCandidates: async (params?: { q?: string; status?: string; job_id?: number }): Promise<Candidate[]> => {
    const res = await apiClient.get<Candidate[]>('/api/candidates', { params });
    return res.data;
  },

  createCandidate: async (payload: CreateCandidatePayload): Promise<Candidate> => {
    const res = await apiClient.post<Candidate>('/api/candidates', payload);
    return res.data;
  },

  updateCandidateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.put(`/api/candidates/${id}/status`, { status });
  },

  // Interviews
  getInterviews: async (): Promise<Interview[]> => {
    const res = await apiClient.get<Interview[]>('/api/interviews');
    return res.data;
  },

  scheduleInterview: async (payload: ScheduleInterviewPayload): Promise<Interview> => {
    const res = await apiClient.post<Interview>('/api/interviews', payload);
    return res.data;
  },

  updateInterview: async (id: number, payload: Partial<Interview>): Promise<Interview> => {
    const res = await apiClient.put<Interview>(`/api/interviews/${id}`, payload);
    return res.data;
  },

  deleteInterview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/interviews/${id}`);
  },

  // Offer Letters
  getOffers: async (): Promise<import('../types/recruitment.types').OfferLetter[]> => {
    const res = await apiClient.get('/api/offers');
    return res.data;
  },

  createOffer: async (payload: import('../types/recruitment.types').CreateOfferPayload): Promise<import('../types/recruitment.types').OfferLetter> => {
    const res = await apiClient.post('/api/offers', payload);
    return res.data;
  },

  updateOffer: async (id: string, payload: Partial<import('../types/recruitment.types').OfferLetter>): Promise<import('../types/recruitment.types').OfferLetter> => {
    const res = await apiClient.put(`/api/offers/${id}`, payload);
    return res.data;
  },

  deleteOffer: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/offers/${id}`);
  },
};


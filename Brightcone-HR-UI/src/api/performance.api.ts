import { apiClient } from './client';
import {
  CreateFeedbackPayload,
  CreateGoalPayload,
  CreateReviewPayload,
  Goal,
  PeerFeedback,
  PerformanceReview,
  ReviewCycleStatus,
  SelfReviewPayload,
} from '../types/performance.types';

export const performanceApi = {
  getGoals: async (): Promise<Goal[]> => {
    const res = await apiClient.get<Goal[]>('/api/performance/goals');
    return res.data;
  },

  createGoal: async (payload: CreateGoalPayload): Promise<Goal> => {
    const res = await apiClient.post<Goal>('/api/performance/goals', payload);
    return res.data;
  },

  updateGoalProgress: async (id: number, progress: number): Promise<void> => {
    await apiClient.put(`/api/performance/goals/${id}/progress`, { progress });
  },

  getReviews: async (): Promise<PerformanceReview[]> => {
    const res = await apiClient.get<PerformanceReview[]>('/api/performance/reviews');
    return res.data;
  },

  createReview: async (payload: CreateReviewPayload): Promise<PerformanceReview> => {
    const res = await apiClient.post<PerformanceReview>('/api/performance/reviews', payload);
    return res.data;
  },

  getFeedbacks: async (employee_id = 'BC-1038'): Promise<PeerFeedback[]> => {
    const res = await apiClient.get<PeerFeedback[]>('/api/performance/feedbacks', {
      params: { employee_id },
    });
    return res.data;
  },

  createFeedback: async (payload: CreateFeedbackPayload): Promise<PeerFeedback> => {
    const res = await apiClient.post<PeerFeedback>('/api/performance/feedbacks', payload);
    return res.data;
  },

  getReviewStatus: async (employee_id = 'BC-1038', cycle = 'H2 2026'): Promise<ReviewCycleStatus> => {
    const res = await apiClient.get<ReviewCycleStatus>('/api/performance/review-status', {
      params: { employee_id, cycle },
    });
    return res.data;
  },

  submitSelfReview: async (payload: SelfReviewPayload): Promise<ReviewCycleStatus> => {
    const res = await apiClient.post<ReviewCycleStatus>('/api/performance/self-review', payload);
    return res.data;
  },
};


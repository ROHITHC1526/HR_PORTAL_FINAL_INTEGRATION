import { apiClient } from './client';
import { DashboardStats } from '../types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return res.data;
  },
};

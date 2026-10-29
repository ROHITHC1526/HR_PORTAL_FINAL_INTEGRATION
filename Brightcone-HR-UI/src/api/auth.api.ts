import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<{ user: User }>('/api/auth/me');
    return res.data.user;
  },

  checkHealth: async (): Promise<{ app_name: string }> => {
    const res = await apiClient.get<{ app_name: string }>('/api');
    return res.data;
  },
};

import { AuthResponse, LoginRequest, RegisterRequest } from '@react-node-demo/shared-contracts';

import { apiClient } from './client';
import { normalizeApiError } from './errors';

export const authApi = {
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  refresh: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

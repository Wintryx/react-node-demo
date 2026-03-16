import axios from 'axios';

import { ApiErrorPayload, AuthResponse, Employee, LoginRequest, RegisterRequest, Task } from './types';
import { clearAuthSession, readAuthSession } from '../../features/auth/auth-storage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  },
);

const normalizeApiError = (error: unknown): Error => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return new Error('Unexpected error. Please try again.');
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return new Error(message.join(' '));
  }

  if (typeof message === 'string' && message.length > 0) {
    return new Error(message);
  }

  return new Error('Request failed. Please try again.');
};

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
};

export const employeesApi = {
  list: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<Employee[]>('/employees');
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

export const tasksApi = {
  listByEmployee: async (employeeId: number): Promise<Task[]> => {
    try {
      const response = await apiClient.get<Task[]>('/tasks', {
        params: {
          employeeId,
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

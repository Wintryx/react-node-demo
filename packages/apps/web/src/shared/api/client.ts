import { AuthResponse } from '@react-node-demo/shared-contracts';
import axios, { AxiosRequestConfig } from 'axios';

import { createRefreshCoordinator, isAuthEndpointRequest } from './auth-refresh';
import { notifyUnauthorized } from './unauthorized-handler';
import { clearAuthSession, readAuthSession } from '../../features/auth/auth-storage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const refreshCoordinator = createRefreshCoordinator(async () => {
  const response = await refreshClient.post<AuthResponse>('/auth/refresh');
  return response.data;
});

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    if (!originalRequest) {
      clearAuthSession();
      notifyUnauthorized();
      return Promise.reject(error);
    }

    if (isAuthEndpointRequest(originalRequest.url, apiBaseUrl)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthSession();
      notifyUnauthorized();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshedAccessToken = await refreshCoordinator.refreshAccessToken();
    if (!refreshedAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

    return apiClient.request(originalRequest);
  },
);

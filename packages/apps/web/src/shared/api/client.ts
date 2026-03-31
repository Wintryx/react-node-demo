import { AuthResponse } from '@react-node-demo/shared-contracts';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { createRefreshCoordinator, isAuthEndpointRequest } from './auth-refresh';
import { notifyUnauthorized } from './unauthorized-handler';
import { authSessionManager } from '../../features/auth/auth-session-manager';

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface ApiClientDependencies {
  readSession: typeof authSessionManager.read;
  clearSession: typeof authSessionManager.clear;
  handleUnauthorized: typeof notifyUnauthorized;
}

const defaultApiClientDependencies: ApiClientDependencies = {
  readSession: authSessionManager.read,
  clearSession: authSessionManager.clear,
  handleUnauthorized: notifyUnauthorized,
};

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface CreateApiClientOptions {
  apiBaseUrl?: string;
  dependencies?: Partial<ApiClientDependencies>;
}

export const createApiClient = (options: CreateApiClientOptions = {}): AxiosInstance => {
  const apiBaseUrl = options.apiBaseUrl ?? defaultApiBaseUrl;
  const dependencies = {
    ...defaultApiClientDependencies,
    ...options.dependencies,
  };

  const client = axios.create({
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

  client.interceptors.request.use((config) => {
    const session = dependencies.readSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
      if (!originalRequest) {
        dependencies.clearSession();
        dependencies.handleUnauthorized();
        return Promise.reject(error);
      }

      if (isAuthEndpointRequest(originalRequest.url, apiBaseUrl)) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        dependencies.clearSession();
        dependencies.handleUnauthorized();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshedAccessToken = await refreshCoordinator.refreshAccessToken();
      if (!refreshedAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

      return client.request(originalRequest);
    },
  );

  return client;
};

export const apiClient = createApiClient();

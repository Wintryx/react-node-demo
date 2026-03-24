import { AuthResponse } from '@react-node-demo/shared-contracts';

import { notifyUnauthorized } from './unauthorized-handler';
import { authSessionManager } from '../../features/auth/auth-session-manager';

const AUTH_ENDPOINT_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

type RequestRefresh = () => Promise<AuthResponse>;

export interface RefreshCoordinator {
  refreshAccessToken(): Promise<string | null>;
}

export const isAuthEndpointRequest = (url: string | undefined, apiBaseUrl: string): boolean => {
  if (!url) {
    return false;
  }

  try {
    const path = new URL(url, apiBaseUrl).pathname;
    return AUTH_ENDPOINT_PATHS.has(path);
  } catch {
    return false;
  }
};

export const createRefreshCoordinator = (requestRefresh: RequestRefresh): RefreshCoordinator => {
  let inFlightRefresh: Promise<string | null> | null = null;

  const refreshOnce = async (): Promise<string | null> => {
    try {
      const response = await requestRefresh();
      authSessionManager.persist({
        accessToken: response.accessToken,
        user: response.user,
      });
      return response.accessToken;
    } catch {
      authSessionManager.clear();
      notifyUnauthorized();
      return null;
    }
  };

  return {
    refreshAccessToken: () => {
      if (!inFlightRefresh) {
        inFlightRefresh = refreshOnce().finally(() => {
          inFlightRefresh = null;
        });
      }

      return inFlightRefresh;
    },
  };
};

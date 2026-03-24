import { AuthResponse } from '@react-node-demo/shared-contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { clearAuthSessionMock, writeAuthSessionMock, notifyUnauthorizedMock } = vi.hoisted(() => ({
  clearAuthSessionMock: vi.fn(),
  writeAuthSessionMock: vi.fn(),
  notifyUnauthorizedMock: vi.fn(),
}));

vi.mock('../../features/auth/auth-storage', () => ({
  clearAuthSession: clearAuthSessionMock,
  writeAuthSession: writeAuthSessionMock,
}));

vi.mock('./unauthorized-handler', () => ({
  notifyUnauthorized: notifyUnauthorizedMock,
}));

import { createRefreshCoordinator, isAuthEndpointRequest } from './auth-refresh';

const refreshResponseFixture: AuthResponse = {
  accessToken: 'new-access-token',
  tokenType: 'Bearer',
  expiresIn: '15m',
  user: {
    id: 1,
    email: 'candidate@example.com',
    createdAt: '2026-03-16T12:00:00.000Z',
  },
};

describe('auth-refresh helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects auth endpoints correctly', () => {
    expect(isAuthEndpointRequest('/auth/login', 'http://localhost:3000')).toBe(true);
    expect(isAuthEndpointRequest('/auth/register', 'http://localhost:3000')).toBe(true);
    expect(isAuthEndpointRequest('/auth/refresh', 'http://localhost:3000')).toBe(true);
    expect(isAuthEndpointRequest('/tasks', 'http://localhost:3000')).toBe(false);
    expect(isAuthEndpointRequest(undefined, 'http://localhost:3000')).toBe(false);
  });

  it('stores refreshed session and returns access token on success', async () => {
    const requestRefreshMock = vi.fn().mockResolvedValue(refreshResponseFixture);
    const coordinator = createRefreshCoordinator(requestRefreshMock);

    const refreshedAccessToken = await coordinator.refreshAccessToken();
    expect(refreshedAccessToken).toBe('new-access-token');
    expect(requestRefreshMock).toHaveBeenCalledTimes(1);
    expect(writeAuthSessionMock).toHaveBeenCalledWith({
      accessToken: 'new-access-token',
      user: refreshResponseFixture.user,
    });
    expect(clearAuthSessionMock).not.toHaveBeenCalled();
    expect(notifyUnauthorizedMock).not.toHaveBeenCalled();
  });

  it('clears session and notifies unauthorized when refresh fails', async () => {
    const requestRefreshMock = vi.fn().mockRejectedValue(new Error('Refresh failed.'));
    const coordinator = createRefreshCoordinator(requestRefreshMock);

    const refreshedAccessToken = await coordinator.refreshAccessToken();
    expect(refreshedAccessToken).toBeNull();
    expect(requestRefreshMock).toHaveBeenCalledTimes(1);
    expect(clearAuthSessionMock).toHaveBeenCalledTimes(1);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1);
    expect(writeAuthSessionMock).not.toHaveBeenCalled();
  });

  it('runs refresh as single-flight for concurrent calls and resets after completion', async () => {
    let resolveRefresh!: (response: AuthResponse) => void;
    const requestRefreshMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<AuthResponse>((resolve) => {
            resolveRefresh = (response) => {
              resolve(response);
            };
          }),
      )
      .mockResolvedValue(refreshResponseFixture);
    const coordinator = createRefreshCoordinator(requestRefreshMock);

    const firstCall = coordinator.refreshAccessToken();
    const secondCall = coordinator.refreshAccessToken();

    expect(requestRefreshMock).toHaveBeenCalledTimes(1);
    resolveRefresh(refreshResponseFixture);

    const firstResult = await firstCall;
    const secondResult = await secondCall;
    expect(firstResult).toBe('new-access-token');
    expect(secondResult).toBe('new-access-token');

    await coordinator.refreshAccessToken();
    expect(requestRefreshMock).toHaveBeenCalledTimes(2);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './auth-context';
import { readAuthSession, writeAuthSession } from './auth-storage';
import { createAccessTokenForTest } from '../../shared/testing/auth-test-token';

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

vi.mock('../../shared/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: refreshMock,
  },
  employeesApi: {
    list: vi.fn(),
  },
  tasksApi: {
    list: vi.fn(),
    listByEmployee: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const refreshResponseFixture = {
  accessToken: 'new-access-token',
  tokenType: 'Bearer' as const,
  expiresIn: '15m',
  user: {
    id: 1,
    email: 'candidate@example.com',
    createdAt: '2026-03-16T12:00:00.000Z',
  },
};

function AuthStateProbe() {
  const { isInitializing, isAuthenticated, currentUser } = useAuth();

  return (
    <div>
      <span data-testid="is-initializing">{String(isInitializing)}</span>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="current-user-email">{currentUser?.email ?? ''}</span>
    </div>
  );
}

const renderAuthProvider = (): void => {
  render(
    <MemoryRouter future={routerFuture} initialEntries={['/app']}>
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe('AuthProvider bootstrap', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('restores auth session by calling refresh when no local session exists', async () => {
    refreshMock.mockResolvedValue(refreshResponseFixture);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('is-initializing').textContent).toBe('false');
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('current-user-email').textContent).toBe('candidate@example.com');
    expect(readAuthSession()).toEqual({
      accessToken: 'new-access-token',
      user: refreshResponseFixture.user,
    });
  });

  it('uses a still-valid local access token and skips refresh', async () => {
    const validAccessToken = createAccessTokenForTest(Math.floor(Date.now() / 1000) + 60 * 15);
    writeAuthSession({
      accessToken: validAccessToken,
      user: refreshResponseFixture.user,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('is-initializing').textContent).toBe('false');
    });

    expect(refreshMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('current-user-email').textContent).toBe('candidate@example.com');
  });

  it('clears expired local session when refresh fails', async () => {
    const expiredAccessToken = createAccessTokenForTest(Math.floor(Date.now() / 1000) - 60);
    writeAuthSession({
      accessToken: expiredAccessToken,
      user: refreshResponseFixture.user,
    });
    refreshMock.mockRejectedValue(new Error('Refresh failed.'));

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('is-initializing').textContent).toBe('false');
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('current-user-email').textContent).toBe('');
    expect(readAuthSession()).toBeNull();
  });
});

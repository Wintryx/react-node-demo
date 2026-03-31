import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './app';

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

vi.mock('../shared/api', () => ({
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

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
    refreshMock.mockRejectedValue(new Error('No active refresh session.'));
  });

  it('redirects unauthenticated users from /app to /login', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/app']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('renders register page on /register', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/register']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: 'Create account' })).toBeTruthy();
  });
});

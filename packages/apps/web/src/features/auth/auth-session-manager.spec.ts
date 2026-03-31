import { describe, expect, it, vi } from 'vitest';

import { createAuthSessionManager } from './auth-session-manager';
import { AuthSession } from './auth-storage';

const sessionFixture: AuthSession = {
  accessToken: 'access-token',
  user: {
    id: 1,
    email: 'candidate@example.com',
    createdAt: '2026-03-16T12:00:00.000Z',
  },
};

describe('auth-session-manager', () => {
  it('reads current session from underlying store', () => {
    const readMock = vi.fn((): AuthSession | null => sessionFixture);
    const manager = createAuthSessionManager({
      read: readMock,
      write: vi.fn(),
      clear: vi.fn(),
    });

    expect(manager.read()).toEqual(sessionFixture);
    expect(readMock).toHaveBeenCalledTimes(1);
  });

  it('persists session payload through underlying store and returns persisted session', () => {
    const writeMock = vi.fn();
    const manager = createAuthSessionManager({
      read: vi.fn(),
      write: writeMock,
      clear: vi.fn(),
    });

    const persisted = manager.persist({
      accessToken: sessionFixture.accessToken,
      user: sessionFixture.user,
    });

    expect(persisted).toEqual(sessionFixture);
    expect(writeMock).toHaveBeenCalledWith(sessionFixture);
  });

  it('clears underlying store session', () => {
    const clearMock = vi.fn();
    const manager = createAuthSessionManager({
      read: vi.fn(),
      write: vi.fn(),
      clear: clearMock,
    });

    manager.clear();

    expect(clearMock).toHaveBeenCalledTimes(1);
  });
});

import { clearAuthSession, readAuthSession, writeAuthSession } from './auth-storage';

describe('auth-storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('writes and reads auth session from sessionStorage', () => {
    writeAuthSession({
      accessToken: 'token-123',
      user: {
        id: 1,
        email: 'candidate@example.com',
        createdAt: '2026-03-16T12:00:00.000Z',
      },
    });

    expect(readAuthSession()).toEqual({
      accessToken: 'token-123',
      user: {
        id: 1,
        email: 'candidate@example.com',
        createdAt: '2026-03-16T12:00:00.000Z',
      },
    });
  });

  it('clears stored session', () => {
    writeAuthSession({
      accessToken: 'token-abc',
      user: {
        id: 2,
        email: 'tester@example.com',
        createdAt: '2026-03-16T12:00:00.000Z',
      },
    });

    clearAuthSession();
    expect(readAuthSession()).toBeNull();
  });
});

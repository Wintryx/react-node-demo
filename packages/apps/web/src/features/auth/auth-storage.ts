import { AuthUser } from '../../shared/api/types';

const AUTH_SESSION_STORAGE_KEY = 'task-management.auth.session';

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

const hasSessionStorage = (): boolean => typeof window !== 'undefined' && Boolean(window.sessionStorage);

export const readAuthSession = (): AuthSession | null => {
  if (!hasSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthSession;
    if (!parsed.accessToken || !parsed.user?.email) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const writeAuthSession = (session: AuthSession): void => {
  if (!hasSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = (): void => {
  if (!hasSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
};

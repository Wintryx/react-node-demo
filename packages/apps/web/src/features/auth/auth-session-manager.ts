import { AuthSession, clearAuthSession, readAuthSession, writeAuthSession } from './auth-storage';

type SessionPayload = Pick<AuthSession, 'accessToken' | 'user'>;

interface AuthSessionStore {
  read(): AuthSession | null;
  write(session: AuthSession): void;
  clear(): void;
}

export interface AuthSessionManager {
  read(): AuthSession | null;
  persist(session: SessionPayload): AuthSession;
  clear(): void;
}

export const createAuthSessionManager = (store: AuthSessionStore): AuthSessionManager => ({
  read: () => store.read(),
  persist: (session) => {
    const nextSession: AuthSession = {
      accessToken: session.accessToken,
      user: session.user,
    };
    store.write(nextSession);
    return nextSession;
  },
  clear: () => {
    store.clear();
  },
});

const authSessionStore: AuthSessionStore = {
  read: readAuthSession,
  write: writeAuthSession,
  clear: clearAuthSession,
};

export const authSessionManager = createAuthSessionManager(authSessionStore);

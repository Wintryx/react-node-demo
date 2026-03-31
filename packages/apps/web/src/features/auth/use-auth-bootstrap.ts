import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { isSessionUsable } from './auth-session';
import { authSessionManager } from './auth-session-manager';
import { AuthSession } from './auth-storage';
import { authApi } from '../../shared/api';

const persistSession = (
  setSession: Dispatch<SetStateAction<AuthSession | null>>,
  session: AuthSession,
): void => {
  const persistedSession = authSessionManager.persist(session);
  setSession(persistedSession);
};

export const useAuthBootstrap = (
  setSession: Dispatch<SetStateAction<AuthSession | null>>,
): boolean => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const bootstrapSession = async (): Promise<void> => {
      const storedSession = authSessionManager.read();

      if (isSessionUsable(storedSession)) {
        setSession(storedSession);
        setIsInitializing(false);
        return;
      }

      authSessionManager.clear();
      setSession(null);

      try {
        const refreshedSession = await authApi.refresh();
        if (isCancelled) {
          return;
        }

        persistSession(setSession, {
          accessToken: refreshedSession.accessToken,
          user: refreshedSession.user,
        });
      } catch {
        if (isCancelled) {
          return;
        }

        authSessionManager.clear();
        setSession(null);
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isCancelled = true;
    };
  }, [setSession]);

  return isInitializing;
};

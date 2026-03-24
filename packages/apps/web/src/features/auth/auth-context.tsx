import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isSessionUsable } from './auth-session';
import { AuthSession, clearAuthSession, readAuthSession, writeAuthSession } from './auth-storage';
import { authApi } from '../../shared/api';
import { AuthUser, LoginRequest, RegisterRequest } from '../../shared/api/types';
import { setUnauthorizedHandler } from '../../shared/api/unauthorized-handler';

interface AuthContextValue {
  accessToken: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login(payload: LoginRequest): Promise<void>;
  register(payload: RegisterRequest): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());
  const [isInitializing, setIsInitializing] = useState(true);

  const persistSession = (nextSession: AuthSession): void => {
    writeAuthSession(nextSession);
    setSession(nextSession);
  };

  useEffect(() => {
    let isCancelled = false;

    const bootstrapSession = async (): Promise<void> => {
      const storedSession = readAuthSession();

      if (isSessionUsable(storedSession)) {
        setSession(storedSession);
        setIsInitializing(false);
        return;
      }

      clearAuthSession();
      setSession(null);

      try {
        const refreshedSession = await authApi.refresh();
        if (isCancelled) {
          return;
        }

        persistSession({
          accessToken: refreshedSession.accessToken,
          user: refreshedSession.user,
        });
      } catch {
        if (isCancelled) {
          return;
        }

        clearAuthSession();
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
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
      setSession(null);

      if (location.pathname === '/login' || location.pathname === '/register') {
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          from: location.pathname,
        },
      });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [location.pathname, navigate]);

  const login = async (payload: LoginRequest): Promise<void> => {
    const response = await authApi.login(payload);
    persistSession({
      accessToken: response.accessToken,
      user: response.user,
    });
  };

  const register = async (payload: RegisterRequest): Promise<void> => {
    const response = await authApi.register(payload);
    persistSession({
      accessToken: response.accessToken,
      user: response.user,
    });
  };

  const logout = (): void => {
    void authApi.logout().catch(() => undefined);
    clearAuthSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: session?.accessToken ?? null,
        currentUser: session?.user ?? null,
        isAuthenticated: Boolean(session?.accessToken),
        isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
};

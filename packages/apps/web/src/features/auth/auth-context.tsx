import { createContext, type ReactNode, useContext, useState } from 'react';

import { authSessionManager } from './auth-session-manager';
import { AuthSession } from './auth-storage';
import { useAuthBootstrap } from './use-auth-bootstrap';
import { useUnauthorizedRedirect } from './use-unauthorized-redirect';
import { authApi } from '../../shared/api';
import { AuthUser, LoginRequest, RegisterRequest } from '../../shared/api/types';

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
  const [session, setSession] = useState<AuthSession | null>(() => authSessionManager.read());
  const isInitializing = useAuthBootstrap(setSession);

  const persistSession = (nextSession: Pick<AuthSession, 'accessToken' | 'user'>): void => {
    setSession(authSessionManager.persist(nextSession));
  };

  useUnauthorizedRedirect(setSession);

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
    authSessionManager.clear();
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

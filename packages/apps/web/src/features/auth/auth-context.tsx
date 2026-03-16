import { createContext, type ReactNode, useContext, useState } from 'react';

import { AuthSession, clearAuthSession, readAuthSession, writeAuthSession } from './auth-storage';
import { authApi } from '../../shared/api/api-client';
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
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  const persistSession = (nextSession: AuthSession): void => {
    writeAuthSession(nextSession);
    setSession(nextSession);
  };

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
    clearAuthSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: session?.accessToken ?? null,
        currentUser: session?.user ?? null,
        isAuthenticated: Boolean(session?.accessToken),
        isInitializing: false,
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

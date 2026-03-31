import { AuthRefreshSession, CreateAuthUserInput, AuthUser } from './auth.model';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  findById(userId: number): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  create(input: CreateAuthUserInput): Promise<AuthUser>;
  updateRefreshToken(userId: number, refreshTokenHash: string, refreshTokenExpiresAt: Date): Promise<void>;
  clearRefreshToken(userId: number): Promise<void>;
  createRefreshSession(
    userId: number,
    sessionId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void>;
  findActiveRefreshSession(userId: number, sessionId: string): Promise<AuthRefreshSession | null>;
  revokeRefreshSession(userId: number, sessionId: string): Promise<void>;
  revokeAllRefreshSessions(userId: number): Promise<void>;
}

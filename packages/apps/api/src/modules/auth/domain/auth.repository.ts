import { CreateAuthUserInput, AuthUser } from './auth.model';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  findById(userId: number): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  create(input: CreateAuthUserInput): Promise<AuthUser>;
  updateRefreshToken(userId: number, refreshTokenHash: string, refreshTokenExpiresAt: Date): Promise<void>;
  clearRefreshToken(userId: number): Promise<void>;
}

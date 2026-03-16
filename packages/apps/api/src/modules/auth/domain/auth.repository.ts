import { CreateAuthUserInput, AuthUser } from './auth.model';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  create(input: CreateAuthUserInput): Promise<AuthUser>;
}

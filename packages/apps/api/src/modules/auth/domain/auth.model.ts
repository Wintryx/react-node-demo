export interface AuthUser {
  id: number;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  refreshTokenExpiresAt: Date | null;
  createdAt: Date;
}

export interface CreateAuthUserInput {
  email: string;
  passwordHash: string;
}

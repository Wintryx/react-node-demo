export interface AuthUser {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface AuthRefreshSession {
  sessionId: string;
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthUserInput {
  email: string;
  passwordHash: string;
}

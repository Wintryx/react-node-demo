import { AccessTokenPayload, AccessTokenResult, AccessTokenSigner } from '../../domain/access-token-signer';
import { AuthRefreshSession, AuthUser, CreateAuthUserInput } from '../../domain/auth.model';
import { AuthRepository } from '../../domain/auth.repository';
import { PasswordHasher } from '../../domain/password-hasher';
import {
  RefreshTokenPayload,
  RefreshTokenResult,
  RefreshTokenSigner,
} from '../../domain/refresh-token-signer';

export class InMemoryAuthRepository implements AuthRepository {
  private readonly users: AuthUser[] = [];
  private readonly refreshSessions: AuthRefreshSession[] = [];
  private nextId = 1;

  async findById(userId: number): Promise<AuthUser | null> {
    return this.users.find((user) => user.id === userId) ?? null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const user: AuthUser = {
      id: this.nextId++,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async createRefreshSession(
    userId: number,
    sessionId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    this.refreshSessions.push({
      sessionId,
      userId,
      refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findActiveRefreshSession(
    userId: number,
    sessionId: string,
  ): Promise<AuthRefreshSession | null> {
    return (
      this.refreshSessions.find(
        (session) => session.userId === userId && session.sessionId === sessionId && !session.revokedAt,
      ) ?? null
    );
  }

  async revokeRefreshSession(userId: number, sessionId: string): Promise<void> {
    const session = this.refreshSessions.find(
      (entry) => entry.userId === userId && entry.sessionId === sessionId && !entry.revokedAt,
    );
    if (!session) {
      return;
    }

    session.revokedAt = new Date();
    session.updatedAt = new Date();
  }

  async revokeAllRefreshSessions(userId: number): Promise<void> {
    const now = new Date();
    this.refreshSessions.forEach((session) => {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = now;
        session.updatedAt = now;
      }
    });
  }
}

export class FakePasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return `hashed::${value}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return hashedValue === `hashed::${value}`;
  }
}

export class FakeAccessTokenSigner implements AccessTokenSigner {
  async sign(payload: AccessTokenPayload): Promise<AccessTokenResult> {
    return {
      accessToken: `token-for-${payload.sub}`,
      expiresIn: '15m',
    };
  }
}

export class FakeRefreshTokenSigner implements RefreshTokenSigner {
  private sequence = 0;

  async sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult> {
    this.sequence += 1;
    const sessionId = `session-for-${payload.sub}-${this.sequence}`;
    return {
      refreshToken: `refresh-token-for-${payload.sub}:${payload.email}:${sessionId}`,
      expiresIn: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sessionId,
    };
  }

  async verify(refreshToken: string): Promise<RefreshTokenPayload | null> {
    const match = /^refresh-token-for-(\d+):(.+?):(session-for-\d+-\d+)$/.exec(refreshToken);
    if (!match) {
      return null;
    }

    return {
      sub: Number(match[1]),
      email: match[2],
      jti: match[3],
    };
  }
}

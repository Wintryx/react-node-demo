import { AccessTokenPayload, AccessTokenResult, AccessTokenSigner } from '../../domain/access-token-signer';
import { AuthUser, CreateAuthUserInput } from '../../domain/auth.model';
import { AuthRepository } from '../../domain/auth.repository';
import { PasswordHasher } from '../../domain/password-hasher';
import {
  RefreshTokenPayload,
  RefreshTokenResult,
  RefreshTokenSigner,
} from '../../domain/refresh-token-signer';

export class InMemoryAuthRepository implements AuthRepository {
  private readonly users: AuthUser[] = [];
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
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updateRefreshToken(
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    const user = this.users.find((entry) => entry.id === userId);
    if (!user) {
      return;
    }

    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
  }

  async clearRefreshToken(userId: number): Promise<void> {
    const user = this.users.find((entry) => entry.id === userId);
    if (!user) {
      return;
    }

    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
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
  async sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult> {
    return {
      refreshToken: `refresh-token-for-${payload.sub}:${payload.email}`,
      expiresIn: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async verify(refreshToken: string): Promise<RefreshTokenPayload | null> {
    const match = /^refresh-token-for-(\d+):(.+)$/.exec(refreshToken);
    if (!match) {
      return null;
    }

    return {
      sub: Number(match[1]),
      email: match[2],
    };
  }
}

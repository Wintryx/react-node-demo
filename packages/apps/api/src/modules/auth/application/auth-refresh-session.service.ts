import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { AuthUser } from '../domain/auth.model';
import { AUTH_REPOSITORY, AuthRepository } from '../domain/auth.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/password-hasher';
import { REFRESH_TOKEN_SIGNER, RefreshTokenSigner } from '../domain/refresh-token-signer';

interface UserIdentity {
  id: number;
  email: string;
}

interface ResolvedRefreshSession {
  user: AuthUser;
  sessionId: string;
}

interface RefreshTokenIssue {
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class AuthRefreshSessionService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(REFRESH_TOKEN_SIGNER)
    private readonly refreshTokenSigner: RefreshTokenSigner,
  ) {}

  async issueForUser(user: UserIdentity): Promise<RefreshTokenIssue> {
    const tokenResult = await this.refreshTokenSigner.sign({
      sub: user.id,
      email: user.email,
    });
    const refreshTokenHash = await this.passwordHasher.hash(
      this.toRefreshTokenHashInput(tokenResult.refreshToken),
    );
    await this.authRepository.createRefreshSession(
      user.id,
      tokenResult.sessionId,
      refreshTokenHash,
      tokenResult.expiresAt,
    );

    return {
      refreshToken: tokenResult.refreshToken,
      expiresAt: tokenResult.expiresAt,
    };
  }

  async resolveUserByRefreshToken(refreshToken: string): Promise<AuthUser | null> {
    const refreshSession = await this.resolveRefreshSession(refreshToken);
    return refreshSession?.user ?? null;
  }

  async resolveRefreshSession(refreshToken: string): Promise<ResolvedRefreshSession | null> {
    const payload = await this.refreshTokenSigner.verify(refreshToken);
    if (!payload || !payload.jti) {
      return null;
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      return null;
    }

    const activeSession = await this.authRepository.findActiveRefreshSession(user.id, payload.jti);
    if (!activeSession) {
      return null;
    }

    if (activeSession.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const tokenMatches = await this.passwordHasher.compare(
      this.toRefreshTokenHashInput(refreshToken),
      activeSession.refreshTokenHash,
    );
    if (!tokenMatches) {
      return null;
    }

    return {
      user,
      sessionId: activeSession.sessionId,
    };
  }

  async revokeRefreshSession(userId: number, sessionId: string): Promise<void> {
    await this.authRepository.revokeRefreshSession(userId, sessionId);
  }

  async clearForUser(userId: number): Promise<void> {
    await this.authRepository.revokeAllRefreshSessions(userId);
  }

  private toRefreshTokenHashInput(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}

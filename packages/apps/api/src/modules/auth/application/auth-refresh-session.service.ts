import { Inject, Injectable } from '@nestjs/common';

import { AuthUser } from '../domain/auth.model';
import { AUTH_REPOSITORY, AuthRepository } from '../domain/auth.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/password-hasher';
import { REFRESH_TOKEN_SIGNER, RefreshTokenSigner } from '../domain/refresh-token-signer';

interface UserIdentity {
  id: number;
  email: string;
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
    const refreshTokenHash = await this.passwordHasher.hash(tokenResult.refreshToken);

    await this.authRepository.updateRefreshToken(user.id, refreshTokenHash, tokenResult.expiresAt);

    return {
      refreshToken: tokenResult.refreshToken,
      expiresAt: tokenResult.expiresAt,
    };
  }

  async resolveUserByRefreshToken(refreshToken: string): Promise<AuthUser | null> {
    const payload = await this.refreshTokenSigner.verify(refreshToken);
    if (!payload) {
      return null;
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      return null;
    }

    if (user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      return null;
    }

    const tokenMatches = await this.passwordHasher.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      return null;
    }

    return user;
  }

  async clearForUser(userId: number): Promise<void> {
    await this.authRepository.clearRefreshToken(userId);
  }
}

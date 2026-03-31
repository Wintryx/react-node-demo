import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { AuthResponse, toAuthResponse } from './auth-response.mapper';
import { ApiErrorCode, createApiErrorPayload } from '../../../shared/errors';
import { ACCESS_TOKEN_SIGNER, AccessTokenSigner } from '../domain/access-token-signer';

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly authRefreshSessionService: AuthRefreshSessionService,
    @Inject(ACCESS_TOKEN_SIGNER)
    private readonly accessTokenSigner: AccessTokenSigner,
  ) {}

  async execute(refreshToken: string | undefined): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        createApiErrorPayload(
          ApiErrorCode.AUTH_REFRESH_TOKEN_INVALID,
          'Refresh token is missing or invalid.',
        ),
      );
    }

    const refreshSession = await this.authRefreshSessionService.resolveRefreshSession(refreshToken);
    if (!refreshSession) {
      throw new UnauthorizedException(
        createApiErrorPayload(
          ApiErrorCode.AUTH_REFRESH_TOKEN_INVALID,
          'Refresh token is missing or invalid.',
        ),
      );
    }

    await this.authRefreshSessionService.revokeRefreshSession(
      refreshSession.user.id,
      refreshSession.sessionId,
    );

    const accessToken = await this.accessTokenSigner.sign({
      sub: refreshSession.user.id,
      email: refreshSession.user.email,
    });

    return toAuthResponse(refreshSession.user, accessToken);
  }
}

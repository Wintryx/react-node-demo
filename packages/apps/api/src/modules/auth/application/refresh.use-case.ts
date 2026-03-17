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

    const user = await this.authRefreshSessionService.resolveUserByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException(
        createApiErrorPayload(
          ApiErrorCode.AUTH_REFRESH_TOKEN_INVALID,
          'Refresh token is missing or invalid.',
        ),
      );
    }

    const accessToken = await this.accessTokenSigner.sign({
      sub: user.id,
      email: user.email,
    });

    return toAuthResponse(user, accessToken);
  }
}

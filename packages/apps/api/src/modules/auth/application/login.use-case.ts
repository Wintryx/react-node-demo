import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthResponse, toAuthResponse } from './auth-response.mapper';
import { ApiErrorCode } from '../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../shared/errors/api-error.helpers';
import { ACCESS_TOKEN_SIGNER, AccessTokenSigner } from '../domain/access-token-signer';
import { AUTH_REPOSITORY, AuthRepository } from '../domain/auth.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/password-hasher';

export interface LoginInput {
  email: string;
  password: string;
}

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(ACCESS_TOKEN_SIGNER)
    private readonly accessTokenSigner: AccessTokenSigner,
  ) {}

  async execute(input: LoginInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findByEmail(normalizedEmail);

    if (!existingUser) {
      throw new UnauthorizedException(
        createApiErrorPayload(ApiErrorCode.AUTH_INVALID_CREDENTIALS, INVALID_CREDENTIALS_MESSAGE),
      );
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, existingUser.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException(
        createApiErrorPayload(ApiErrorCode.AUTH_INVALID_CREDENTIALS, INVALID_CREDENTIALS_MESSAGE),
      );
    }

    const accessToken = await this.accessTokenSigner.sign({
      sub: existingUser.id,
      email: existingUser.email,
    });

    return toAuthResponse(existingUser, accessToken);
  }
}

import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { AuthResponse, toAuthResponse } from './auth-response.mapper';
import { ApiErrorCode } from '../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../shared/errors/api-error.helpers';
import { ACCESS_TOKEN_SIGNER, AccessTokenSigner } from '../domain/access-token-signer';
import { AUTH_REPOSITORY, AuthRepository } from '../domain/auth.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/password-hasher';

export interface RegisterInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(ACCESS_TOKEN_SIGNER)
    private readonly accessTokenSigner: AccessTokenSigner,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException(
        createApiErrorPayload(
          ApiErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
          `User with email "${normalizedEmail}" already exists.`,
          { email: normalizedEmail },
        ),
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const createdUser = await this.authRepository.create({
      email: normalizedEmail,
      passwordHash,
    });

    const accessToken = await this.accessTokenSigner.sign({
      sub: createdUser.id,
      email: createdUser.email,
    });

    return toAuthResponse(createdUser, accessToken);
  }
}

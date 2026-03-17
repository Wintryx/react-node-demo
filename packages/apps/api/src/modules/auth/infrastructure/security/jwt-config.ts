import { ConfigService } from '@nestjs/config';

const MIN_SECRET_LENGTH = 32;

/**
 * Reads and validates JWT secret configuration.
 * Fails fast to avoid starting the API with weak/missing token signing config.
 */
export const getJwtAccessTokenSecret = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
  const normalizedSecret = secret?.trim();

  if (!normalizedSecret) {
    throw new Error(
      'JWT_ACCESS_TOKEN_SECRET is required and must be configured before starting the API.',
    );
  }

  if (normalizedSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_ACCESS_TOKEN_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`,
    );
  }

  return normalizedSecret;
};

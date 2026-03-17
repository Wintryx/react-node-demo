import { ConfigService } from '@nestjs/config';

const MIN_SECRET_LENGTH = 32;

/**
 * Reads and validates JWT secret configuration.
 * Fails fast to avoid starting the API with weak/missing token signing config.
 */
export const getJwtAccessTokenSecret = (configService: ConfigService): string => {
  return getRequiredJwtSecret(configService, 'JWT_ACCESS_TOKEN_SECRET');
};

export const getJwtRefreshTokenSecret = (configService: ConfigService): string => {
  return getRequiredJwtSecret(configService, 'JWT_REFRESH_TOKEN_SECRET');
};

const getRequiredJwtSecret = (configService: ConfigService, key: string): string => {
  const secret = configService.get<string>(key);
  const normalizedSecret = secret?.trim();

  if (!normalizedSecret) {
    throw new Error(`${key} is required and must be configured before starting the API.`);
  }

  if (normalizedSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`${key} must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }

  return normalizedSecret;
};

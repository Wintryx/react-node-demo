import { ConfigService } from '@nestjs/config';

import { getJwtAccessTokenSecret, getJwtRefreshTokenSecret } from './jwt-config';

const createConfigService = (
  accessTokenSecret: string | undefined,
  refreshTokenSecret?: string | undefined,
): ConfigService =>
  ({
    get: <T>(key: string): T | undefined =>
      key === 'JWT_ACCESS_TOKEN_SECRET'
        ? (accessTokenSecret as T | undefined)
        : key === 'JWT_REFRESH_TOKEN_SECRET'
          ? (refreshTokenSecret as T | undefined)
          : undefined,
  }) as ConfigService;

describe('jwt-config', () => {
  it('throws when JWT_ACCESS_TOKEN_SECRET is missing', () => {
    const configService = createConfigService(undefined);

    expect(() => getJwtAccessTokenSecret(configService)).toThrow(
      'JWT_ACCESS_TOKEN_SECRET is required and must be configured before starting the API.',
    );
  });

  it('throws when JWT_ACCESS_TOKEN_SECRET is blank', () => {
    const configService = createConfigService('   ');

    expect(() => getJwtAccessTokenSecret(configService)).toThrow(
      'JWT_ACCESS_TOKEN_SECRET is required and must be configured before starting the API.',
    );
  });

  it('throws when JWT_ACCESS_TOKEN_SECRET is too short', () => {
    const configService = createConfigService('short-secret');

    expect(() => getJwtAccessTokenSecret(configService)).toThrow(
      'JWT_ACCESS_TOKEN_SECRET must be at least 32 characters long.',
    );
  });

  it('returns normalized secret when valid', () => {
    const validSecret = '  this-is-a-valid-demo-jwt-secret-2026  ';
    const configService = createConfigService(validSecret);

    expect(getJwtAccessTokenSecret(configService)).toBe('this-is-a-valid-demo-jwt-secret-2026');
  });

  it('throws when JWT_REFRESH_TOKEN_SECRET is missing', () => {
    const configService = createConfigService('this-is-a-valid-demo-jwt-secret-2026', undefined);

    expect(() => getJwtRefreshTokenSecret(configService)).toThrow(
      'JWT_REFRESH_TOKEN_SECRET is required and must be configured before starting the API.',
    );
  });

  it('throws when JWT_REFRESH_TOKEN_SECRET is too short', () => {
    const configService = createConfigService('this-is-a-valid-demo-jwt-secret-2026', 'short');

    expect(() => getJwtRefreshTokenSecret(configService)).toThrow(
      'JWT_REFRESH_TOKEN_SECRET must be at least 32 characters long.',
    );
  });

  it('returns normalized refresh secret when valid', () => {
    const configService = createConfigService(
      'this-is-a-valid-demo-jwt-secret-2026',
      '  this-is-a-valid-demo-refresh-jwt-secret-2026  ',
    );

    expect(getJwtRefreshTokenSecret(configService)).toBe(
      'this-is-a-valid-demo-refresh-jwt-secret-2026',
    );
  });
});

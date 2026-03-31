import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtRefreshTokenSigner } from './jwt-refresh-token-signer';

const createConfigService = (): ConfigService =>
  ({
    get: <T>(key: string): T | undefined => {
      if (key === 'JWT_REFRESH_TOKEN_SECRET') {
        return 'this-is-a-valid-demo-refresh-jwt-secret-2026' as T;
      }
      if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') {
        return '7d' as T;
      }
      return undefined;
    },
  }) as ConfigService;

describe('JwtRefreshTokenSigner', () => {
  it('issues unique refresh tokens for repeated sign calls with the same payload', async () => {
    const signer = new JwtRefreshTokenSigner(new JwtService({}), createConfigService());
    const payload = {
      sub: 42,
      email: 'candidate@example.com',
    };

    const first = await signer.sign(payload);
    const second = await signer.sign(payload);

    expect(first.refreshToken).not.toBe(second.refreshToken);
    await expect(signer.verify(first.refreshToken)).resolves.toMatchObject(payload);
    await expect(signer.verify(second.refreshToken)).resolves.toMatchObject(payload);
    expect(first.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(second.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { InMemoryAuthRepository } from './test-helpers/auth-test-doubles';
import {
  RefreshTokenPayload,
  RefreshTokenResult,
  RefreshTokenSigner,
} from '../domain/refresh-token-signer';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';

class SequentialLongRefreshTokenSigner implements RefreshTokenSigner {
  private readonly payloadByToken = new Map<string, RefreshTokenPayload>();
  private sequence = 0;

  async sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult> {
    this.sequence += 1;
    const sharedPrefix = 'x'.repeat(72);
    const refreshToken = `${sharedPrefix}-${payload.sub}-${this.sequence}`;
    this.payloadByToken.set(refreshToken, payload);

    return {
      refreshToken,
      expiresIn: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async verify(refreshToken: string): Promise<RefreshTokenPayload | null> {
    return this.payloadByToken.get(refreshToken) ?? null;
  }
}

describe('AuthRefreshSessionService', () => {
  it('invalidates previous refresh token after issuing a new one, even for long token strings', async () => {
    const repository = new InMemoryAuthRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const refreshTokenSigner = new SequentialLongRefreshTokenSigner();
    const service = new AuthRefreshSessionService(repository, passwordHasher, refreshTokenSigner);

    const user = await repository.create({
      email: 'candidate@example.com',
      passwordHash: await passwordHasher.hash('StrongPassword!1'),
    });

    const firstIssue = await service.issueForUser({
      id: user.id,
      email: user.email,
    });
    const secondIssue = await service.issueForUser({
      id: user.id,
      email: user.email,
    });

    await expect(service.resolveUserByRefreshToken(firstIssue.refreshToken)).resolves.toBeNull();
    await expect(service.resolveUserByRefreshToken(secondIssue.refreshToken)).resolves.toMatchObject({
      id: user.id,
      email: user.email,
    });
  });
});

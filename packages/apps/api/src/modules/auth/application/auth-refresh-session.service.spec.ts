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
    const sessionId = `session-${payload.sub}-${this.sequence}`;
    const refreshToken = `${sharedPrefix}-${payload.sub}-${this.sequence}-${sessionId}`;
    this.payloadByToken.set(refreshToken, payload);

    return {
      refreshToken,
      expiresIn: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sessionId,
    };
  }

  async verify(refreshToken: string): Promise<RefreshTokenPayload | null> {
    const payload = this.payloadByToken.get(refreshToken);
    if (!payload) {
      return null;
    }

    const sessionId = refreshToken.split('-').slice(-3).join('-');
    return {
      ...payload,
      jti: sessionId,
    };
  }
}

describe('AuthRefreshSessionService', () => {
  it('supports parallel refresh sessions and revokes a selected session, even for long token strings', async () => {
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

    await expect(service.resolveUserByRefreshToken(firstIssue.refreshToken)).resolves.toMatchObject({
      id: user.id,
      email: user.email,
    });
    await expect(service.resolveUserByRefreshToken(secondIssue.refreshToken)).resolves.toMatchObject({
      id: user.id,
      email: user.email,
    });

    const firstSession = await service.resolveRefreshSession(firstIssue.refreshToken);
    expect(firstSession).not.toBeNull();
    if (!firstSession) {
      throw new Error('Expected refresh session for first token.');
    }

    await service.revokeRefreshSession(firstSession.user.id, firstSession.sessionId);

    await expect(service.resolveUserByRefreshToken(firstIssue.refreshToken)).resolves.toBeNull();
    await expect(service.resolveUserByRefreshToken(secondIssue.refreshToken)).resolves.toMatchObject({
      id: user.id,
      email: user.email,
    });
  });
});

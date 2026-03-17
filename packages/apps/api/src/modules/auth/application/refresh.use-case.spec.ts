import { UnauthorizedException } from '@nestjs/common';

import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { RefreshUseCase } from './refresh.use-case';
import {
  FakeAccessTokenSigner,
  FakePasswordHasher,
  FakeRefreshTokenSigner,
  InMemoryAuthRepository,
} from './test-helpers/auth-test-doubles';

describe('RefreshUseCase', () => {
  it('returns a new access token for a valid refresh token', async () => {
    const repository = new InMemoryAuthRepository();
    const passwordHasher = new FakePasswordHasher();
    const refreshTokenSigner = new FakeRefreshTokenSigner();
    const refreshSessionService = new AuthRefreshSessionService(
      repository,
      passwordHasher,
      refreshTokenSigner,
    );
    const user = await repository.create({
      email: 'demo@example.com',
      passwordHash: await passwordHasher.hash('StrongPassword!1'),
    });
    const refreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });

    const useCase = new RefreshUseCase(refreshSessionService, new FakeAccessTokenSigner());

    const result = await useCase.execute(refreshIssue.refreshToken);

    expect(result.accessToken).toBe(`token-for-${user.id}`);
    expect(result.user.email).toBe(user.email);
  });

  it('throws UnauthorizedException for missing token', async () => {
    const useCase = new RefreshUseCase(
      new AuthRefreshSessionService(
        new InMemoryAuthRepository(),
        new FakePasswordHasher(),
        new FakeRefreshTokenSigner(),
      ),
      new FakeAccessTokenSigner(),
    );

    await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException for invalid token', async () => {
    const useCase = new RefreshUseCase(
      new AuthRefreshSessionService(
        new InMemoryAuthRepository(),
        new FakePasswordHasher(),
        new FakeRefreshTokenSigner(),
      ),
      new FakeAccessTokenSigner(),
    );

    await expect(useCase.execute('invalid-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

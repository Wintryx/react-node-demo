import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { LogoutUseCase } from './logout.use-case';
import {
  FakePasswordHasher,
  FakeRefreshTokenSigner,
  InMemoryAuthRepository,
} from './test-helpers/auth-test-doubles';

describe('LogoutUseCase', () => {
  it('clears persisted refresh token for valid refresh token', async () => {
    const repository = new InMemoryAuthRepository();
    const passwordHasher = new FakePasswordHasher();
    const refreshSessionService = new AuthRefreshSessionService(
      repository,
      passwordHasher,
      new FakeRefreshTokenSigner(),
    );
    const user = await repository.create({
      email: 'demo@example.com',
      passwordHash: await passwordHasher.hash('StrongPassword!1'),
    });
    const refreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });
    const useCase = new LogoutUseCase(refreshSessionService);

    await useCase.execute(refreshIssue.refreshToken);

    const persisted = await repository.findById(user.id);
    expect(persisted?.refreshTokenHash).toBeNull();
    expect(persisted?.refreshTokenExpiresAt).toBeNull();
  });

  it('silently succeeds when token is missing', async () => {
    const useCase = new LogoutUseCase(
      new AuthRefreshSessionService(
        new InMemoryAuthRepository(),
        new FakePasswordHasher(),
        new FakeRefreshTokenSigner(),
      ),
    );

    await expect(useCase.execute(undefined)).resolves.toBeUndefined();
  });
});

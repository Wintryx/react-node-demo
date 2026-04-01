import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { LogoutUseCase } from './logout.use-case';
import {
  FakePasswordHasher,
  FakeRefreshTokenSigner,
  InMemoryAuthRepository,
} from './test-helpers/auth-test-doubles';

describe('LogoutUseCase', () => {
  it('revokes only the current refresh session for valid refresh token', async () => {
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
    const firstRefreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });
    const secondRefreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });
    const useCase = new LogoutUseCase(refreshSessionService);

    await useCase.execute(firstRefreshIssue.refreshToken);

    await expect(
      refreshSessionService.resolveUserByRefreshToken(firstRefreshIssue.refreshToken),
    ).resolves.toBeNull();
    await expect(
      refreshSessionService.resolveUserByRefreshToken(secondRefreshIssue.refreshToken),
    ).resolves.toMatchObject({
      id: user.id,
      email: user.email,
    });
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

  it('revokes all user sessions when executeAll is called', async () => {
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
    const firstRefreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });
    const secondRefreshIssue = await refreshSessionService.issueForUser({
      id: user.id,
      email: user.email,
    });
    const useCase = new LogoutUseCase(refreshSessionService);

    await useCase.executeAll(secondRefreshIssue.refreshToken);

    await expect(
      refreshSessionService.resolveUserByRefreshToken(firstRefreshIssue.refreshToken),
    ).resolves.toBeNull();
    await expect(
      refreshSessionService.resolveUserByRefreshToken(secondRefreshIssue.refreshToken),
    ).resolves.toBeNull();
  });
});

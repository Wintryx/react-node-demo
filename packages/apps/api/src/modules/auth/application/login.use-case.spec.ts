import { UnauthorizedException } from '@nestjs/common';

import { LoginUseCase } from './login.use-case';
import {
  FakeAccessTokenSigner,
  FakePasswordHasher,
  InMemoryAuthRepository,
} from './test-helpers/auth-test-doubles';

describe('LoginUseCase', () => {
  it('returns an access token for valid credentials', async () => {
    const repository = new InMemoryAuthRepository();
    const hasher = new FakePasswordHasher();
    await repository.create({
      email: 'demo@example.com',
      passwordHash: await hasher.hash('StrongPassword!1'),
    });

    const useCase = new LoginUseCase(repository, hasher, new FakeAccessTokenSigner());

    const result = await useCase.execute({
      email: 'DEMO@EXAMPLE.COM',
      password: 'StrongPassword!1',
    });

    expect(result.accessToken).toBe('token-for-1');
    expect(result.user.email).toBe('demo@example.com');
  });

  it('throws UnauthorizedException for unknown user', async () => {
    const useCase = new LoginUseCase(
      new InMemoryAuthRepository(),
      new FakePasswordHasher(),
      new FakeAccessTokenSigner(),
    );

    await expect(
      useCase.execute({
        email: 'missing@example.com',
        password: 'StrongPassword!1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException for invalid password', async () => {
    const repository = new InMemoryAuthRepository();
    const hasher = new FakePasswordHasher();
    await repository.create({
      email: 'demo@example.com',
      passwordHash: await hasher.hash('StrongPassword!1'),
    });
    const useCase = new LoginUseCase(repository, hasher, new FakeAccessTokenSigner());

    await expect(
      useCase.execute({
        email: 'demo@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

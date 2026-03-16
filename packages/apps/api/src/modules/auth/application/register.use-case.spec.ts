import { ConflictException } from '@nestjs/common';

import { RegisterUseCase } from './register.use-case';
import {
  FakeAccessTokenSigner,
  FakePasswordHasher,
  InMemoryAuthRepository,
} from './test-helpers/auth-test-doubles';

describe('RegisterUseCase', () => {
  it('registers a user with normalized email and returns token payload', async () => {
    const repository = new InMemoryAuthRepository();
    const useCase = new RegisterUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeAccessTokenSigner(),
    );

    const result = await useCase.execute({
      email: '  Arne.Winter@Example.com ',
      password: 'StrongPassword!1',
    });

    expect(result.user.email).toBe('arne.winter@example.com');
    expect(result.accessToken).toBe('token-for-1');

    const storedUser = await repository.findByEmail('arne.winter@example.com');
    expect(storedUser?.passwordHash).toBe('hashed::StrongPassword!1');
  });

  it('throws conflict when email already exists', async () => {
    const repository = new InMemoryAuthRepository();
    const useCase = new RegisterUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeAccessTokenSigner(),
    );

    await useCase.execute({
      email: 'user@example.com',
      password: 'StrongPassword!1',
    });

    await expect(
      useCase.execute({
        email: 'USER@example.com',
        password: 'StrongPassword!2',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

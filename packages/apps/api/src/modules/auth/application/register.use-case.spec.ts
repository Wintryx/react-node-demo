import { ConflictException } from '@nestjs/common';

import { RegisterUseCase } from './register.use-case';
import { AccessTokenPayload, AccessTokenResult, AccessTokenSigner } from '../domain/access-token-signer';
import { AuthUser, CreateAuthUserInput } from '../domain/auth.model';
import { AuthRepository } from '../domain/auth.repository';
import { PasswordHasher } from '../domain/password-hasher';

class InMemoryAuthRepository implements AuthRepository {
  private readonly users: AuthUser[] = [];
  private nextId = 1;

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const createdUser: AuthUser = {
      id: this.nextId++,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    };

    this.users.push(createdUser);
    return createdUser;
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return `hashed::${value}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return hashedValue === `hashed::${value}`;
  }
}

class FakeAccessTokenSigner implements AccessTokenSigner {
  async sign(payload: AccessTokenPayload): Promise<AccessTokenResult> {
    return {
      accessToken: `token-for-${payload.sub}`,
      expiresIn: '15m',
    };
  }
}

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

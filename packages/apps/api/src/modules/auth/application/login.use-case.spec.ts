import { UnauthorizedException } from '@nestjs/common';

import { LoginUseCase } from './login.use-case';
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
    const user: AuthUser = {
      id: this.nextId++,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
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

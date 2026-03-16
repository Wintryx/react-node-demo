import { AccessTokenPayload, AccessTokenResult, AccessTokenSigner } from '../../domain/access-token-signer';
import { AuthUser, CreateAuthUserInput } from '../../domain/auth.model';
import { AuthRepository } from '../../domain/auth.repository';
import { PasswordHasher } from '../../domain/password-hasher';

export class InMemoryAuthRepository implements AuthRepository {
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

export class FakePasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return `hashed::${value}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return hashedValue === `hashed::${value}`;
  }
}

export class FakeAccessTokenSigner implements AccessTokenSigner {
  async sign(payload: AccessTokenPayload): Promise<AccessTokenResult> {
    return {
      accessToken: `token-for-${payload.sub}`,
      expiresIn: '15m',
    };
  }
}

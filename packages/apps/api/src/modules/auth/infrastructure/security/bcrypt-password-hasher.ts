import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { PasswordHasher } from '../../domain/password-hasher';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 12;

  async hash(value: string): Promise<string> {
    return hash(value, this.rounds);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return compare(value, hashedValue);
  }
}

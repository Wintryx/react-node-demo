import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUserOrmEntity } from './auth-user.orm-entity';
import { CreateAuthUserInput, AuthUser } from '../../domain/auth.model';
import { AuthRepository } from '../../domain/auth.repository';

@Injectable()
export class TypeOrmAuthRepository implements AuthRepository {
  constructor(
    @InjectRepository(AuthUserOrmEntity)
    private readonly repository: Repository<AuthUserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({
      where: {
        email,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const entity = this.repository.create(input);
    const savedEntity = await this.repository.save(entity);
    return this.toDomainModel(savedEntity);
  }

  private toDomainModel(entity: AuthUserOrmEntity): AuthUser {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      createdAt: entity.createdAt,
    };
  }
}

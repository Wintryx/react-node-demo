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

  async findById(userId: number): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({
      where: {
        id: userId,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

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

  async updateRefreshToken(
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        refreshTokenHash,
        refreshTokenExpiresAt,
      },
    );
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    );
  }

  private toDomainModel(entity: AuthUserOrmEntity): AuthUser {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      refreshTokenHash: entity.refreshTokenHash,
      refreshTokenExpiresAt: entity.refreshTokenExpiresAt,
      createdAt: entity.createdAt,
    };
  }
}

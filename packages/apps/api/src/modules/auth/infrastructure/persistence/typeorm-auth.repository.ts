import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { AuthRefreshSessionOrmEntity } from './auth-refresh-session.orm-entity';
import { AuthUserOrmEntity } from './auth-user.orm-entity';
import { AuthRefreshSession, CreateAuthUserInput, AuthUser } from '../../domain/auth.model';
import { AuthRepository } from '../../domain/auth.repository';

@Injectable()
export class TypeOrmAuthRepository implements AuthRepository {
  constructor(
    @InjectRepository(AuthUserOrmEntity)
    private readonly userRepository: Repository<AuthUserOrmEntity>,
    @InjectRepository(AuthRefreshSessionOrmEntity)
    private readonly sessionRepository: Repository<AuthRefreshSessionOrmEntity>,
  ) {}

  async findById(userId: number): Promise<AuthUser | null> {
    const entity = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const entity = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const entity = this.userRepository.create(input);
    const savedEntity = await this.userRepository.save(entity);
    return this.toDomainModel(savedEntity);
  }

  async createRefreshSession(
    userId: number,
    sessionId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    const entity = this.sessionRepository.create({
      sessionId,
      userId,
      refreshTokenHash,
      refreshTokenExpiresAt,
      revokedAt: null,
    });
    await this.sessionRepository.save(entity);
  }

  async findActiveRefreshSession(
    userId: number,
    sessionId: string,
  ): Promise<AuthRefreshSession | null> {
    const entity = await this.sessionRepository.findOne({
      where: {
        sessionId,
        userId,
        revokedAt: IsNull(),
      },
    });

    return entity ? this.toRefreshSessionModel(entity) : null;
  }

  async revokeRefreshSession(userId: number, sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      {
        userId,
        sessionId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async revokeAllRefreshSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  private toDomainModel(entity: AuthUserOrmEntity): AuthUser {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      createdAt: entity.createdAt,
    };
  }

  private toRefreshSessionModel(entity: AuthRefreshSessionOrmEntity): AuthRefreshSession {
    return {
      sessionId: entity.sessionId,
      userId: entity.userId,
      refreshTokenHash: entity.refreshTokenHash,
      expiresAt: entity.refreshTokenExpiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AuthUserOrmEntity } from './auth-user.orm-entity';

@Entity({ name: 'auth_refresh_sessions' })
@Index('IDX_auth_refresh_sessions_userId', ['userId'])
@Index('IDX_auth_refresh_sessions_revokedAt', ['revokedAt'])
export class AuthRefreshSessionOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  sessionId!: string;

  @Column({ type: 'integer' })
  userId!: number;

  @ManyToOne(() => AuthUserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: AuthUserOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  refreshTokenHash!: string;

  @Column({ type: 'datetime' })
  refreshTokenExpiresAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

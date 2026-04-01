import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthUserRefreshColumnsCleanupMigration20260331150000
  implements MigrationInterface
{
  name = 'AuthUserRefreshColumnsCleanupMigration20260331150000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRefreshTokenExpiresAt = await queryRunner.hasColumn(
      'auth_users',
      'refreshTokenExpiresAt',
    );
    if (hasRefreshTokenExpiresAt) {
      await queryRunner.dropColumn('auth_users', 'refreshTokenExpiresAt');
    }

    const hasRefreshTokenHash = await queryRunner.hasColumn('auth_users', 'refreshTokenHash');
    if (hasRefreshTokenHash) {
      await queryRunner.dropColumn('auth_users', 'refreshTokenHash');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasRefreshTokenHash = await queryRunner.hasColumn('auth_users', 'refreshTokenHash');
    if (!hasRefreshTokenHash) {
      await queryRunner.query(`
        ALTER TABLE "auth_users"
        ADD COLUMN "refreshTokenHash" varchar(255)
      `);
    }

    const hasRefreshTokenExpiresAt = await queryRunner.hasColumn(
      'auth_users',
      'refreshTokenExpiresAt',
    );
    if (!hasRefreshTokenExpiresAt) {
      await queryRunner.query(`
        ALTER TABLE "auth_users"
        ADD COLUMN "refreshTokenExpiresAt" datetime
      `);
    }
  }
}

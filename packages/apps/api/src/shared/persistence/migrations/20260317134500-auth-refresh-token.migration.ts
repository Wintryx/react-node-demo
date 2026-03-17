import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AuthRefreshTokenMigration20260317134500 implements MigrationInterface {
  name = 'AuthRefreshTokenMigration20260317134500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRefreshTokenHash = await queryRunner.hasColumn('auth_users', 'refreshTokenHash');
    if (!hasRefreshTokenHash) {
      await queryRunner.addColumn(
        'auth_users',
        new TableColumn({
          name: 'refreshTokenHash',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    const hasRefreshTokenExpiresAt = await queryRunner.hasColumn(
      'auth_users',
      'refreshTokenExpiresAt',
    );
    if (!hasRefreshTokenExpiresAt) {
      await queryRunner.addColumn(
        'auth_users',
        new TableColumn({
          name: 'refreshTokenExpiresAt',
          type: 'datetime',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
}

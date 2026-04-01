import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRefreshSessionsMigration20260331130000 implements MigrationInterface {
  name = 'AuthRefreshSessionsMigration20260331130000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth_refresh_sessions" (
        "sessionId" varchar(64) PRIMARY KEY NOT NULL,
        "userId" integer NOT NULL,
        "refreshTokenHash" varchar(255) NOT NULL,
        "refreshTokenExpiresAt" datetime NOT NULL,
        "revokedAt" datetime,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_auth_refresh_sessions_user" FOREIGN KEY ("userId") REFERENCES "auth_users" ("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_auth_refresh_sessions_userId" ON "auth_refresh_sessions" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_auth_refresh_sessions_revokedAt" ON "auth_refresh_sessions" ("revokedAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_refresh_sessions_revokedAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_refresh_sessions_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_refresh_sessions"`);
  }
}

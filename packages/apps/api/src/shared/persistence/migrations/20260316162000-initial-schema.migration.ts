import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaMigration20260316162000 implements MigrationInterface {
  name = 'InitialSchemaMigration20260316162000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth_users" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "email" varchar(255) NOT NULL,
        "passwordHash" varchar(255) NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_auth_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employees" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "firstName" varchar(120) NOT NULL,
        "lastName" varchar(120) NOT NULL,
        "email" varchar(255) NOT NULL,
        "role" varchar CHECK(
          "role" IN (
            'developer',
            'team-lead',
            'engineering-manager',
            'product-manager',
            'designer',
            'qa-engineer',
            'devops-engineer'
          )
        ) NOT NULL,
        "department" varchar CHECK(
          "department" IN ('engineering', 'product', 'design', 'qa', 'operations', 'people')
        ) NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_employees_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" varchar(200) NOT NULL,
        "description" text,
        "status" varchar CHECK(
          "status" IN ('todo', 'in-progress', 'done')
        ) NOT NULL,
        "priority" varchar CHECK(
          "priority" IN ('low', 'medium', 'high')
        ) NOT NULL,
        "startDate" datetime NOT NULL,
        "dueDate" datetime,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "employeeId" integer NOT NULL,
        CONSTRAINT "FK_tasks_employee" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_employeeId" ON "tasks" ("employeeId")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subtasks" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" varchar(200) NOT NULL,
        "completed" boolean NOT NULL DEFAULT (0),
        "startDate" datetime NOT NULL,
        "endDate" datetime,
        "taskId" integer NOT NULL,
        "assigneeId" integer,
        CONSTRAINT "FK_subtasks_task" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_subtasks_assignee" FOREIGN KEY ("assigneeId") REFERENCES "employees" ("id")
          ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subtasks_taskId" ON "subtasks" ("taskId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subtasks_assigneeId" ON "subtasks" ("assigneeId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subtasks_assigneeId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subtasks_taskId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subtasks"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_employeeId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_users"`);
  }
}

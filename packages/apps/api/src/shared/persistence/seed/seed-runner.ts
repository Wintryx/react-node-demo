import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { createTypeOrmDataSourceOptions, resolveDatabasePath } from '../typeorm.config';
import { demoAuthUser, seedDemoData } from './seed-demo-data';

const assertSeedRuntimeSafety = (): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowProductionSeed = process.env.ALLOW_PRODUCTION_DB_SEED === 'true';

  if (isProduction && !allowProductionSeed) {
    throw new Error(
      'Refusing to run db seed in production. Set ALLOW_PRODUCTION_DB_SEED=true to override explicitly.',
    );
  }
};

const writeStdoutLine = (message: string): void => {
  process.stdout.write(`${message}\n`);
};

const writeStderrLine = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const logSeedSummary = (databasePath: string, result: Awaited<ReturnType<typeof seedDemoData>>): void => {
  writeStdoutLine(`[db:seed] Database: ${databasePath}`);
  writeStdoutLine(
    `[db:seed] Auth users created/skipped: ${result.authUsersCreated}/${result.authUsersSkipped}`,
  );
  writeStdoutLine(
    `[db:seed] Employees created/skipped: ${result.employeesCreated}/${result.employeesSkipped}`,
  );
  writeStdoutLine(
    `[db:seed] Tasks created/skipped: ${result.tasksCreated}/${result.tasksSkipped}`,
  );
  writeStdoutLine(`[db:seed] Subtasks created: ${result.subtasksCreated}`);
  writeStdoutLine(`[db:seed] Demo login: ${demoAuthUser.email} / ${demoAuthUser.password}`);
};

const run = async (): Promise<void> => {
  assertSeedRuntimeSafety();

  const databasePath = resolveDatabasePath(process.env.DATABASE_PATH ?? '');
  const dataSource = new DataSource(
    createTypeOrmDataSourceOptions(databasePath, {
      migrationsRun: true,
    }),
  );

  try {
    await dataSource.initialize();
    const result = await seedDemoData(dataSource);
    logSeedSummary(databasePath, result);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error.';
  writeStderrLine(`[db:seed] Failed: ${message}`);
  process.exit(1);
});

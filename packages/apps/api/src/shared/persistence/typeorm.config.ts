import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';

import { InitialSchemaMigration20260316162000 } from './migrations/20260316162000-initial-schema.migration';
import { AuthUserOrmEntity } from '../../modules/auth/infrastructure/persistence/auth-user.orm-entity';
import { EmployeeOrmEntity } from '../../modules/employees/infrastructure/persistence/employee.orm-entity';
import { SubtaskOrmEntity } from '../../modules/tasks/infrastructure/persistence/subtask.orm-entity';
import { TaskOrmEntity } from '../../modules/tasks/infrastructure/persistence/task.orm-entity';

const DEFAULT_DATABASE_PATH = join(process.cwd(), 'packages', 'apps', 'api', 'data', 'app.db');

export const ormEntities = [
  AuthUserOrmEntity,
  EmployeeOrmEntity,
  TaskOrmEntity,
  SubtaskOrmEntity,
] as const;

export const ormMigrations = [InitialSchemaMigration20260316162000] as const;

export const resolveDatabasePath = (databasePath: string | undefined): string =>
  databasePath && databasePath.trim().length > 0 ? databasePath : DEFAULT_DATABASE_PATH;

interface OrmOptionOverrides {
  migrationsRun?: boolean;
}

export const createTypeOrmDataSourceOptions = (
  databasePath: string,
  overrides?: OrmOptionOverrides,
): DataSourceOptions => ({
  type: 'sqlite',
  database: resolveDatabasePath(databasePath),
  entities: [...ormEntities],
  migrations: [...ormMigrations],
  synchronize: false,
  migrationsRun: overrides?.migrationsRun ?? false,
});

export const createTypeOrmModuleOptions = (
  databasePath: string,
  overrides?: OrmOptionOverrides,
): TypeOrmModuleOptions => ({
  ...createTypeOrmDataSourceOptions(databasePath, overrides),
});

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

import { AuthUserOrmEntity } from '../../../modules/auth/infrastructure/persistence/auth-user.orm-entity';
import { EmployeeOrmEntity } from '../../../modules/employees/infrastructure/persistence/employee.orm-entity';
import { SubtaskOrmEntity } from '../../../modules/tasks/infrastructure/persistence/subtask.orm-entity';
import { TaskOrmEntity } from '../../../modules/tasks/infrastructure/persistence/task.orm-entity';
import { createTypeOrmDataSourceOptions } from '../typeorm.config';
import { seedDemoData } from './seed-demo-data';

describe('seedDemoData', () => {
  let dataSource: DataSource;
  let tempDirectory: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), 'react-node-demo-seed-'));
    const databasePath = join(tempDirectory, 'app.db');

    dataSource = new DataSource(
      createTypeOrmDataSourceOptions(databasePath, {
        migrationsRun: true,
      }),
    );
    await dataSource.initialize();
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    await rm(tempDirectory, { recursive: true, force: true });
  });

  it('creates demo records on first run', async () => {
    const result = await seedDemoData(dataSource);

    expect(result.authUsersCreated).toBe(1);
    expect(result.authUsersSkipped).toBe(0);
    expect(result.employeesCreated).toBe(3);
    expect(result.employeesSkipped).toBe(0);
    expect(result.tasksCreated).toBe(3);
    expect(result.tasksSkipped).toBe(0);
    expect(result.subtasksCreated).toBe(7);

    const authUserCount = await dataSource.getRepository(AuthUserOrmEntity).count();
    const employeeCount = await dataSource.getRepository(EmployeeOrmEntity).count();
    const taskCount = await dataSource.getRepository(TaskOrmEntity).count();
    const subtaskCount = await dataSource.getRepository(SubtaskOrmEntity).count();

    expect(authUserCount).toBe(1);
    expect(employeeCount).toBe(3);
    expect(taskCount).toBe(3);
    expect(subtaskCount).toBe(7);
  });

  it('is idempotent and does not create duplicates on second run', async () => {
    await seedDemoData(dataSource);
    const secondRunResult = await seedDemoData(dataSource);

    expect(secondRunResult.authUsersCreated).toBe(0);
    expect(secondRunResult.authUsersSkipped).toBe(1);
    expect(secondRunResult.employeesCreated).toBe(0);
    expect(secondRunResult.employeesSkipped).toBe(3);
    expect(secondRunResult.tasksCreated).toBe(0);
    expect(secondRunResult.tasksSkipped).toBe(3);
    expect(secondRunResult.subtasksCreated).toBe(0);

    const authUserCount = await dataSource.getRepository(AuthUserOrmEntity).count();
    const employeeCount = await dataSource.getRepository(EmployeeOrmEntity).count();
    const taskCount = await dataSource.getRepository(TaskOrmEntity).count();
    const subtaskCount = await dataSource.getRepository(SubtaskOrmEntity).count();

    expect(authUserCount).toBe(1);
    expect(employeeCount).toBe(3);
    expect(taskCount).toBe(3);
    expect(subtaskCount).toBe(7);
  });
});

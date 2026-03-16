import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { createTypeOrmDataSourceOptions } from './shared/persistence/typeorm.config';

const appDataSource = new DataSource(
  createTypeOrmDataSourceOptions(process.env.DATABASE_PATH ?? '', {
    migrationsRun: false,
  }),
);

export default appDataSource;

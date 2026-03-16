import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { EmployeesModule } from '../modules/employees/employees.module';
import { TasksModule } from '../modules/tasks/tasks.module';
import {
  createTypeOrmModuleOptions,
  resolveDatabasePath,
} from '../shared/persistence/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmModuleOptions(
          resolveDatabasePath(configService.get<string>('DATABASE_PATH')),
          {
            migrationsRun: configService.get<string>('TYPEORM_MIGRATIONS_RUN') !== 'false',
          },
        ),
    }),
    AuthModule,
    EmployeesModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateTaskUseCase } from './application/create-task.use-case';
import { DeleteTaskUseCase } from './application/delete-task.use-case';
import { ListTasksUseCase } from './application/list-tasks.use-case';
import { UpdateTaskUseCase } from './application/update-task.use-case';
import { TASK_REPOSITORY } from './domain/task.repository';
import { SubtaskOrmEntity } from './infrastructure/persistence/subtask.orm-entity';
import { TaskOrmEntity } from './infrastructure/persistence/task.orm-entity';
import { TypeOrmTaskRepository } from './infrastructure/persistence/typeorm-task.repository';
import { TasksController } from './presentation/tasks.controller';
import { EmployeeOrmEntity } from '../employees/infrastructure/persistence/employee.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskOrmEntity, SubtaskOrmEntity, EmployeeOrmEntity])],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: TypeOrmTaskRepository,
    },
  ],
})
export class TasksModule {}

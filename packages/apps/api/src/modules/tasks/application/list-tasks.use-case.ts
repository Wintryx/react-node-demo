import { Inject, Injectable } from '@nestjs/common';

import { Task } from '../domain/task.model';
import { TASK_REPOSITORY, TaskRepository } from '../domain/task.repository';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  execute(employeeId?: number): Promise<Task[]> {
    return this.taskRepository.findAll(employeeId);
  }
}

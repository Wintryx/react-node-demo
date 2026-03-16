import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TASK_REPOSITORY, TaskRepository } from '../domain/task.repository';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }
  }
}

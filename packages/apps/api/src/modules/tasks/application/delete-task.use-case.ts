import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApiErrorCode } from '../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../shared/errors/api-error.helpers';
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
      throw new NotFoundException(
        createApiErrorPayload(ApiErrorCode.TASK_NOT_FOUND, `Task with id "${id}" was not found.`, {
          taskId: id,
        }),
      );
    }
  }
}

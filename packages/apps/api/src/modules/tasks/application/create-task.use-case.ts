import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { collectAssigneeIds, ensureDateRange, ensureSubtasksValid } from './task-validation';
import { ApiErrorCode } from '../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../shared/errors/api-error.helpers';
import { TaskPriority, TaskStatus } from '../domain/task.enums';
import { CreateTaskInput, Task } from '../domain/task.model';
import { TASK_REPOSITORY, TaskRepository } from '../domain/task.repository';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    ensureDateRange(input.startDate, input.dueDate, 'dueDate');
    ensureSubtasksValid(input.subtasks);

    const employeeExists = await this.taskRepository.employeeExists(input.employeeId);
    if (!employeeExists) {
      throw new NotFoundException(
        createApiErrorPayload(
          ApiErrorCode.TASK_EMPLOYEE_NOT_FOUND,
          `Employee with id "${input.employeeId}" was not found.`,
          { employeeId: input.employeeId },
        ),
      );
    }

    const assigneeIds = collectAssigneeIds(input.subtasks);
    if (assigneeIds.length > 0) {
      const assigneesExist = await this.taskRepository.employeesExist(assigneeIds);
      if (!assigneesExist) {
        throw new NotFoundException(
          createApiErrorPayload(
            ApiErrorCode.TASK_SUBTASK_ASSIGNEE_NOT_FOUND,
            'One or more subtask assignees do not exist.',
          ),
        );
      }
    }

    return this.taskRepository.create({
      ...input,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      description: input.description?.trim() || null,
      dueDate: input.dueDate ?? null,
      subtasks: input.subtasks ?? [],
    });
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { collectAssigneeIds, ensureDateRange, ensureSubtasksValid } from './task-validation';
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
      throw new NotFoundException(`Employee with id "${input.employeeId}" was not found.`);
    }

    const assigneeIds = collectAssigneeIds(input.subtasks);
    if (assigneeIds.length > 0) {
      const assigneesExist = await this.taskRepository.employeesExist(assigneeIds);
      if (!assigneesExist) {
        throw new NotFoundException('One or more subtask assignees do not exist.');
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

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { collectAssigneeIds, ensureDateRange, ensureSubtasksValid } from './task-validation';
import { Task, UpdateTaskInput } from '../domain/task.model';
import { TASK_REPOSITORY, TaskRepository } from '../domain/task.repository';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(id: number, patch: UpdateTaskInput): Promise<Task> {
    const currentTask = await this.taskRepository.findById(id);
    if (!currentTask) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }

    if (patch.employeeId !== undefined) {
      const employeeExists = await this.taskRepository.employeeExists(patch.employeeId);
      if (!employeeExists) {
        throw new NotFoundException(`Employee with id "${patch.employeeId}" was not found.`);
      }
    }

    const mergedStartDate = patch.startDate ?? currentTask.startDate;
    const mergedDueDate = patch.dueDate !== undefined ? patch.dueDate : currentTask.dueDate;
    ensureDateRange(mergedStartDate, mergedDueDate, 'dueDate');
    ensureSubtasksValid(patch.subtasks);

    if (patch.subtasks) {
      const existingSubtaskIds = new Set(currentTask.subtasks.map((subtask) => subtask.id));
      const unknownSubtaskId = patch.subtasks.find(
        (subtask) => subtask.id !== undefined && !existingSubtaskIds.has(subtask.id),
      );
      if (unknownSubtaskId?.id !== undefined) {
        throw new BadRequestException(
          `Subtask with id "${unknownSubtaskId.id}" does not belong to task "${id}".`,
        );
      }
    }

    const assigneeIds = collectAssigneeIds(patch.subtasks);
    if (assigneeIds.length > 0) {
      const assigneesExist = await this.taskRepository.employeesExist(assigneeIds);
      if (!assigneesExist) {
        throw new NotFoundException('One or more subtask assignees do not exist.');
      }
    }

    const normalizedPatch: UpdateTaskInput = {
      ...patch,
      description: patch.description !== undefined ? patch.description?.trim() || null : undefined,
    };

    const updatedTask = await this.taskRepository.update(id, normalizedPatch);
    if (!updatedTask) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }

    return updatedTask;
  }
}

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { InMemoryTaskRepository } from './test-helpers/in-memory-task.repository';
import { UpdateTaskUseCase } from './update-task.use-case';
import { TaskPriority, TaskStatus } from '../domain/task.enums';
import { Task } from '../domain/task.model';

const baseTask = (): Task => ({
  id: 1,
  title: 'Task',
  description: null,
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  startDate: new Date('2026-03-20T10:00:00.000Z'),
  dueDate: null,
  createdAt: new Date('2026-03-18T10:00:00.000Z'),
  employeeId: 1,
  subtasks: [
    {
      id: 11,
      title: 'Subtask',
      completed: false,
      startDate: new Date('2026-03-20T10:00:00.000Z'),
      endDate: null,
      assignee: { id: 1, name: 'Arne Winter' },
    },
  ],
});

describe('UpdateTaskUseCase', () => {
  it('throws NotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new UpdateTaskUseCase(repository);

    await expect(useCase.execute(123, { title: 'Updated' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when unknown subtask id is submitted', async () => {
    const repository = new InMemoryTaskRepository({
      tasks: [baseTask()],
      employeeIds: [1],
    });
    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute(1, {
        subtasks: [
          {
            id: 999,
            title: 'Unknown subtask',
            startDate: new Date('2026-03-20T10:00:00.000Z'),
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException for missing assignee ids', async () => {
    const repository = new InMemoryTaskRepository({
      tasks: [baseTask()],
      employeeIds: [1],
    });
    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute(1, {
        subtasks: [
          {
            id: 11,
            title: 'Subtask',
            startDate: new Date('2026-03-20T10:00:00.000Z'),
            assigneeId: 999,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

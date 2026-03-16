import { BadRequestException, NotFoundException } from '@nestjs/common';

import { CreateTaskUseCase } from './create-task.use-case';
import { InMemoryTaskRepository } from './test-helpers/in-memory-task.repository';
import { TaskPriority, TaskStatus } from '../domain/task.enums';

describe('CreateTaskUseCase', () => {
  it('throws BadRequestException when dueDate is before startDate', async () => {
    const repository = new InMemoryTaskRepository({
      employeeIds: [1],
    });
    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({
        title: 'Invalid task',
        employeeId: 1,
        startDate: new Date('2026-03-20T10:00:00.000Z'),
        dueDate: new Date('2026-03-19T10:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when employee does not exist', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({
        title: 'Task',
        employeeId: 999,
        startDate: new Date('2026-03-20T10:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates task with defaults when optional fields are omitted', async () => {
    const repository = new InMemoryTaskRepository({
      employeeIds: [1],
    });
    const useCase = new CreateTaskUseCase(repository);

    const result = await useCase.execute({
      title: 'Task',
      employeeId: 1,
      startDate: new Date('2026-03-20T10:00:00.000Z'),
    });

    expect(result.status).toBe(TaskStatus.TODO);
    expect(result.priority).toBe(TaskPriority.MEDIUM);
    expect(result.dueDate).toBeNull();
  });
});

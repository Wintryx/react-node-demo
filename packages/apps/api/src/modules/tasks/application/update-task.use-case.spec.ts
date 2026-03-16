import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UpdateTaskUseCase } from './update-task.use-case';
import { TaskPriority, TaskStatus } from '../domain/task.enums';
import { Task, UpdateTaskInput } from '../domain/task.model';
import { TaskRepository } from '../domain/task.repository';

class InMemoryTaskRepository implements TaskRepository {
  constructor(private readonly tasks: Task[]) {}

  async findAll(): Promise<Task[]> {
    return [...this.tasks];
  }

  async findById(id: number): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async create(): Promise<Task> {
    throw new Error('Not implemented for this spec');
  }

  async update(id: number, patch: UpdateTaskInput): Promise<Task | null> {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      return null;
    }

    Object.assign(task, patch);
    return task;
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async employeeExists(id: number): Promise<boolean> {
    return id === 1;
  }

  async employeesExist(ids: number[]): Promise<boolean> {
    return ids.every((id) => id === 1);
  }
}

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
    const repository = new InMemoryTaskRepository([]);
    const useCase = new UpdateTaskUseCase(repository);

    await expect(useCase.execute(123, { title: 'Updated' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when unknown subtask id is submitted', async () => {
    const repository = new InMemoryTaskRepository([baseTask()]);
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
    const repository = new InMemoryTaskRepository([baseTask()]);
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

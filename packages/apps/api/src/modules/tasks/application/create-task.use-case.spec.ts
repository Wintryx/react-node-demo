import { BadRequestException, NotFoundException } from '@nestjs/common';

import { CreateTaskUseCase } from './create-task.use-case';
import { TaskPriority, TaskStatus } from '../domain/task.enums';
import { CreateTaskInput, Task } from '../domain/task.model';
import { TaskRepository } from '../domain/task.repository';

class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks: Task[] = [];
  private readonly employeeIds: Set<number>;
  private nextTaskId = 1;
  private nextSubtaskId = 1;

  constructor(employeeIds: number[]) {
    this.employeeIds = new Set(employeeIds);
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks];
  }

  async findById(id: number): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: this.nextTaskId++,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      startDate: input.startDate,
      dueDate: input.dueDate ?? null,
      createdAt: new Date(),
      employeeId: input.employeeId,
      subtasks: (input.subtasks ?? []).map((subtask) => ({
        id: this.nextSubtaskId++,
        title: subtask.title,
        completed: subtask.completed ?? false,
        startDate: subtask.startDate,
        endDate: subtask.endDate ?? null,
        assignee: subtask.assigneeId ? { id: subtask.assigneeId, name: 'Assignee' } : null,
      })),
    };
    this.tasks.push(task);
    return task;
  }

  async update(): Promise<Task | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async employeeExists(id: number): Promise<boolean> {
    return this.employeeIds.has(id);
  }

  async employeesExist(ids: number[]): Promise<boolean> {
    return ids.every((id) => this.employeeIds.has(id));
  }
}

describe('CreateTaskUseCase', () => {
  it('throws BadRequestException when dueDate is before startDate', async () => {
    const repository = new InMemoryTaskRepository([1]);
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
    const repository = new InMemoryTaskRepository([]);
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
    const repository = new InMemoryTaskRepository([1]);
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

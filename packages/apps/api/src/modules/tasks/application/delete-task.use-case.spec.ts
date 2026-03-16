import { NotFoundException } from '@nestjs/common';

import { DeleteTaskUseCase } from './delete-task.use-case';
import { Task } from '../domain/task.model';
import { TaskRepository } from '../domain/task.repository';

class InMemoryTaskRepository implements TaskRepository {
  async findAll(): Promise<Task[]> {
    return [];
  }

  async findById(): Promise<Task | null> {
    return null;
  }

  async create(): Promise<Task> {
    throw new Error('Not implemented for this spec');
  }

  async update(): Promise<Task | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async employeeExists(): Promise<boolean> {
    return true;
  }

  async employeesExist(): Promise<boolean> {
    return true;
  }
}

describe('DeleteTaskUseCase', () => {
  it('throws NotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new DeleteTaskUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});

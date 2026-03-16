import { ConflictException, NotFoundException } from '@nestjs/common';

import { DeleteEmployeeUseCase } from './delete-employee.use-case';
import { Employee } from '../domain/employee.model';
import { EmployeeRepository } from '../domain/employee.repository';

class InMemoryEmployeeRepository implements EmployeeRepository {
  constructor(
    private readonly hasTasks: boolean,
    private readonly deleteResult: boolean,
  ) {}

  async findAll(): Promise<Employee[]> {
    return [];
  }

  async findById(): Promise<Employee | null> {
    return null;
  }

  async findByEmail(): Promise<Employee | null> {
    return null;
  }

  async hasAssignedTasks(): Promise<boolean> {
    return this.hasTasks;
  }

  async create(): Promise<Employee> {
    throw new Error('Not implemented for this spec');
  }

  async update(): Promise<Employee | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return this.deleteResult;
  }
}

describe('DeleteEmployeeUseCase', () => {
  it('throws ConflictException when employee still has assigned tasks', async () => {
    const repository = new InMemoryEmployeeRepository(true, true);
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFoundException when employee does not exist', async () => {
    const repository = new InMemoryEmployeeRepository(false, false);
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});

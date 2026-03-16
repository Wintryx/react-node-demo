import { ConflictException, NotFoundException } from '@nestjs/common';

import { UpdateEmployeeUseCase } from './update-employee.use-case';
import { EmployeeDepartment, EmployeeRole } from '../domain/employee.enums';
import { Employee, UpdateEmployeeInput } from '../domain/employee.model';
import { EmployeeRepository } from '../domain/employee.repository';

class InMemoryEmployeeRepository implements EmployeeRepository {
  constructor(private readonly employees: Employee[]) {}

  async findAll(): Promise<Employee[]> {
    return [...this.employees];
  }

  async findById(id: number): Promise<Employee | null> {
    return this.employees.find((employee) => employee.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employees.find((employee) => employee.email === email) ?? null;
  }

  async hasAssignedTasks(): Promise<boolean> {
    return false;
  }

  async create(): Promise<Employee> {
    throw new Error('Not implemented for this spec');
  }

  async update(id: number, patch: UpdateEmployeeInput): Promise<Employee | null> {
    const employee = this.employees.find((item) => item.id === id);
    if (!employee) {
      return null;
    }

    Object.assign(employee, patch);
    return employee;
  }

  async delete(): Promise<boolean> {
    throw new Error('Not implemented for this spec');
  }
}

describe('UpdateEmployeeUseCase', () => {
  it('throws NotFoundException when employee does not exist', async () => {
    const repository = new InMemoryEmployeeRepository([]);
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(
      useCase.execute(999, { role: EmployeeRole.ENGINEERING_MANAGER }),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when email is already used by another employee', async () => {
    const repository = new InMemoryEmployeeRepository([
      {
        id: 1,
        firstName: 'Arne',
        lastName: 'Winter',
        email: 'arne@example.com',
        role: EmployeeRole.DEVELOPER,
        department: EmployeeDepartment.ENGINEERING,
        createdAt: new Date(),
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        role: EmployeeRole.DEVELOPER,
        department: EmployeeDepartment.ENGINEERING,
        createdAt: new Date(),
      },
    ]);
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(useCase.execute(2, { email: 'Arne@Example.com' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

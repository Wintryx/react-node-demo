import { ConflictException } from '@nestjs/common';

import { CreateEmployeeUseCase } from './create-employee.use-case';
import { EmployeeDepartment, EmployeeRole } from '../domain/employee.enums';
import { CreateEmployeeInput, Employee, UpdateEmployeeInput } from '../domain/employee.model';
import { EmployeeRepository } from '../domain/employee.repository';

class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly employees: Employee[] = [];
  private nextId = 1;

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

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const employee: Employee = {
      id: this.nextId++,
      createdAt: new Date(),
      ...input,
    };
    this.employees.push(employee);
    return employee;
  }

  async update(id: number, patch: UpdateEmployeeInput): Promise<Employee | null> {
    const employee = this.employees.find((item) => item.id === id);
    if (!employee) {
      return null;
    }

    Object.assign(employee, patch);
    return employee;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.employees.findIndex((employee) => employee.id === id);
    if (index === -1) {
      return false;
    }

    this.employees.splice(index, 1);
    return true;
  }
}

describe('CreateEmployeeUseCase', () => {
  it('normalizes email and creates employee', async () => {
    const repository = new InMemoryEmployeeRepository();
    const useCase = new CreateEmployeeUseCase(repository);

    const result = await useCase.execute({
      firstName: 'Arne',
      lastName: 'Winter',
      email: ' Arne.Winter@Example.com ',
      role: EmployeeRole.DEVELOPER,
      department: EmployeeDepartment.ENGINEERING,
    });

    expect(result.email).toBe('arne.winter@example.com');
  });

  it('throws ConflictException when email already exists', async () => {
    const repository = new InMemoryEmployeeRepository();
    const useCase = new CreateEmployeeUseCase(repository);

    await useCase.execute({
      firstName: 'Arne',
      lastName: 'Winter',
      email: 'arne@example.com',
      role: EmployeeRole.DEVELOPER,
      department: EmployeeDepartment.ENGINEERING,
    });

    await expect(
      useCase.execute({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'ARNE@EXAMPLE.COM',
        role: EmployeeRole.TEAM_LEAD,
        department: EmployeeDepartment.ENGINEERING,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

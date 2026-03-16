import { ConflictException } from '@nestjs/common';

import { CreateEmployeeUseCase } from './create-employee.use-case';
import { InMemoryEmployeeRepository } from './test-helpers/in-memory-employee.repository';
import { EmployeeDepartment, EmployeeRole } from '../domain/employee.enums';

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

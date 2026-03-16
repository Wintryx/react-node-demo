import { ConflictException, NotFoundException } from '@nestjs/common';

import { InMemoryEmployeeRepository } from './test-helpers/in-memory-employee.repository';
import { UpdateEmployeeUseCase } from './update-employee.use-case';
import { EmployeeDepartment, EmployeeRole } from '../domain/employee.enums';

describe('UpdateEmployeeUseCase', () => {
  it('throws NotFoundException when employee does not exist', async () => {
    const repository = new InMemoryEmployeeRepository();
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(
      useCase.execute(999, { role: EmployeeRole.ENGINEERING_MANAGER }),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when email is already used by another employee', async () => {
    const repository = new InMemoryEmployeeRepository({
      employees: [
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
      ],
    });
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(useCase.execute(2, { email: 'Arne@Example.com' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

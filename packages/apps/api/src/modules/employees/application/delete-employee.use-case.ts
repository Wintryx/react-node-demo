import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { EMPLOYEE_REPOSITORY, EmployeeRepository } from '../domain/employee.repository';

@Injectable()
export class DeleteEmployeeUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const hasAssignedTasks = await this.employeeRepository.hasAssignedTasks(id);
    if (hasAssignedTasks) {
      throw new ConflictException(
        `Employee with id "${id}" has assigned tasks and cannot be deleted.`,
      );
    }

    const deleted = await this.employeeRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Employee with id "${id}" was not found.`);
    }
  }
}

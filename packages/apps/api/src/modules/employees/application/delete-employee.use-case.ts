import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApiErrorCode, createApiErrorPayload } from '../../../shared/errors';
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
        createApiErrorPayload(
          ApiErrorCode.EMPLOYEE_HAS_ASSIGNED_TASKS,
          `Employee with id "${id}" has assigned tasks and cannot be deleted.`,
          { employeeId: id },
        ),
      );
    }

    const deleted = await this.employeeRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(
        createApiErrorPayload(ApiErrorCode.EMPLOYEE_NOT_FOUND, `Employee with id "${id}" was not found.`, {
          employeeId: id,
        }),
      );
    }
  }
}

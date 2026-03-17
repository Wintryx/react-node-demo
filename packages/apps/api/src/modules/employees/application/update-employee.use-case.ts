import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApiErrorCode, createApiErrorPayload } from '../../../shared/errors';
import { Employee, UpdateEmployeeInput } from '../domain/employee.model';
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from '../domain/employee.repository';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: number, patch: UpdateEmployeeInput): Promise<Employee> {
    const currentEmployee = await this.employeeRepository.findById(id);

    if (!currentEmployee) {
      throw new NotFoundException(
        createApiErrorPayload(ApiErrorCode.EMPLOYEE_NOT_FOUND, `Employee with id "${id}" was not found.`, {
          employeeId: id,
        }),
      );
    }

    const normalizedPatch: UpdateEmployeeInput = { ...patch };
    if (patch.email !== undefined) {
      const normalizedEmail = patch.email.trim().toLowerCase();
      const employeeWithEmail = await this.employeeRepository.findByEmail(normalizedEmail);

      if (employeeWithEmail && employeeWithEmail.id !== id) {
        throw new ConflictException(
          createApiErrorPayload(
            ApiErrorCode.EMPLOYEE_EMAIL_ALREADY_EXISTS,
            `Employee with email "${normalizedEmail}" already exists.`,
            { email: normalizedEmail },
          ),
        );
      }

      normalizedPatch.email = normalizedEmail;
    }

    const updatedEmployee = await this.employeeRepository.update(id, normalizedPatch);
    if (!updatedEmployee) {
      throw new NotFoundException(
        createApiErrorPayload(ApiErrorCode.EMPLOYEE_NOT_FOUND, `Employee with id "${id}" was not found.`, {
          employeeId: id,
        }),
      );
    }

    return updatedEmployee;
  }
}

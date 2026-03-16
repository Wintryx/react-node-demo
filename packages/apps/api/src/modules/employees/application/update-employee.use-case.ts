import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

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
      throw new NotFoundException(`Employee with id "${id}" was not found.`);
    }

    const normalizedPatch: UpdateEmployeeInput = { ...patch };
    if (patch.email !== undefined) {
      const normalizedEmail = patch.email.trim().toLowerCase();
      const employeeWithEmail = await this.employeeRepository.findByEmail(normalizedEmail);

      if (employeeWithEmail && employeeWithEmail.id !== id) {
        throw new ConflictException(`Employee with email "${normalizedEmail}" already exists.`);
      }

      normalizedPatch.email = normalizedEmail;
    }

    const updatedEmployee = await this.employeeRepository.update(id, normalizedPatch);
    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with id "${id}" was not found.`);
    }

    return updatedEmployee;
  }
}

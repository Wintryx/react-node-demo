import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { CreateEmployeeInput, Employee } from '../domain/employee.model';
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from '../domain/employee.repository';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(input: CreateEmployeeInput): Promise<Employee> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingEmployee = await this.employeeRepository.findByEmail(normalizedEmail);

    if (existingEmployee) {
      throw new ConflictException(`Employee with email "${normalizedEmail}" already exists.`);
    }

    return this.employeeRepository.create({
      ...input,
      email: normalizedEmail,
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { Employee } from '../domain/employee.model';
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from '../domain/employee.repository';

@Injectable()
export class ListEmployeesUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  execute(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }
}

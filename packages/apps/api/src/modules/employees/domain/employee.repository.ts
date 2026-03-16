import { CreateEmployeeInput, Employee, UpdateEmployeeInput } from './employee.model';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: number): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  hasAssignedTasks(employeeId: number): Promise<boolean>;
  create(input: CreateEmployeeInput): Promise<Employee>;
  update(id: number, patch: UpdateEmployeeInput): Promise<Employee | null>;
  delete(id: number): Promise<boolean>;
}

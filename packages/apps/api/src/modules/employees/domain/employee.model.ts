import { EmployeeDepartment, EmployeeRole } from './employee.enums';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  createdAt: Date;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: EmployeeRole;
  department?: EmployeeDepartment;
}

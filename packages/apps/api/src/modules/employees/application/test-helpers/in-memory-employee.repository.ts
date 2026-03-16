import { CreateEmployeeInput, Employee, UpdateEmployeeInput } from '../../domain/employee.model';
import { EmployeeRepository } from '../../domain/employee.repository';

interface InMemoryEmployeeRepositoryOptions {
  employees?: Employee[];
  assignedTaskEmployeeIds?: number[];
  deleteResultOverride?: boolean;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly employees: Employee[];
  private readonly assignedTaskEmployeeIds: Set<number>;
  private readonly deleteResultOverride?: boolean;
  private nextId: number;

  constructor(options: InMemoryEmployeeRepositoryOptions = {}) {
    this.employees = options.employees ? [...options.employees] : [];
    this.assignedTaskEmployeeIds = new Set(options.assignedTaskEmployeeIds ?? []);
    this.deleteResultOverride = options.deleteResultOverride;
    this.nextId =
      this.employees.length === 0 ? 1 : Math.max(...this.employees.map((employee) => employee.id)) + 1;
  }

  async findAll(): Promise<Employee[]> {
    return [...this.employees];
  }

  async findById(id: number): Promise<Employee | null> {
    return this.employees.find((employee) => employee.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employees.find((employee) => employee.email === email) ?? null;
  }

  async hasAssignedTasks(employeeId: number): Promise<boolean> {
    return this.assignedTaskEmployeeIds.has(employeeId);
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const employee: Employee = {
      id: this.nextId++,
      createdAt: new Date(),
      ...input,
    };
    this.employees.push(employee);
    return employee;
  }

  async update(id: number, patch: UpdateEmployeeInput): Promise<Employee | null> {
    const employee = this.employees.find((item) => item.id === id);
    if (!employee) {
      return null;
    }

    Object.assign(employee, patch);
    return employee;
  }

  async delete(id: number): Promise<boolean> {
    if (this.deleteResultOverride !== undefined) {
      return this.deleteResultOverride;
    }

    const index = this.employees.findIndex((employee) => employee.id === id);
    if (index === -1) {
      return false;
    }

    this.employees.splice(index, 1);
    return true;
  }
}

import { CreateTaskInput, Task, UpdateTaskInput } from './task.model';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface TaskRepository {
  findAll(employeeId?: number): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: number, patch: UpdateTaskInput): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
  employeeExists(id: number): Promise<boolean>;
  employeesExist(ids: number[]): Promise<boolean>;
}

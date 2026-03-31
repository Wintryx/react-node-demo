import type { components } from './generated/openapi';

type Schemas = components['schemas'];

export type EmployeeRole = Schemas['EmployeeResponseDto']['role'];
export type EmployeeDepartment = Schemas['EmployeeResponseDto']['department'];
export type TaskStatus = Schemas['TaskResponseDto']['status'];
export type TaskPriority = Schemas['TaskResponseDto']['priority'];

export type AuthUser = Schemas['AuthResponseUserDto'];
export type AuthResponse = Schemas['AuthResponseDto'];
export type LoginRequest = Schemas['LoginDto'];
export type RegisterRequest = Schemas['RegisterDto'];
export type Employee = Schemas['EmployeeResponseDto'];
export type CreateEmployeeRequest = Schemas['CreateEmployeeDto'];
export type UpdateEmployeeRequest = Schemas['UpdateEmployeeDto'];
export type TaskAssignee = Schemas['SubtaskAssigneeResponseDto'];
export type UpsertSubtaskRequest = Schemas['UpsertSubtaskDto'];
export type CreateTaskRequest = Schemas['CreateTaskDto'];

type NullableApiString = string | null;
type RawUpdateTaskRequest = Schemas['UpdateTaskDto'];

export type UpdateTaskRequest = Omit<RawUpdateTaskRequest, 'dueDate'> & {
  dueDate?: NullableApiString;
};

// Swagger/OpenAPI generator currently emits nullable string response fields
// as Record<string, never> | null. Normalize them for strict frontend typing.
export type Subtask = Omit<Schemas['SubtaskResponseDto'], 'endDate'> & {
  endDate: NullableApiString;
};

export type Task = Omit<Schemas['TaskResponseDto'], 'description' | 'dueDate' | 'subtasks'> & {
  description: NullableApiString;
  dueDate: NullableApiString;
  subtasks: Subtask[];
};

export interface ApiErrorPayload {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  params?: Record<string, unknown>;
  path?: string;
  timestamp?: string;
}

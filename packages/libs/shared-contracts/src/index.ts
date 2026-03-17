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
export type TaskAssignee = Schemas['SubtaskAssigneeResponseDto'];
export type Subtask = Schemas['SubtaskResponseDto'];
export type UpsertSubtaskRequest = Schemas['UpsertSubtaskDto'];
export type CreateTaskRequest = Schemas['CreateTaskDto'];
export type UpdateTaskRequest = Schemas['UpdateTaskDto'];
export type Task = Schemas['TaskResponseDto'];

export interface ApiErrorPayload {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  params?: Record<string, unknown>;
  path?: string;
  timestamp?: string;
}

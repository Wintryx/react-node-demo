export type EmployeeRole =
  | 'developer'
  | 'team-lead'
  | 'engineering-manager'
  | 'product-manager'
  | 'designer'
  | 'qa-engineer'
  | 'devops-engineer';

export type EmployeeDepartment =
  | 'engineering'
  | 'product'
  | 'design'
  | 'qa'
  | 'operations'
  | 'people';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AuthUser {
  id: number;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type RegisterRequest = LoginRequest;

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  createdAt: string;
}

export interface TaskAssignee {
  id: number;
  name: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  startDate: string;
  endDate: string | null;
  assignee: TaskAssignee | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string | null;
  createdAt: string;
  employeeId: number;
  subtasks: Subtask[];
}

export interface ApiErrorPayload {
  message?: string | string[];
}

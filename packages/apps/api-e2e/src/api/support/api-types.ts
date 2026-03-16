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

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: number;
    email: string;
    createdAt: string;
  };
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
}

export interface EmployeeResponse extends CreateEmployeeRequest {
  id: number;
  createdAt: string;
}

export interface SubtaskResponse {
  id: number;
  title: string;
  completed: boolean;
  startDate: string;
  endDate: string | null;
  assignee: { id: number; name: string } | null;
}

export interface CreateSubtaskRequest {
  id?: number;
  title: string;
  completed?: boolean;
  startDate: string;
  endDate?: string;
  assigneeId?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate: string;
  dueDate?: string;
  employeeId: number;
  subtasks?: CreateSubtaskRequest[];
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string | null;
  createdAt: string;
  employeeId: number;
  subtasks: SubtaskResponse[];
}

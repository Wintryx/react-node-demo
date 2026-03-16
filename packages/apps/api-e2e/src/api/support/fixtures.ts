import {
  CreateEmployeeRequest,
  CreateTaskRequest,
  RegisterRequest,
} from './api-types';

export const buildUniqueSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

export const buildAuthPayload = (suffix: string): RegisterRequest => ({
  email: `auth.${suffix}@example.com`,
  password: `StrongPassword!1-${suffix}`,
});

export const buildEmployeePayload = (suffix: string): CreateEmployeeRequest => ({
  firstName: 'Arne',
  lastName: `Winter-${suffix}`,
  email: `arne.${suffix}@example.com`,
  role: 'developer',
  department: 'engineering',
});

export const buildTaskPayload = (employeeId: number, suffix: string): CreateTaskRequest => ({
  title: `Task-${suffix}`,
  description: 'Initial task for API e2e',
  startDate: '2026-04-01T08:00:00.000Z',
  dueDate: '2026-04-03T18:00:00.000Z',
  employeeId,
  subtasks: [
    {
      title: `Subtask-${suffix}`,
      completed: false,
      startDate: '2026-04-01T09:00:00.000Z',
      endDate: '2026-04-02T17:00:00.000Z',
      assigneeId: employeeId,
    },
  ],
});

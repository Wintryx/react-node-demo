import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { dashboardTranslations } from './dashboard-translations';
import App from '../../app/app';
import { Employee, Task } from '../../shared/api/types';
import { createAccessTokenForTest } from '../../shared/testing/auth-test-token';
import { writeAuthSession } from '../auth/auth-storage';

const dashboardApiMocks = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  listEmployeesMock: vi.fn(),
  createEmployeeMock: vi.fn(),
  updateEmployeeMock: vi.fn(),
  deleteEmployeeMock: vi.fn(),
  listTasksMock: vi.fn(),
  listTasksByEmployeeMock: vi.fn(),
  createTaskMock: vi.fn(),
  updateTaskMock: vi.fn(),
  deleteTaskMock: vi.fn(),
}));

export const getDashboardApiMocks = () => dashboardApiMocks;

vi.mock('../../shared/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: dashboardApiMocks.refreshMock,
  },
  employeesApi: {
    list: dashboardApiMocks.listEmployeesMock,
    create: dashboardApiMocks.createEmployeeMock,
    update: dashboardApiMocks.updateEmployeeMock,
    delete: dashboardApiMocks.deleteEmployeeMock,
  },
  tasksApi: {
    list: dashboardApiMocks.listTasksMock,
    listByEmployee: dashboardApiMocks.listTasksByEmployeeMock,
    create: dashboardApiMocks.createTaskMock,
    update: dashboardApiMocks.updateTaskMock,
    delete: dashboardApiMocks.deleteTaskMock,
  },
}));

export const employeeFixture: Employee = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'developer',
  department: 'engineering',
  createdAt: '2026-03-16T10:00:00.000Z',
};

export const taskFixture: Task = {
  id: 11,
  title: 'Initial task',
  description: 'Task description',
  status: 'todo',
  priority: 'medium',
  startDate: '2026-03-16T12:00:00.000Z',
  dueDate: '2026-03-20T12:00:00.000Z',
  createdAt: '2026-03-16T10:00:00.000Z',
  employeeId: 1,
  subtasks: [
    {
      id: 101,
      title: 'Initial subtask',
      completed: false,
      startDate: '2026-03-16T12:00:00.000Z',
      endDate: null,
      assignee: {
        id: 1,
        name: 'Ada Lovelace',
      },
    },
  ],
};

export const employeeCreateFixture: Employee = {
  id: 2,
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  role: 'team-lead',
  department: 'engineering',
  createdAt: '2026-03-17T10:00:00.000Z',
};

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export const resetDashboardApiMocks = (): void => {
  window.sessionStorage.clear();
  vi.clearAllMocks();

  dashboardApiMocks.listEmployeesMock.mockResolvedValue([employeeFixture]);
  dashboardApiMocks.createEmployeeMock.mockResolvedValue(employeeCreateFixture);
  dashboardApiMocks.updateEmployeeMock.mockResolvedValue(employeeFixture);
  dashboardApiMocks.deleteEmployeeMock.mockResolvedValue(undefined);
  dashboardApiMocks.listTasksMock.mockResolvedValue([taskFixture]);
  dashboardApiMocks.listTasksByEmployeeMock.mockResolvedValue([taskFixture]);
  dashboardApiMocks.createTaskMock.mockResolvedValue(taskFixture);
  dashboardApiMocks.updateTaskMock.mockResolvedValue(taskFixture);
  dashboardApiMocks.deleteTaskMock.mockResolvedValue(undefined);
  dashboardApiMocks.refreshMock.mockResolvedValue({
    accessToken: createAccessTokenForTest(Math.floor(Date.now() / 1000) + 60 * 15),
    tokenType: 'Bearer',
    expiresIn: '15m',
    user: {
      id: 1,
      email: 'tester@example.com',
      createdAt: '2026-03-16T10:00:00.000Z',
    },
  });
};

export const renderAuthenticatedApp = async (): Promise<void> => {
  writeAuthSession({
    accessToken: createAccessTokenForTest(Math.floor(Date.now() / 1000) + 60 * 15),
    user: {
      id: 1,
      email: 'tester@example.com',
      createdAt: '2026-03-16T10:00:00.000Z',
    },
  });

  render(
    <MemoryRouter future={routerFuture} initialEntries={['/app']}>
      <App />
    </MemoryRouter>,
  );

  await screen.findByText(dashboardTranslations.header.title);
};

export const clickButtonByName = async (
  name: string | RegExp,
): Promise<void> => {
  fireEvent.click(await screen.findByRole('button', { name }));
};

export const setInputValueByLabel = (label: string, value: string): void => {
  fireEvent.change(screen.getByLabelText(label), {
    target: {
      value,
    },
  });
};

export const openCreateTaskModal = async (): Promise<void> => {
  await clickButtonByName(dashboardTranslations.tasks.newTask);
  await screen.findByRole('heading', { name: dashboardTranslations.tasks.create });
};

export const openEditTaskModal = async (taskId = 11): Promise<void> => {
  await clickButtonByName(dashboardTranslations.tasks.edit);
  await screen.findByRole('heading', { name: dashboardTranslations.tasks.editHeading(taskId) });
};

export const openTaskDeleteDialog = async (): Promise<void> => {
  await clickButtonByName(dashboardTranslations.tasks.delete);
  await screen.findByRole('heading', { name: dashboardTranslations.tasks.confirmDeleteTitle });
};

export const confirmActionDialog = (): void => {
  fireEvent.click(screen.getByRole('button', { name: dashboardTranslations.common.confirmAction }));
};

export const openCreateEmployeeModal = async (): Promise<void> => {
  await clickButtonByName(dashboardTranslations.employees.addEmployee);
  await screen.findByLabelText(dashboardTranslations.employees.firstName);
};

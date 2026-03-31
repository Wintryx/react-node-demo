import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardCopy } from './dashboard-copy';
import App from '../../app/app';
import { Employee, Task } from '../../shared/api/types';
import { createAccessTokenForTest } from '../../shared/testing/auth-test-token';
import { writeAuthSession } from '../auth/auth-storage';

const {
  refreshMock,
  listEmployeesMock,
  createEmployeeMock,
  updateEmployeeMock,
  deleteEmployeeMock,
  listTasksMock,
  listTasksByEmployeeMock,
  createTaskMock,
  updateTaskMock,
  deleteTaskMock,
} = vi.hoisted(() => ({
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

vi.mock('../../shared/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: refreshMock,
  },
  employeesApi: {
    list: listEmployeesMock,
    create: createEmployeeMock,
    update: updateEmployeeMock,
    delete: deleteEmployeeMock,
  },
  tasksApi: {
    list: listTasksMock,
    listByEmployee: listTasksByEmployeeMock,
    create: createTaskMock,
    update: updateTaskMock,
    delete: deleteTaskMock,
  },
}));

const employeeFixture: Employee = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'developer',
  department: 'engineering',
  createdAt: '2026-03-16T10:00:00.000Z',
};

const taskFixture: Task = {
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

const employeeCreateFixture: Employee = {
  id: 2,
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  role: 'team-lead',
  department: 'engineering',
  createdAt: '2026-03-17T10:00:00.000Z',
};

const renderAuthenticatedApp = async (): Promise<void> => {
  writeAuthSession({
    accessToken: createAccessTokenForTest(Math.floor(Date.now() / 1000) + 60 * 15),
    user: {
      id: 1,
      email: 'tester@example.com',
      createdAt: '2026-03-16T10:00:00.000Z',
    },
  });

  render(
    <MemoryRouter initialEntries={['/app']}>
      <App />
    </MemoryRouter>,
  );

  await screen.findByText(dashboardCopy.header.title);
};

describe('Dashboard CRUD integration', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();

    listEmployeesMock.mockResolvedValue([employeeFixture]);
    createEmployeeMock.mockResolvedValue(employeeCreateFixture);
    updateEmployeeMock.mockResolvedValue(employeeFixture);
    deleteEmployeeMock.mockResolvedValue(undefined);
    listTasksMock.mockResolvedValue([taskFixture]);
    listTasksByEmployeeMock.mockResolvedValue([taskFixture]);
    createTaskMock.mockResolvedValue(taskFixture);
    updateTaskMock.mockResolvedValue(taskFixture);
    deleteTaskMock.mockResolvedValue(undefined);
    refreshMock.mockResolvedValue({
      accessToken: createAccessTokenForTest(Math.floor(Date.now() / 1000) + 60 * 15),
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: 1,
        email: 'tester@example.com',
        createdAt: '2026-03-16T10:00:00.000Z',
      },
    });
  });

  it('creates a task from the modal', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.newTask }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.create });

    fireEvent.change(screen.getByLabelText('Title'), {
      target: {
        value: 'Newly created task',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledTimes(1);
    });

    const createPayload = createTaskMock.mock.calls[0][0] as {
      title: string;
      employeeId: number;
      status: string;
      priority: string;
      startDate: string;
    };

    expect(createPayload.title).toBe('Newly created task');
    expect(createPayload.employeeId).toBe(1);
    expect(createPayload.status).toBe('todo');
    expect(createPayload.priority).toBe('medium');
    expect(createPayload.startDate.endsWith('T12:00:00.000Z')).toBe(true);
  });

  it('creates an employee from the management panel', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.employees.addEmployee }));
    await screen.findByLabelText(dashboardCopy.employees.firstName);

    fireEvent.change(screen.getByLabelText(dashboardCopy.employees.firstName), {
      target: {
        value: 'Grace',
      },
    });
    fireEvent.change(screen.getByLabelText(dashboardCopy.employees.lastName), {
      target: {
        value: 'Hopper',
      },
    });
    fireEvent.change(screen.getByLabelText(dashboardCopy.employees.email), {
      target: {
        value: 'grace@example.com',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.employees.createEmployee }));

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledTimes(1);
    });

    expect(createEmployeeMock).toHaveBeenCalledWith({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      role: 'developer',
      department: 'engineering',
    });
  });

  it('updates an employee from the management panel', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(
      await screen.findByRole('button', {
        name: dashboardCopy.employees.editAria('Ada Lovelace'),
      }),
    );
    await screen.findByText(dashboardCopy.employees.editEmployee);

    fireEvent.change(screen.getByLabelText(dashboardCopy.employees.firstName), {
      target: {
        value: 'Ada-Updated',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.saveChanges }));

    await waitFor(() => {
      expect(updateEmployeeMock).toHaveBeenCalledTimes(1);
    });

    const [employeeId, payload] = updateEmployeeMock.mock.calls[0] as [
      number,
      {
        firstName: string;
      },
    ];
    expect(employeeId).toBe(1);
    expect(payload.firstName).toBe('Ada-Updated');
  });

  it('deletes an employee from the management panel after confirmation', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(
      await screen.findByRole('button', {
        name: dashboardCopy.employees.removeAria('Ada Lovelace'),
      }),
    );
    await screen.findByRole('heading', { name: dashboardCopy.employees.confirmDeleteTitle });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.confirmAction }));

    await waitFor(() => {
      expect(deleteEmployeeMock).toHaveBeenCalledWith(1);
    });
  });

  it('shows modal validation errors for empty task title and invalid subtasks', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.newTask }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.create });

    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));
    const requiredTitleMessage = await screen.findByText(dashboardCopy.tasks.validations.titleRequired);
    expect(requiredTitleMessage).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: {
        value: 'Task with invalid subtask',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.subtasks.addSubtask }));
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));

    const invalidSubtaskMessage = await screen.findByText(dashboardCopy.tasks.validations.subtaskInvalid);
    expect(invalidSubtaskMessage).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it('updates a task through the edit modal', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.edit }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.editHeading(11) });

    fireEvent.change(screen.getByLabelText('Title'), {
      target: {
        value: 'Updated task title',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.saveChanges }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalled();
    });

    const [taskId, updatePayload] = updateTaskMock.mock.calls[0] as [
      number,
      {
        title: string;
      },
    ];

    expect(taskId).toBe(11);
    expect(updatePayload.title).toBe('Updated task title');
  });

  it('shows API error feedback when update fails', async () => {
    updateTaskMock.mockRejectedValueOnce(new Error('Task update failed.'));
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.edit }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.editHeading(11) });

    fireEvent.change(screen.getByLabelText('Title'), {
      target: {
        value: 'Updated but failing',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.saveChanges }));

    const errorMessages = await screen.findAllByText('Task update failed.');
    expect(errorMessages.length > 0).toBe(true);
  });

  it('deletes a task after confirmation', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.delete }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.confirmDeleteTitle });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.confirmAction }));

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith(11);
    });
  });

  it('does not delete a task when confirmation is cancelled', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.delete }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.confirmDeleteTitle });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.cancel }));
    expect(deleteTaskMock).not.toHaveBeenCalled();
  });

  it('shows API error feedback when delete fails', async () => {
    deleteTaskMock.mockRejectedValueOnce(new Error('Task delete failed.'));
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.delete }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.confirmDeleteTitle });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.confirmAction }));

    const errorMessage = await screen.findByText('Task delete failed.');
    expect(errorMessage).toBeTruthy();
  });

  it('shows API error feedback when create fails', async () => {
    createTaskMock.mockRejectedValueOnce(new Error('Task creation failed.'));
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: dashboardCopy.tasks.newTask }));
    await screen.findByRole('heading', { name: dashboardCopy.tasks.create });

    fireEvent.change(screen.getByLabelText('Title'), {
      target: {
        value: 'Broken task',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));

    const errorMessages = await screen.findAllByText('Task creation failed.');
    expect(errorMessages.length > 0).toBe(true);
  });

  it('updates task subtasks inline when adding and removing subtasks', async () => {
    await renderAuthenticatedApp();

    const addInput = await screen.findByPlaceholderText(dashboardCopy.subtasks.addPlaceholder);
    fireEvent.change(addInput, {
      target: {
        value: 'Inline added subtask',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.subtasks.add }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalled();
    });

    const addPayload = updateTaskMock.mock.calls[0][1] as {
      subtasks: Array<{
        title: string;
      }>;
    };
    expect(addPayload.subtasks.length).toBe(2);
    expect(addPayload.subtasks[1].title).toBe('Inline added subtask');

    updateTaskMock.mockClear();
    fireEvent.click(
      await screen.findByRole('button', {
        name: dashboardCopy.subtasks.removeAria('Initial subtask'),
      }),
    );

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalled();
    });

    const removePayload = updateTaskMock.mock.calls[0][1] as {
      subtasks: Array<{
        id?: number;
      }>;
    };
    expect(removePayload.subtasks.some((subtask) => subtask.id === 101)).toBe(false);
  });

  it('updates task subtasks inline when toggling a checkbox', async () => {
    await renderAuthenticatedApp();

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalled();
    });

    const [taskId, updatePayload] = updateTaskMock.mock.calls[0] as [
      number,
      {
        subtasks: Array<{
          id?: number;
          completed?: boolean;
        }>;
      },
    ];

    expect(taskId).toBe(11);
    expect(updatePayload.subtasks[0].id).toBe(101);
    expect(updatePayload.subtasks[0].completed).toBe(true);
  });

  it('opens the edit modal when clicking a task in timeline view', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.timelineView }));
    fireEvent.click(await screen.findByRole('button', { name: /Initial task/i }));

    const editModalHeading = await screen.findByRole('heading', {
      name: dashboardCopy.tasks.editHeading(11),
    });
    expect(editModalHeading).toBeTruthy();
  });
});

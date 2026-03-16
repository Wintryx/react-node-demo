import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../app/app';
import { Employee, Task } from '../../shared/api/types';
import { writeAuthSession } from '../auth/auth-storage';

const {
  listEmployeesMock,
  listTasksByEmployeeMock,
  createTaskMock,
  updateTaskMock,
  deleteTaskMock,
} = vi.hoisted(() => ({
  listEmployeesMock: vi.fn(),
  listTasksByEmployeeMock: vi.fn(),
  createTaskMock: vi.fn(),
  updateTaskMock: vi.fn(),
  deleteTaskMock: vi.fn(),
}));

vi.mock('../../shared/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  employeesApi: {
    list: listEmployeesMock,
  },
  tasksApi: {
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

const renderAuthenticatedApp = async (): Promise<void> => {
  writeAuthSession({
    accessToken: 'test-token',
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

  await screen.findByText('Aufgaben-Dashboard');
};

describe('Dashboard CRUD integration', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();

    listEmployeesMock.mockResolvedValue([employeeFixture]);
    listTasksByEmployeeMock.mockResolvedValue([taskFixture]);
    createTaskMock.mockResolvedValue(taskFixture);
    updateTaskMock.mockResolvedValue(taskFixture);
    deleteTaskMock.mockResolvedValue(undefined);
  });

  it('creates a task from the modal', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Neue Aufgabe' }));
    await screen.findByRole('heading', { name: 'Aufgabe erstellen' });

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: {
        value: 'Newly created task',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

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

  it('shows modal validation errors for empty task title and invalid subtasks', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Neue Aufgabe' }));
    await screen.findByRole('heading', { name: 'Aufgabe erstellen' });

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));
    expect(await screen.findByText('Titel ist erforderlich.')).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: {
        value: 'Task with invalid subtask',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Teilaufgabe hinzufügen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    expect(await screen.findByText('Jede Teilaufgabe braucht einen Titel und ein Startdatum.')).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it('updates a task through the edit modal', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    await screen.findByRole('heading', { name: 'Aufgabe #11 bearbeiten' });

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: {
        value: 'Updated task title',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Änderungen speichern' }));

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

    fireEvent.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    await screen.findByRole('heading', { name: 'Aufgabe #11 bearbeiten' });

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: {
        value: 'Updated but failing',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Änderungen speichern' }));

    const errorMessages = await screen.findAllByText('Task update failed.');
    expect(errorMessages.length > 0).toBe(true);
  });

  it('deletes a task after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Löschen' }));

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith(11);
    });
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('does not delete a task when confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Löschen' }));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });
    expect(deleteTaskMock).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('shows API error feedback when delete fails', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteTaskMock.mockRejectedValueOnce(new Error('Task delete failed.'));
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Löschen' }));

    const errorMessage = await screen.findByText('Task delete failed.');
    expect(errorMessage).toBeTruthy();

    confirmSpy.mockRestore();
  });

  it('shows API error feedback when create fails', async () => {
    createTaskMock.mockRejectedValueOnce(new Error('Task creation failed.'));
    await renderAuthenticatedApp();

    fireEvent.click(await screen.findByRole('button', { name: 'Neue Aufgabe' }));
    await screen.findByRole('heading', { name: 'Aufgabe erstellen' });

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: {
        value: 'Broken task',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    const errorMessages = await screen.findAllByText('Task creation failed.');
    expect(errorMessages.length > 0).toBe(true);
  });

  it('updates task subtasks inline when adding and removing subtasks', async () => {
    await renderAuthenticatedApp();

    const addInput = await screen.findByPlaceholderText('Teilaufgabe hinzufügen...');
    fireEvent.change(addInput, {
      target: {
        value: 'Inline added subtask',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));

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
    fireEvent.click(await screen.findByRole('button', { name: 'Teilaufgabe Initial subtask entfernen' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Zeitachse' }));
    fireEvent.click(await screen.findByRole('button', { name: /Initial task/i }));

    expect(await screen.findByRole('heading', { name: 'Aufgabe #11 bearbeiten' })).toBeTruthy();
  });
});

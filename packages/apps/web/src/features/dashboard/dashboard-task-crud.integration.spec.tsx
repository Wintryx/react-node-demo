import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { dashboardCopy } from './dashboard-copy';
import {
  confirmActionDialog,
  getDashboardApiMocks,
  openCreateTaskModal,
  openEditTaskModal,
  openTaskDeleteDialog,
  renderAuthenticatedApp,
  resetDashboardApiMocks,
  setInputValueByLabel,
} from './dashboard-integration-test-utils';

describe('Dashboard task CRUD integration', () => {
  const { createTaskMock, updateTaskMock, deleteTaskMock } =
    getDashboardApiMocks();

  beforeEach(() => {
    resetDashboardApiMocks();
  });

  it('creates a task from the modal', async () => {
    await renderAuthenticatedApp();

    await openCreateTaskModal();
    setInputValueByLabel('Title', 'Newly created task');
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

  it('shows modal validation errors for empty task title and invalid subtasks', async () => {
    await renderAuthenticatedApp();

    await openCreateTaskModal();
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));

    const requiredTitleMessage = await screen.findByText(dashboardCopy.tasks.validations.titleRequired);
    expect(requiredTitleMessage).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();

    setInputValueByLabel('Title', 'Task with invalid subtask');
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.subtasks.addSubtask }));
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.create }));

    const invalidSubtaskMessage = await screen.findByText(dashboardCopy.tasks.validations.subtaskInvalid);
    expect(invalidSubtaskMessage).toBeTruthy();
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it('updates a task through the edit modal', async () => {
    await renderAuthenticatedApp();

    await openEditTaskModal();
    setInputValueByLabel('Title', 'Updated task title');
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

    await openEditTaskModal();
    setInputValueByLabel('Title', 'Updated but failing');
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.saveChanges }));

    const errorMessages = await screen.findAllByText('Task update failed.');
    expect(errorMessages.length > 0).toBe(true);
  });

  it('deletes a task after confirmation', async () => {
    await renderAuthenticatedApp();

    await openTaskDeleteDialog();
    confirmActionDialog();

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith(11);
    });
  });

  it('does not delete a task when confirmation is cancelled', async () => {
    await renderAuthenticatedApp();

    await openTaskDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.common.cancel }));
    expect(deleteTaskMock).not.toHaveBeenCalled();
  });

  it('shows API error feedback when delete fails', async () => {
    deleteTaskMock.mockRejectedValueOnce(new Error('Task delete failed.'));
    await renderAuthenticatedApp();

    await openTaskDeleteDialog();
    confirmActionDialog();

    const errorMessage = await screen.findByText('Task delete failed.');
    expect(errorMessage).toBeTruthy();
  });

  it('shows API error feedback when create fails', async () => {
    createTaskMock.mockRejectedValueOnce(new Error('Task creation failed.'));
    await renderAuthenticatedApp();

    await openCreateTaskModal();
    setInputValueByLabel('Title', 'Broken task');
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
});

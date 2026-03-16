import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toUpsertSubtaskRequests } from './task-request-mapper';
import { tasksApi } from '../../shared/api';
import { CreateTaskRequest, Task, UpdateTaskRequest, UpsertSubtaskRequest } from '../../shared/api/types';

interface UseTaskMutationsResult {
  actionError: string | null;
  isMutating: boolean;
  clearActionError(): void;
  createTask(payload: CreateTaskRequest): Promise<void>;
  updateTask(taskId: number, payload: UpdateTaskRequest): Promise<void>;
  deleteTask(task: Task): Promise<void>;
  toggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  addSubtask(task: Task, title: string): void;
  removeSubtask(task: Task, subtaskId: number): void;
}

const mapError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed. Please try again.';
};

export const useTaskMutations = (): UseTaskMutationsResult => {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidateTasks = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ['tasks'],
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskRequest) => tasksApi.create(payload),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskRequest }) =>
      tasksApi.update(taskId, payload),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const isMutating =
    createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending;

  const runMutation = async (execute: () => Promise<void>): Promise<void> => {
    setActionError(null);

    try {
      await execute();
    } catch (error: unknown) {
      setActionError(mapError(error));
      throw error;
    }
  };

  const createTask = async (payload: CreateTaskRequest): Promise<void> => {
    await runMutation(async () => {
      await createTaskMutation.mutateAsync(payload);
    });
  };

  const updateTask = async (taskId: number, payload: UpdateTaskRequest): Promise<void> => {
    await runMutation(async () => {
      await updateTaskMutation.mutateAsync({ taskId, payload });
    });
  };

  const deleteTask = async (task: Task): Promise<void> => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    await runMutation(async () => {
      await deleteTaskMutation.mutateAsync(task.id);
    });
  };

  const updateTaskSubtasksInline = async (
    task: Task,
    subtasks: UpsertSubtaskRequest[],
  ): Promise<void> => {
    try {
      await updateTask(task.id, { subtasks });
    } catch {
      // Error state is already managed inside updateTask.
    }
  };

  const toggleSubtask = (task: Task, subtaskId: number, completed: boolean): void => {
    const subtasks = toUpsertSubtaskRequests(task).map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed } : subtask,
    );

    void updateTaskSubtasksInline(task, subtasks);
  };

  const addSubtask = (task: Task, title: string): void => {
    const subtasks = [
      ...toUpsertSubtaskRequests(task),
      {
        title,
        completed: false,
        startDate: task.startDate,
      },
    ];

    void updateTaskSubtasksInline(task, subtasks);
  };

  const removeSubtask = (task: Task, subtaskId: number): void => {
    const subtasks = toUpsertSubtaskRequests(task).filter((subtask) => subtask.id !== subtaskId);

    void updateTaskSubtasksInline(task, subtasks);
  };

  return {
    actionError,
    isMutating,
    clearActionError: () => setActionError(null),
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    removeSubtask,
  };
};

import { apiClient } from './client';
import { normalizeApiError } from './errors';
import { CreateTaskRequest, Task, UpdateTaskRequest } from './types';

export const tasksApi = {
  listByEmployee: async (employeeId: number): Promise<Task[]> => {
    try {
      const response = await apiClient.get<Task[]>('/tasks', {
        params: {
          employeeId,
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  create: async (payload: CreateTaskRequest): Promise<Task> => {
    try {
      const response = await apiClient.post<Task>('/tasks', payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  update: async (taskId: number, payload: UpdateTaskRequest): Promise<Task> => {
    try {
      const response = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  delete: async (taskId: number): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

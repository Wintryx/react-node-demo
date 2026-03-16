import { apiClient } from './client';
import { normalizeApiError } from './errors';
import { Employee } from './types';

export const employeesApi = {
  list: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<Employee[]>('/employees');
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

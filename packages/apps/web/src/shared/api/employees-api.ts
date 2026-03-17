import { Employee } from '@react-node-demo/shared-contracts';

import { apiClient } from './client';
import { normalizeApiError } from './errors';

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

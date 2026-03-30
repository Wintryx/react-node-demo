import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '@react-node-demo/shared-contracts';

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
  create: async (payload: CreateEmployeeRequest): Promise<Employee> => {
    try {
      const response = await apiClient.post<Employee>('/employees', payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  update: async (employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee> => {
    try {
      const response = await apiClient.patch<Employee>(`/employees/${employeeId}`, payload);
      return response.data;
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
  delete: async (employeeId: number): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${employeeId}`);
    } catch (error: unknown) {
      throw normalizeApiError(error);
    }
  },
};

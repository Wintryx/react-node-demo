import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { employeesApi } from '../../../shared/api';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../../../shared/api/types';
import { useToast } from '../../notifications/toast-context';
import { dashboardCopy } from '../dashboard-copy';
import { getEmployeeDisplayName } from '../utils';
import { executeMutation } from './mutation-utils';

interface UseEmployeeMutationsResult {
  actionError: string | null;
  isMutating: boolean;
  clearActionError(): void;
  createEmployee(payload: CreateEmployeeRequest): Promise<Employee>;
  updateEmployee(employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee>;
  deleteEmployee(employee: Employee): Promise<void>;
}

export const useEmployeeMutations = (): UseEmployeeMutationsResult => {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidateEmployeeRelatedQueries = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ['employees'],
    });
    await queryClient.invalidateQueries({
      queryKey: ['tasks'],
    });
  };

  const createEmployeeMutation = useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => employeesApi.create(payload),
    onSuccess: async () => {
      await invalidateEmployeeRelatedQueries();
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number; payload: UpdateEmployeeRequest }) =>
      employeesApi.update(employeeId, payload),
    onSuccess: async () => {
      await invalidateEmployeeRelatedQueries();
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId: number) => employeesApi.delete(employeeId),
    onSuccess: async () => {
      await invalidateEmployeeRelatedQueries();
    },
  });

  const runMutation = async <T>(execute: () => Promise<T>): Promise<T> =>
    executeMutation(setActionError, execute);

  const createEmployee = async (payload: CreateEmployeeRequest): Promise<Employee> =>
    runMutation(async () => {
      const employee = await createEmployeeMutation.mutateAsync(payload);
      success(
        dashboardCopy.employees.createdToastTitle,
        dashboardCopy.employees.createdToastDescription(getEmployeeDisplayName(employee)),
      );
      return employee;
    });

  const updateEmployee = async (
    employeeId: number,
    payload: UpdateEmployeeRequest,
  ): Promise<Employee> =>
    runMutation(async () => {
      const employee = await updateEmployeeMutation.mutateAsync({ employeeId, payload });
      success(
        dashboardCopy.employees.updatedToastTitle,
        dashboardCopy.employees.updatedToastDescription(getEmployeeDisplayName(employee)),
      );
      return employee;
    });

  const deleteEmployee = async (employee: Employee): Promise<void> => {
    await runMutation(async () => {
      await deleteEmployeeMutation.mutateAsync(employee.id);
      success(
        dashboardCopy.employees.deletedToastTitle,
        dashboardCopy.employees.deletedToastDescription(getEmployeeDisplayName(employee)),
      );
    });
  };

  return {
    actionError,
    isMutating:
      createEmployeeMutation.isPending ||
      updateEmployeeMutation.isPending ||
      deleteEmployeeMutation.isPending,
    clearActionError: () => setActionError(null),
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

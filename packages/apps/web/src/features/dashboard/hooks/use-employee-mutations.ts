import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { employeesApi } from '../../../shared/api';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../../../shared/api/types';
import { useToast } from '../../notifications/toast-context';
import { getEmployeeDisplayName } from '../utils';

interface UseEmployeeMutationsResult {
  actionError: string | null;
  isMutating: boolean;
  clearActionError(): void;
  createEmployee(payload: CreateEmployeeRequest): Promise<Employee>;
  updateEmployee(employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee>;
  deleteEmployee(employee: Employee): Promise<void>;
}

const mapError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Anfrage fehlgeschlagen. Bitte erneut versuchen.';
};

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

  const runMutation = async <T>(execute: () => Promise<T>): Promise<T> => {
    setActionError(null);

    try {
      return await execute();
    } catch (error: unknown) {
      setActionError(mapError(error));
      throw error;
    }
  };

  const createEmployee = async (payload: CreateEmployeeRequest): Promise<Employee> =>
    runMutation(async () => {
      const employee = await createEmployeeMutation.mutateAsync(payload);
      success('Mitarbeitende Person erstellt', `${getEmployeeDisplayName(employee)} wurde angelegt.`);
      return employee;
    });

  const updateEmployee = async (
    employeeId: number,
    payload: UpdateEmployeeRequest,
  ): Promise<Employee> =>
    runMutation(async () => {
      const employee = await updateEmployeeMutation.mutateAsync({ employeeId, payload });
      success(
        'Mitarbeitende Person aktualisiert',
        `${getEmployeeDisplayName(employee)} wurde gespeichert.`,
      );
      return employee;
    });

  const deleteEmployee = async (employee: Employee): Promise<void> => {
    const confirmed = window.confirm(`Mitarbeitende Person "${getEmployeeDisplayName(employee)}" löschen?`);
    if (!confirmed) {
      return;
    }

    await runMutation(async () => {
      await deleteEmployeeMutation.mutateAsync(employee.id);
      success(
        'Mitarbeitende Person gelöscht',
        `${getEmployeeDisplayName(employee)} wurde gelöscht.`,
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

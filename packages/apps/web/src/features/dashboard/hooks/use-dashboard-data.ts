import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { employeesApi, tasksApi } from '../../../shared/api';
import { Employee, Task } from '../../../shared/api/types';

interface UseDashboardDataResult {
  employees: Employee[];
  tasks: Task[];
  selectedEmployeeId: number | null;
  effectiveSelectedEmployeeId: number | null;
  setSelectedEmployeeId(employeeId: number | null): void;
  isEmployeesLoading: boolean;
  isEmployeesError: boolean;
  employeesError: Error | null;
  isTasksLoading: boolean;
  isTasksError: boolean;
  isTasksFetching: boolean;
  tasksError: Error | null;
  refreshData(): void;
}

export const useDashboardData = (): UseDashboardDataResult => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const employeesQuery = useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  });

  const employees = employeesQuery.data ?? [];
  const selectedEmployeeExists =
    selectedEmployeeId === null || employees.some((employee) => employee.id === selectedEmployeeId);
  const effectiveSelectedEmployeeId = selectedEmployeeExists ? selectedEmployeeId : null;

  const tasksQuery = useQuery<Task[], Error>({
    queryKey: ['tasks', effectiveSelectedEmployeeId],
    queryFn: () => tasksApi.list(effectiveSelectedEmployeeId ?? undefined),
    enabled: employees.length > 0,
  });

  const refreshData = (): void => {
    void employeesQuery.refetch();
    void tasksQuery.refetch();
  };

  return {
    employees,
    tasks: tasksQuery.data ?? [],
    selectedEmployeeId,
    effectiveSelectedEmployeeId,
    setSelectedEmployeeId,
    isEmployeesLoading: employeesQuery.isLoading,
    isEmployeesError: employeesQuery.isError,
    employeesError: employeesQuery.error,
    isTasksLoading: tasksQuery.isLoading,
    isTasksError: tasksQuery.isError,
    isTasksFetching: tasksQuery.isFetching,
    tasksError: tasksQuery.error,
    refreshData,
  };
};

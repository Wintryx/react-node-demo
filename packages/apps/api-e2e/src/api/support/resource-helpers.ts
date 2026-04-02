import { AxiosInstance } from 'axios';

import { EmployeeResponse, TaskResponse } from './api-types';
import { buildEmployeePayload, buildTaskPayload, buildUniqueSuffix } from './fixtures';

export const createEmployeeForTest = async (
  client: AxiosInstance,
  suffix = buildUniqueSuffix(),
): Promise<EmployeeResponse> => {
  const response = await client.post<EmployeeResponse>(
    '/employees',
    buildEmployeePayload(suffix),
  );

  return response.data;
};

export const createTaskForTest = async (
  client: AxiosInstance,
  employeeId: number,
  suffix = buildUniqueSuffix(),
): Promise<TaskResponse> => {
  const response = await client.post<TaskResponse>(
    '/tasks',
    buildTaskPayload(employeeId, suffix),
  );

  return response.data;
};

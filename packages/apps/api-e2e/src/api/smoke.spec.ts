import { AxiosInstance } from 'axios';

import { EmployeeResponse, TaskResponse } from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildEmployeePayload, buildTaskPayload, buildUniqueSuffix } from './support/fixtures';

describe('Smoke E2E', () => {
  let authContext: AuthContext;
  let client: AxiosInstance;

  beforeAll(async () => {
    authContext = await createAuthContext();
    client = authContext.client;
  });

  it('runs the central authenticated workflow without regressions', async () => {
    const suffix = buildUniqueSuffix();
    const createdEmployee = await client.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(suffix),
    );

    expect(createdEmployee.status).toBe(201);
    expect(createdEmployee.data.id).toBeGreaterThan(0);

    const createdTask = await client.post<TaskResponse>(
      '/tasks',
      buildTaskPayload(createdEmployee.data.id, suffix),
    );

    expect(createdTask.status).toBe(201);
    expect(createdTask.data.employeeId).toBe(createdEmployee.data.id);

    const filteredTasks = await client.get<TaskResponse[]>(
      `/tasks?employeeId=${createdEmployee.data.id}`,
    );
    expect(filteredTasks.status).toBe(200);
    expect(filteredTasks.data.some((task) => task.id === createdTask.data.id)).toBe(true);

    const updatedTask = await client.patch<TaskResponse>(`/tasks/${createdTask.data.id}`, {
      status: 'done',
    });
    expect(updatedTask.status).toBe(200);
    expect(updatedTask.data.status).toBe('done');

    const deleteTaskResponse = await client.delete(`/tasks/${createdTask.data.id}`);
    expect(deleteTaskResponse.status).toBe(204);

    const deleteEmployeeResponse = await client.delete(`/employees/${createdEmployee.data.id}`);
    expect(deleteEmployeeResponse.status).toBe(204);
  });
});

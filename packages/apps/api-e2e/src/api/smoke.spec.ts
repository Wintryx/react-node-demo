import { AxiosInstance } from 'axios';

import { TaskResponse } from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildUniqueSuffix } from './support/fixtures';
import { createEmployeeForTest, createTaskForTest } from './support/resource-helpers';

describe('Smoke E2E', () => {
  let authContext: AuthContext;
  let client: AxiosInstance;

  beforeAll(async () => {
    authContext = await createAuthContext();
    client = authContext.client;
  });

  it('runs the central authenticated workflow without regressions', async () => {
    const suffix = buildUniqueSuffix();
    const createdEmployee = await createEmployeeForTest(client, suffix);

    expect(createdEmployee.id).toBeGreaterThan(0);

    const createdTask = await createTaskForTest(client, createdEmployee.id, suffix);

    expect(createdTask.employeeId).toBe(createdEmployee.id);

    const filteredTasks = await client.get<TaskResponse[]>(
      `/tasks?employeeId=${createdEmployee.id}`,
    );
    expect(filteredTasks.status).toBe(200);
    expect(filteredTasks.data.some((task) => task.id === createdTask.id)).toBe(true);

    const updatedTask = await client.patch<TaskResponse>(`/tasks/${createdTask.id}`, {
      status: 'done',
    });
    expect(updatedTask.status).toBe(200);
    expect(updatedTask.data.status).toBe('done');

    const deleteTaskResponse = await client.delete(`/tasks/${createdTask.id}`);
    expect(deleteTaskResponse.status).toBe(204);

    const deleteEmployeeResponse = await client.delete(`/employees/${createdEmployee.id}`);
    expect(deleteEmployeeResponse.status).toBe(204);
  });
});

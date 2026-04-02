import { AxiosInstance } from 'axios';

import {
  CreateTaskRequest,
  TaskResponse,
  TaskStatus,
} from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildTaskPayload, buildUniqueSuffix } from './support/fixtures';
import { expectHttpError, expectHttpErrorCode } from './support/http-assertions';
import { createEmployeeForTest, createTaskForTest } from './support/resource-helpers';

describe('Tasks API', () => {
  let authContext: AuthContext;
  let client: AxiosInstance;

  beforeAll(async () => {
    authContext = await createAuthContext();
    client = authContext.client;
  });

  it('creates a task and filters by employeeId', async () => {
    const employee = await createEmployeeForTest(client);
    const payload = buildTaskPayload(employee.id, buildUniqueSuffix());

    const createRes = await client.post<TaskResponse>('/tasks', payload);
    expect(createRes.status).toBe(201);
    expect(createRes.data.title).toBe(payload.title);
    expect(createRes.data.employeeId).toBe(employee.id);
    expect(createRes.data.subtasks).toHaveLength(1);

    const listRes = await client.get<TaskResponse[]>(`/tasks?employeeId=${employee.id}`);
    expect(listRes.status).toBe(200);
    expect(listRes.data.some((task) => task.id === createRes.data.id)).toBe(true);
  });

  it('returns 400 when dueDate is before startDate', async () => {
    const employee = await createEmployeeForTest(client);

    const invalidDatesPayload: CreateTaskRequest = {
      title: 'Invalid date task',
      employeeId: employee.id,
      startDate: '2026-04-10T08:00:00.000Z',
      dueDate: '2026-04-09T08:00:00.000Z',
    };

    const invalidDateError = await expectHttpError(client.post('/tasks', invalidDatesPayload), 400);
    expectHttpErrorCode(invalidDateError, 'TASK_DATE_RANGE_INVALID');
  });

  it('updates task fields and subtasks', async () => {
    const employee = await createEmployeeForTest(client);
    const payload = buildTaskPayload(employee.id, buildUniqueSuffix());
    const created = await client.post<TaskResponse>('/tasks', payload);

    const updatedTitle = `Updated-${buildUniqueSuffix()}`;
    const patchRes = await client.patch<TaskResponse>(`/tasks/${created.data.id}`, {
      title: updatedTitle,
      status: 'in-progress' as TaskStatus,
      subtasks: created.data.subtasks.map((subtask) => ({
        id: subtask.id,
        title: `${subtask.title}-updated`,
        completed: true,
        startDate: subtask.startDate,
        endDate: subtask.endDate ?? undefined,
        assigneeId: employee.id,
      })),
    });

    expect(patchRes.status).toBe(200);
    expect(patchRes.data.title).toBe(updatedTitle);
    expect(patchRes.data.status).toBe('in-progress');
    expect(patchRes.data.subtasks[0]?.completed).toBe(true);
  });

  it('clears dueDate when patch payload sets dueDate to null', async () => {
    const employee = await createEmployeeForTest(client);
    const createdTask = await createTaskForTest(client, employee.id);

    expect(createdTask.dueDate).not.toBeNull();

    const patchRes = await client.patch<TaskResponse>(`/tasks/${createdTask.id}`, {
      dueDate: null,
    });

    expect(patchRes.status).toBe(200);
    expect(patchRes.data.dueDate).toBeNull();
  });

  it('deletes a task and returns 404 on second delete', async () => {
    const employee = await createEmployeeForTest(client);
    const createdTask = await createTaskForTest(client, employee.id);

    const deleteRes = await client.delete(`/tasks/${createdTask.id}`);
    expect(deleteRes.status).toBe(204);

    const notFoundError = await expectHttpError(client.delete(`/tasks/${createdTask.id}`), 404);
    expectHttpErrorCode(notFoundError, 'TASK_NOT_FOUND');
  });
});

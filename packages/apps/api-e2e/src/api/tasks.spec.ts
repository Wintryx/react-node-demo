import { AxiosInstance } from 'axios';

import { AuthContext, createAuthContext } from './support/auth-helpers';
import {
  CreateTaskRequest,
  EmployeeResponse,
  TaskResponse,
  TaskStatus,
} from './support/api-types';
import { buildEmployeePayload, buildTaskPayload, buildUniqueSuffix } from './support/fixtures';
import { expectHttpError } from './support/http-assertions';

describe('Tasks API', () => {
  let authContext: AuthContext;
  let client: AxiosInstance;

  beforeAll(async () => {
    authContext = await createAuthContext();
    client = authContext.client;
  });

  it('creates a task and filters by employeeId', async () => {
    const employee = await client.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
    );
    const payload = buildTaskPayload(employee.data.id, buildUniqueSuffix());

    const createRes = await client.post<TaskResponse>('/tasks', payload);
    expect(createRes.status).toBe(201);
    expect(createRes.data.title).toBe(payload.title);
    expect(createRes.data.employeeId).toBe(employee.data.id);
    expect(createRes.data.subtasks).toHaveLength(1);

    const listRes = await client.get<TaskResponse[]>(`/tasks?employeeId=${employee.data.id}`);
    expect(listRes.status).toBe(200);
    expect(listRes.data.some((task) => task.id === createRes.data.id)).toBe(true);
  });

  it('returns 400 when dueDate is before startDate', async () => {
    const employee = await client.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
    );

    const invalidDatesPayload: CreateTaskRequest = {
      title: 'Invalid date task',
      employeeId: employee.data.id,
      startDate: '2026-04-10T08:00:00.000Z',
      dueDate: '2026-04-09T08:00:00.000Z',
    };

    const invalidDateError = await expectHttpError(client.post('/tasks', invalidDatesPayload), 400);
    expect(String(invalidDateError.response?.data?.message ?? '')).toContain('dueDate');
  });

  it('updates task fields and subtasks', async () => {
    const employee = await client.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
    );
    const payload = buildTaskPayload(employee.data.id, buildUniqueSuffix());
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
        assigneeId: employee.data.id,
      })),
    });

    expect(patchRes.status).toBe(200);
    expect(patchRes.data.title).toBe(updatedTitle);
    expect(patchRes.data.status).toBe('in-progress');
    expect(patchRes.data.subtasks[0]?.completed).toBe(true);
  });

  it('deletes a task and returns 404 on second delete', async () => {
    const employee = await client.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
    );
    const created = await client.post<TaskResponse>(
      '/tasks',
      buildTaskPayload(employee.data.id, buildUniqueSuffix()),
    );

    const deleteRes = await client.delete(`/tasks/${created.data.id}`);
    expect(deleteRes.status).toBe(204);

    await expectHttpError(client.delete(`/tasks/${created.data.id}`), 404);
  });
});

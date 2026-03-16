import axios from 'axios';

type EmployeeRole =
  | 'developer'
  | 'team-lead'
  | 'engineering-manager'
  | 'product-manager'
  | 'designer'
  | 'qa-engineer'
  | 'devops-engineer';

type EmployeeDepartment = 'engineering' | 'product' | 'design' | 'qa' | 'operations' | 'people';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface RegisterRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: number;
    email: string;
    createdAt: string;
  };
}

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
}

interface EmployeeResponse extends CreateEmployeeRequest {
  id: number;
  createdAt: string;
}

interface SubtaskResponse {
  id: number;
  title: string;
  completed: boolean;
  startDate: string;
  endDate: string | null;
  assignee: { id: number; name: string } | null;
}

interface CreateSubtaskRequest {
  id?: number;
  title: string;
  completed?: boolean;
  startDate: string;
  endDate?: string;
  assigneeId?: number;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate: string;
  dueDate?: string;
  employeeId: number;
  subtasks?: CreateSubtaskRequest[];
}

interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string | null;
  createdAt: string;
  employeeId: number;
  subtasks: SubtaskResponse[];
}

const buildUniqueSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

const buildAuthPayload = (suffix: string): RegisterRequest => ({
  email: `auth.${suffix}@example.com`,
  password: `StrongPassword!1-${suffix}`,
});

const buildEmployeePayload = (suffix: string): CreateEmployeeRequest => ({
  firstName: 'Arne',
  lastName: `Winter-${suffix}`,
  email: `arne.${suffix}@example.com`,
  role: 'developer',
  department: 'engineering',
});

const buildTaskPayload = (employeeId: number, suffix: string): CreateTaskRequest => ({
  title: `Task-${suffix}`,
  description: 'Initial task for API e2e',
  startDate: '2026-04-01T08:00:00.000Z',
  dueDate: '2026-04-03T18:00:00.000Z',
  employeeId,
  subtasks: [
    {
      title: `Subtask-${suffix}`,
      completed: false,
      startDate: '2026-04-01T09:00:00.000Z',
      endDate: '2026-04-02T17:00:00.000Z',
      assigneeId: employeeId,
    },
  ],
});

const buildAuthHeader = (accessToken: string): { Authorization: string } => ({
  Authorization: `Bearer ${accessToken}`,
});

let sharedAuthPayload: RegisterRequest;
let sharedAccessToken: string;

beforeAll(async () => {
  sharedAuthPayload = buildAuthPayload(buildUniqueSuffix());
  const response = await axios.post<AuthResponse>('/auth/register', sharedAuthPayload);
  sharedAccessToken = response.data.accessToken;
});

describe('GET /health', () => {
  it('should return service health', async () => {
    const res = await axios.get('/health');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});

describe('Auth API', () => {
  it('registers a new user and returns bearer token response', async () => {
    const payload = buildAuthPayload(buildUniqueSuffix());
    const res = await axios.post<AuthResponse>('/auth/register', payload);

    expect(res.status).toBe(201);
    expect(res.data.tokenType).toBe('Bearer');
    expect(res.data.accessToken.length).toBeGreaterThan(20);
    expect(res.data.user.email).toBe(payload.email.toLowerCase());
  });

  it('returns 409 for duplicate email (case-insensitive)', async () => {
    try {
      await axios.post('/auth/register', {
        ...sharedAuthPayload,
        email: sharedAuthPayload.email.toUpperCase(),
      } satisfies RegisterRequest);
      fail('Expected duplicate register request to fail with 409.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(409);
    }
  });

  it('logs in an existing user', async () => {
    const loginRes = await axios.post<AuthResponse>('/auth/login', sharedAuthPayload);
    expect(loginRes.status).toBe(200);
    expect(loginRes.data.accessToken.length).toBeGreaterThan(20);
    expect(loginRes.data.user.email).toBe(sharedAuthPayload.email.toLowerCase());
  });

  it('returns 401 for invalid credentials', async () => {
    try {
      await axios.post('/auth/login', {
        email: sharedAuthPayload.email,
        password: 'WrongPassword!1',
      } satisfies RegisterRequest);
      fail('Expected invalid login to fail with 401.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(401);
    }
  });

  it('blocks protected endpoints without access token', async () => {
    try {
      await axios.get('/employees');
      fail('Expected unauthorized request to fail with 401.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(401);
    }
  });

  it('allows protected endpoints with access token', async () => {
    const res = await axios.get<EmployeeResponse[]>('/employees', {
      headers: buildAuthHeader(sharedAccessToken),
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

describe('Employees API', () => {
  it('creates an employee and returns it in the list', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const createRes = await axios.post<EmployeeResponse>('/employees', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    expect(createRes.status).toBe(201);
    expect(createRes.data).toEqual({
      ...payload,
      id: expect.any(Number),
      createdAt: expect.any(String),
    });

    const listRes = await axios.get<EmployeeResponse[]>('/employees', {
      headers: buildAuthHeader(sharedAccessToken),
    });
    expect(listRes.status).toBe(200);
    expect(
      listRes.data.some((employee) => employee.id === createRes.data.id && employee.email === payload.email),
    ).toBe(true);
  });

  it('returns 409 for duplicate emails (case-insensitive)', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    await axios.post<EmployeeResponse>('/employees', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    const duplicatePayload: CreateEmployeeRequest = {
      ...payload,
      email: payload.email.toUpperCase(),
    };

    try {
      await axios.post('/employees', duplicatePayload, {
        headers: buildAuthHeader(sharedAccessToken),
      });
      fail('Expected duplicate email request to fail with 409.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(409);
      expect(String(error.response?.data?.message ?? '')).toContain('already exists');
    }
  });

  it('returns 400 for invalid enum values', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());

    try {
      await axios.post(
        '/employees',
        {
          ...payload,
          role: 'invalid-role',
        },
        {
          headers: buildAuthHeader(sharedAccessToken),
        },
      );
      fail('Expected invalid enum request to fail with 400.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(400);
      expect(Array.isArray(error.response?.data?.message)).toBe(true);
    }
  });

  it('updates an employee and normalizes email', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const created = await axios.post<EmployeeResponse>('/employees', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    const patchPayload = {
      role: 'team-lead' as EmployeeRole,
      department: 'product' as EmployeeDepartment,
      email: `UPDATED.${buildUniqueSuffix()}@EXAMPLE.COM`,
    };
    const updateRes = await axios.patch<EmployeeResponse>(`/employees/${created.data.id}`, patchPayload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.data.role).toBe('team-lead');
    expect(updateRes.data.department).toBe('product');
    expect(updateRes.data.email).toBe(patchPayload.email.toLowerCase());
  });

  it('deletes an employee and returns 404 on second delete', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const created = await axios.post<EmployeeResponse>('/employees', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    const deleteRes = await axios.delete(`/employees/${created.data.id}`, {
      headers: buildAuthHeader(sharedAccessToken),
    });
    expect(deleteRes.status).toBe(204);

    try {
      await axios.delete(`/employees/${created.data.id}`, {
        headers: buildAuthHeader(sharedAccessToken),
      });
      fail('Expected deleting non-existing employee to fail with 404.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(404);
    }
  });

  it('returns 409 when deleting employee with assigned tasks', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const createdEmployee = await axios.post<EmployeeResponse>('/employees', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });
    await axios.post('/tasks', buildTaskPayload(createdEmployee.data.id, buildUniqueSuffix()), {
      headers: buildAuthHeader(sharedAccessToken),
    });

    try {
      await axios.delete(`/employees/${createdEmployee.data.id}`, {
        headers: buildAuthHeader(sharedAccessToken),
      });
      fail('Expected deleting employee with assigned tasks to fail with 409.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }
      expect(error.response?.status).toBe(409);
    }
  });
});

describe('Tasks API', () => {
  it('creates a task and filters by employeeId', async () => {
    const employee = await axios.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );
    const payload = buildTaskPayload(employee.data.id, buildUniqueSuffix());

    const createRes = await axios.post<TaskResponse>('/tasks', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });
    expect(createRes.status).toBe(201);
    expect(createRes.data.title).toBe(payload.title);
    expect(createRes.data.employeeId).toBe(employee.data.id);
    expect(createRes.data.subtasks).toHaveLength(1);

    const listRes = await axios.get<TaskResponse[]>(`/tasks?employeeId=${employee.data.id}`, {
      headers: buildAuthHeader(sharedAccessToken),
    });
    expect(listRes.status).toBe(200);
    expect(listRes.data.some((task) => task.id === createRes.data.id)).toBe(true);
  });

  it('returns 400 when dueDate is before startDate', async () => {
    const employee = await axios.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );

    try {
      await axios.post(
        '/tasks',
        {
          title: 'Invalid date task',
          employeeId: employee.data.id,
          startDate: '2026-04-10T08:00:00.000Z',
          dueDate: '2026-04-09T08:00:00.000Z',
        } satisfies CreateTaskRequest,
        {
          headers: buildAuthHeader(sharedAccessToken),
        },
      );
      fail('Expected date validation to fail with 400.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(400);
      expect(String(error.response?.data?.message ?? '')).toContain('dueDate');
    }
  });

  it('updates task fields and subtasks', async () => {
    const employee = await axios.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );
    const payload = buildTaskPayload(employee.data.id, buildUniqueSuffix());
    const created = await axios.post<TaskResponse>('/tasks', payload, {
      headers: buildAuthHeader(sharedAccessToken),
    });

    const updatedTitle = `Updated-${buildUniqueSuffix()}`;
    const patchRes = await axios.patch<TaskResponse>(
      `/tasks/${created.data.id}`,
      {
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
      },
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );

    expect(patchRes.status).toBe(200);
    expect(patchRes.data.title).toBe(updatedTitle);
    expect(patchRes.data.status).toBe('in-progress');
    expect(patchRes.data.subtasks[0]?.completed).toBe(true);
  });

  it('deletes a task and returns 404 on second delete', async () => {
    const employee = await axios.post<EmployeeResponse>(
      '/employees',
      buildEmployeePayload(buildUniqueSuffix()),
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );
    const created = await axios.post<TaskResponse>(
      '/tasks',
      buildTaskPayload(employee.data.id, buildUniqueSuffix()),
      {
        headers: buildAuthHeader(sharedAccessToken),
      },
    );

    const deleteRes = await axios.delete(`/tasks/${created.data.id}`, {
      headers: buildAuthHeader(sharedAccessToken),
    });
    expect(deleteRes.status).toBe(204);

    try {
      await axios.delete(`/tasks/${created.data.id}`, {
        headers: buildAuthHeader(sharedAccessToken),
      });
      fail('Expected deleting non-existing task to fail with 404.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }
      expect(error.response?.status).toBe(404);
    }
  });
});

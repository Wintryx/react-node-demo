import axios from 'axios';

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

type EmployeeRole =
  | 'developer'
  | 'team-lead'
  | 'engineering-manager'
  | 'product-manager'
  | 'designer'
  | 'qa-engineer'
  | 'devops-engineer';

type EmployeeDepartment = 'engineering' | 'product' | 'design' | 'qa' | 'operations' | 'people';

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

const buildUniqueSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

const buildEmployeePayload = (suffix: string): CreateEmployeeRequest => ({
  firstName: 'Arne',
  lastName: `Winter-${suffix}`,
  email: `arne.${suffix}@example.com`,
  role: 'developer',
  department: 'engineering',
});

describe('Employees API', () => {
  it('creates an employee and returns it in the list', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const createRes = await axios.post<EmployeeResponse>('/employees', payload);

    expect(createRes.status).toBe(201);
    expect(createRes.data).toEqual({
      ...payload,
      id: expect.any(Number),
      createdAt: expect.any(String),
    });

    const listRes = await axios.get<EmployeeResponse[]>('/employees');
    expect(listRes.status).toBe(200);
    expect(
      listRes.data.some((employee) => employee.id === createRes.data.id && employee.email === payload.email),
    ).toBe(true);
  });

  it('returns 409 for duplicate emails (case-insensitive)', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    await axios.post<EmployeeResponse>('/employees', payload);

    const duplicatePayload: CreateEmployeeRequest = {
      ...payload,
      email: payload.email.toUpperCase(),
    };

    try {
      await axios.post('/employees', duplicatePayload);
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
      await axios.post('/employees', {
        ...payload,
        role: 'invalid-role',
      });
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
    const created = await axios.post<EmployeeResponse>('/employees', payload);

    const patchPayload = {
      role: 'team-lead' as EmployeeRole,
      department: 'product' as EmployeeDepartment,
      email: `UPDATED.${buildUniqueSuffix()}@EXAMPLE.COM`,
    };
    const updateRes = await axios.patch<EmployeeResponse>(`/employees/${created.data.id}`, patchPayload);

    expect(updateRes.status).toBe(200);
    expect(updateRes.data.role).toBe('team-lead');
    expect(updateRes.data.department).toBe('product');
    expect(updateRes.data.email).toBe(patchPayload.email.toLowerCase());
  });

  it('deletes an employee and returns 404 on second delete', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const created = await axios.post<EmployeeResponse>('/employees', payload);

    const deleteRes = await axios.delete(`/employees/${created.data.id}`);
    expect(deleteRes.status).toBe(204);

    try {
      await axios.delete(`/employees/${created.data.id}`);
      fail('Expected deleting non-existing employee to fail with 404.');
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      expect(error.response?.status).toBe(404);
    }
  });
});

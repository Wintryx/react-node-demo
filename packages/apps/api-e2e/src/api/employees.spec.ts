import { AxiosInstance } from 'axios';

import {
  CreateEmployeeRequest,
  EmployeeDepartment,
  EmployeeResponse,
  EmployeeRole,
} from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildEmployeePayload, buildTaskPayload, buildUniqueSuffix } from './support/fixtures';
import { expectHttpError, expectHttpErrorCode } from './support/http-assertions';

describe('Employees API', () => {
  let authContext: AuthContext;
  let client: AxiosInstance;

  beforeAll(async () => {
    authContext = await createAuthContext();
    client = authContext.client;
  });

  it('creates an employee and returns it in the list', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const createRes = await client.post<EmployeeResponse>('/employees', payload);

    expect(createRes.status).toBe(201);
    expect(createRes.data).toEqual({
      ...payload,
      id: expect.any(Number),
      createdAt: expect.any(String),
    });

    const listRes = await client.get<EmployeeResponse[]>('/employees');
    expect(listRes.status).toBe(200);
    expect(
      listRes.data.some((employee) => employee.id === createRes.data.id && employee.email === payload.email),
    ).toBe(true);
  });

  it('returns 409 for duplicate emails (case-insensitive)', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    await client.post<EmployeeResponse>('/employees', payload);

    const duplicatePayload: CreateEmployeeRequest = {
      ...payload,
      email: payload.email.toUpperCase(),
    };

    const duplicateError = await expectHttpError(client.post('/employees', duplicatePayload), 409);
    expectHttpErrorCode(duplicateError, 'EMPLOYEE_EMAIL_ALREADY_EXISTS');
  });

  it('returns 400 for invalid enum values', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());

    const invalidRoleError = await expectHttpError(
      client.post('/employees', {
        ...payload,
        role: 'invalid-role',
      }),
      400,
    );
    expectHttpErrorCode(invalidRoleError, 'VALIDATION_ERROR');
    expect(Array.isArray(invalidRoleError.response?.data?.params?.errors)).toBe(true);
    expect(Array.isArray(invalidRoleError.response?.data?.validationIssues)).toBe(true);
    expect(invalidRoleError.response?.data?.validationIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'role',
          rule: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    );
  });

  it('updates an employee and normalizes email', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const created = await client.post<EmployeeResponse>('/employees', payload);

    const patchPayload = {
      role: 'team-lead' as EmployeeRole,
      department: 'product' as EmployeeDepartment,
      email: `UPDATED.${buildUniqueSuffix()}@EXAMPLE.COM`,
    };
    const updateRes = await client.patch<EmployeeResponse>(
      `/employees/${created.data.id}`,
      patchPayload,
    );

    expect(updateRes.status).toBe(200);
    expect(updateRes.data.role).toBe('team-lead');
    expect(updateRes.data.department).toBe('product');
    expect(updateRes.data.email).toBe(patchPayload.email.toLowerCase());
  });

  it('deletes an employee and returns 404 on second delete', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const created = await client.post<EmployeeResponse>('/employees', payload);

    const deleteRes = await client.delete(`/employees/${created.data.id}`);
    expect(deleteRes.status).toBe(204);

    await expectHttpError(client.delete(`/employees/${created.data.id}`), 404);
  });

  it('returns 409 when deleting employee with assigned tasks', async () => {
    const payload = buildEmployeePayload(buildUniqueSuffix());
    const createdEmployee = await client.post<EmployeeResponse>('/employees', payload);
    await client.post('/tasks', buildTaskPayload(createdEmployee.data.id, buildUniqueSuffix()));

    const conflictError = await expectHttpError(client.delete(`/employees/${createdEmployee.data.id}`), 409);
    expectHttpErrorCode(conflictError, 'EMPLOYEE_HAS_ASSIGNED_TASKS');
  });
});

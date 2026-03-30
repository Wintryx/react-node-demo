import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, postMock, patchMock, deleteMock, normalizeApiErrorMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
  normalizeApiErrorMock: vi.fn((error: unknown) => error),
}));

vi.mock('./client', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

vi.mock('./errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}));

import { employeesApi } from './employees-api';

describe('employeesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists employees', async () => {
    const responseData = [
      {
        id: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        role: 'developer',
        department: 'engineering',
        createdAt: '2026-03-30T10:00:00.000Z',
      },
    ];
    getMock.mockResolvedValue({ data: responseData });

    await expect(employeesApi.list()).resolves.toEqual(responseData);
    expect(getMock).toHaveBeenCalledWith('/employees');
  });

  it('creates employee', async () => {
    const payload = {
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      role: 'developer' as const,
      department: 'engineering' as const,
    };
    const created = {
      id: 2,
      ...payload,
      createdAt: '2026-03-30T10:00:00.000Z',
    };
    postMock.mockResolvedValue({ data: created });

    await expect(employeesApi.create(payload)).resolves.toEqual(created);
    expect(postMock).toHaveBeenCalledWith('/employees', payload);
  });

  it('updates employee', async () => {
    const payload = {
      role: 'team-lead' as const,
    };
    const updated = {
      id: 2,
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      role: 'team-lead' as const,
      department: 'engineering' as const,
      createdAt: '2026-03-30T10:00:00.000Z',
    };
    patchMock.mockResolvedValue({ data: updated });

    await expect(employeesApi.update(2, payload)).resolves.toEqual(updated);
    expect(patchMock).toHaveBeenCalledWith('/employees/2', payload);
  });

  it('deletes employee', async () => {
    deleteMock.mockResolvedValue(undefined);

    await expect(employeesApi.delete(2)).resolves.toBeUndefined();
    expect(deleteMock).toHaveBeenCalledWith('/employees/2');
  });

  it('normalizes API errors', async () => {
    const apiError = new Error('request failed');
    const normalizedError = new Error('normalized');
    getMock.mockRejectedValue(apiError);
    normalizeApiErrorMock.mockReturnValueOnce(normalizedError);

    await expect(employeesApi.list()).rejects.toBe(normalizedError);
    expect(normalizeApiErrorMock).toHaveBeenCalledWith(apiError);
  });
});

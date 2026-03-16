import { describe, expect, it } from 'vitest';

import { getEmployeeDisplayName } from './employee-display-name';
import { Employee } from '../../shared/api/types';

const createEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.lovelace@example.com',
  role: 'developer',
  department: 'engineering',
  createdAt: '2026-03-16T10:00:00.000Z',
  ...overrides,
});

describe('getEmployeeDisplayName', () => {
  it('returns first and last name for regular values', () => {
    expect(getEmployeeDisplayName(createEmployee())).toBe('Ada Lovelace');
  });

  it('strips generated hash-like suffixes from name parts', () => {
    expect(
      getEmployeeDisplayName(
        createEmployee({
          firstName: 'Max-12ab34cd',
          lastName: 'Mustermann',
        }),
      ),
    ).toBe('Max Mustermann');
  });

  it('falls back to email local-part when both names are empty after normalization', () => {
    expect(
      getEmployeeDisplayName(
        createEmployee({
          firstName: 'abcd1234efgh5678',
          lastName: '0011aa22bb33cc44',
          email: 'candidate.user@example.com',
        }),
      ),
    ).toBe('candidate user');
  });
});

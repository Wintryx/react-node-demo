import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { normalizeApiError } from './errors';
import { ApiErrorPayload } from './types';

const createAxiosError = (
  payload?: ApiErrorPayload,
  status = 400,
): AxiosError<ApiErrorPayload> =>
  ({
    isAxiosError: true,
    response: payload
      ? {
          status,
          data: payload,
        }
      : undefined,
  }) as AxiosError<ApiErrorPayload>;

describe('normalizeApiError', () => {
  it('maps known error code with params', () => {
    const error = createAxiosError({
      code: 'EMPLOYEE_NOT_FOUND',
      message: 'Employee with id "42" was not found.',
      params: {
        employeeId: 42,
      },
    }, 404);

    expect(normalizeApiError(error).message).toBe(
      'Mitarbeitende Person mit ID "42" wurde nicht gefunden.',
    );
  });

  it('maps validation errors by code and translates constraints', () => {
    const error = createAxiosError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      params: {
        errors: ['email must be an email'],
      },
    });

    expect(normalizeApiError(error).message).toBe('E-Mail muss gültig sein.');
  });

  it('uses payload message fallback for unknown codes', () => {
    const error = createAxiosError({
      code: 'UNKNOWN_ERROR_CODE',
      message: 'Something custom failed.',
    });

    expect(normalizeApiError(error).message).toBe('Something custom failed.');
  });

  it('maps network-level axios errors to CORS/network hint', () => {
    const error = createAxiosError(undefined);
    expect(normalizeApiError(error).message).toContain('Netzwerk-/CORS-Fehler');
  });
});

import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it } from 'vitest';

import { normalizeApiError } from './errors';
import { ApiErrorPayload } from './types';
import { setRuntimeLanguage } from '../i18n/runtime';

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
  beforeEach(() => {
    setRuntimeLanguage('en');
  });

  it('maps known error code with params', () => {
    const error = createAxiosError(
      {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee with id "42" was not found.',
        params: {
          employeeId: 42,
        },
      },
      404,
    );

    expect(normalizeApiError(error).message).toBe(
      'Employee with ID "42" was not found.',
    );
  });

  it('uses legacy params.errors as raw fallback when no structured validation issues exist', () => {
    const error = createAxiosError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      params: {
        errors: ['email must be an email'],
      },
    });

    expect(normalizeApiError(error).message).toBe('email must be an email');
  });

  it('prioritizes structured validationIssues over legacy params.errors', () => {
    const error = createAxiosError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      params: {
        errors: ['email must be an email'],
      },
      validationIssues: [
        {
          field: 'password',
          rule: 'minLength',
          message: 'password must be longer than or equal to 10 characters',
        },
      ],
    });

    expect(normalizeApiError(error).message).toBe(
      'password must be at least 10 characters long.',
    );
  });

  it('maps structured validationIssues in german', () => {
    setRuntimeLanguage('de');

    const error = createAxiosError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      validationIssues: [
        {
          field: 'email',
          rule: 'isEmail',
          message: 'email must be an email',
        },
      ],
    });

    expect(normalizeApiError(error).message).toBe('email muss eine gültige E-Mail sein.');
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
    expect(normalizeApiError(error).message).toContain('Network/CORS error');
  });

  it('maps interpolated known error code payloads', () => {
    const error = createAxiosError(
      {
        code: 'AUTH_EMAIL_ALREADY_EXISTS',
        message: 'A user with this email already exists.',
        params: {
          email: 'demo.user@example.com',
        },
      },
      409,
    );

    expect(normalizeApiError(error).message).toBe(
      'A user with email "demo.user@example.com" already exists.',
    );
  });

  it('maps non-axios errors to localized fallback message', () => {
    setRuntimeLanguage('de');

    expect(normalizeApiError(new Error('boom')).message).toBe(
      'Unerwarteter Fehler. Bitte erneut versuchen.',
    );
  });

  it('maps known error codes in german and keeps legacy validation fallback raw', () => {
    setRuntimeLanguage('de');

    const employeeError = createAxiosError(
      {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee with id "42" was not found.',
        params: {
          employeeId: 42,
        },
      },
      404,
    );

    expect(normalizeApiError(employeeError).message).toBe(
      'Mitarbeiter mit ID "42" wurde nicht gefunden.',
    );

    const validationError = createAxiosError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      params: {
        errors: ['email must be an email'],
      },
    });

    expect(normalizeApiError(validationError).message).toBe('email must be an email');
  });
});

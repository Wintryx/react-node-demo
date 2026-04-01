import { ApiErrorCode } from './api-error-code';
import { ApiErrorParams, ApiErrorPayload, ApiValidationIssue } from './api-error.types';

export const createApiErrorPayload = (
  code: ApiErrorCode,
  message: string,
  params?: ApiErrorParams,
  validationIssues?: ApiValidationIssue[],
): ApiErrorPayload => ({
  code,
  message,
  ...(params ? { params } : {}),
  ...(validationIssues && validationIssues.length > 0
    ? { validationIssues }
    : {}),
});

export const isApiErrorPayload = (value: unknown): value is ApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorPayload>;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
};

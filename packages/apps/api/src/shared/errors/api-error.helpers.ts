import { ApiErrorCode } from './api-error-code';
import { ApiErrorParams, ApiErrorPayload } from './api-error.types';

export const createApiErrorPayload = (
  code: ApiErrorCode,
  message: string,
  params?: ApiErrorParams,
): ApiErrorPayload => ({
  code,
  message,
  ...(params ? { params } : {}),
});

export const isApiErrorPayload = (value: unknown): value is ApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorPayload>;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
};

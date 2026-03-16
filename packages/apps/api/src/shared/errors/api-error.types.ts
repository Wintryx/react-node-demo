import { ApiErrorCode } from './api-error-code';

export type ApiErrorParams = Record<
  string,
  string | number | boolean | null | string[] | number[]
>;

export interface ApiErrorPayload {
  code: ApiErrorCode | string;
  message: string;
  params?: ApiErrorParams;
}

export interface ApiErrorResponseBody extends ApiErrorPayload {
  statusCode: number;
  timestamp: string;
  path: string;
}

import axios, { AxiosError } from 'axios';

interface ErrorResponseBody {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  params?: Record<string, unknown>;
  path?: string;
  timestamp?: string;
}

export const expectHttpError = async (
  request: Promise<unknown>,
  expectedStatus: number,
): Promise<AxiosError<ErrorResponseBody>> => {
  const error = await request.then(
    () => null,
    (caughtError: unknown) => caughtError,
  );

  if (!error) {
    throw new Error(`Expected request to fail with ${expectedStatus}.`);
  }

  if (!axios.isAxiosError<ErrorResponseBody>(error)) {
    throw error;
  }

  expect(error.response?.status).toBe(expectedStatus);
  return error;
};

export const expectHttpErrorCode = (
  error: AxiosError<ErrorResponseBody>,
  expectedCode: string,
): void => {
  expect(error.response?.data?.code).toBe(expectedCode);
};

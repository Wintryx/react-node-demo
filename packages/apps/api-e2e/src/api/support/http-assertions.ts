import axios, { AxiosError } from 'axios';

interface ErrorResponseBody {
  message?: string | string[];
}

export const expectHttpError = async (
  request: Promise<unknown>,
  expectedStatus: number,
): Promise<AxiosError<ErrorResponseBody>> => {
  try {
    await request;
    fail(`Expected request to fail with ${expectedStatus}.`);
  } catch (error: unknown) {
    if (!axios.isAxiosError<ErrorResponseBody>(error)) {
      throw error;
    }

    expect(error.response?.status).toBe(expectedStatus);
    return error;
  }
};

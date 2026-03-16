import axios from 'axios';

import { ApiErrorPayload } from './types';

export const normalizeApiError = (error: unknown): Error => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return new Error('Unexpected error. Please try again.');
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return new Error(message.join(' '));
  }

  if (typeof message === 'string' && message.length > 0) {
    return new Error(message);
  }

  return new Error('Request failed. Please try again.');
};

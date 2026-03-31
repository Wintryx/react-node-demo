import { ApiErrorPayload } from '@react-node-demo/shared-contracts';
import axios from 'axios';

type ApiErrorTranslator = (payload: ApiErrorPayload) => string;

const toNumberParam = (payload: ApiErrorPayload, key: string): number | null => {
  const value = payload.params?.[key];
  return typeof value === 'number' ? value : null;
};

const toStringParam = (payload: ApiErrorPayload, key: string): string | null => {
  const value = payload.params?.[key];
  return typeof value === 'string' ? value : null;
};

const toStringArrayParam = (payload: ApiErrorPayload, key: string): string[] => {
  const value = payload.params?.[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
};

const translateValidationConstraint = (message: string): string => {
  const rules: Array<{ pattern: RegExp; replace: string }> = [
    {
      pattern:
        /^password must contain at least one lowercase letter, one uppercase letter, one number and one special character\.$/,
      replace:
        'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
    {
      pattern: /^email must be an email$/,
      replace: 'Email must be valid.',
    },
    {
      pattern: /^password must be a string$/,
      replace: 'Password must be a string.',
    },
    {
      pattern: /^password must be longer than or equal to (\d+) characters$/,
      replace: 'Password must be at least $1 characters long.',
    },
    {
      pattern: /^password must be shorter than or equal to (\d+) characters$/,
      replace: 'Password must be at most $1 characters long.',
    },
    {
      pattern: /^(.+) must be a string$/,
      replace: '$1 must be a string.',
    },
    {
      pattern: /^(.+) must be an integer number$/,
      replace: '$1 must be an integer.',
    },
    {
      pattern: /^(.+) must not be less than (\d+)$/,
      replace: '$1 must not be less than $2.',
    },
    {
      pattern: /^(.+) must be a valid ISO 8601 date string$/,
      replace: '$1 must be a valid ISO-8601 date string.',
    },
  ];

  const match = rules.find((rule) => rule.pattern.test(message));
  if (!match) {
    return message;
  }

  return message.replace(match.pattern, match.replace);
};

const errorCodeTranslators: Record<string, ApiErrorTranslator> = {
  AUTH_INVALID_CREDENTIALS: () => 'Invalid email or password.',
  AUTH_EMAIL_ALREADY_EXISTS: (payload) => {
    const email = toStringParam(payload, 'email');
    return email
      ? `A user with email "${email}" already exists.`
      : 'A user with this email already exists.';
  },
  AUTH_REFRESH_TOKEN_INVALID: () => 'Session expired. Please sign in again.',
  EMPLOYEE_EMAIL_ALREADY_EXISTS: (payload) => {
    const email = toStringParam(payload, 'email');
    return email
      ? `An employee with email "${email}" already exists.`
      : 'An employee with this email already exists.';
  },
  EMPLOYEE_NOT_FOUND: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Employee with ID "${employeeId}" was not found.`
      : 'Employee was not found.';
  },
  EMPLOYEE_HAS_ASSIGNED_TASKS: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Employee with ID "${employeeId}" has assigned tasks and cannot be deleted.`
      : 'Employee has assigned tasks and cannot be deleted.';
  },
  TASK_NOT_FOUND: (payload) => {
    const taskId = toNumberParam(payload, 'taskId');
    return taskId !== null
      ? `Task with ID "${taskId}" was not found.`
      : 'Task was not found.';
  },
  TASK_EMPLOYEE_NOT_FOUND: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Employee with ID "${employeeId}" was not found.`
      : 'Employee was not found.';
  },
  TASK_SUBTASK_ASSIGNEE_NOT_FOUND: () =>
    'One or more subtask assignees do not exist.',
  TASK_SUBTASK_NOT_BELONG_TO_TASK: (payload) => {
    const subtaskId = toNumberParam(payload, 'subtaskId');
    const taskId = toNumberParam(payload, 'taskId');

    if (subtaskId !== null && taskId !== null) {
      return `Subtask "${subtaskId}" does not belong to task "${taskId}".`;
    }

    return 'Subtask does not belong to the specified task.';
  },
  TASK_DATE_RANGE_INVALID: () => 'Due date must not be before start date.',
  TASK_SUBTASK_DATE_RANGE_INVALID: (payload) => {
    const index = toNumberParam(payload, 'subtaskIndex');
    return index !== null
      ? `End date of subtask #${index + 1} must not be before start date.`
      : 'Subtask end date must not be before start date.';
  },
  TASK_EMPLOYEE_ID_QUERY_INVALID: () =>
    'Query parameter "employeeId" must be a positive integer.',
  VALIDATION_ERROR: (payload) => {
    const errors = toStringArrayParam(payload, 'errors');
    if (errors.length === 0) {
      return 'Validation failed.';
    }

    return errors.map((entry) => translateValidationConstraint(entry)).join(' ');
  },
  UNAUTHORIZED: () => 'Unauthorized.',
  FORBIDDEN: () => 'Access denied.',
  NOT_FOUND: () => 'Resource not found.',
  CONFLICT: () => 'Request conflict.',
  BAD_REQUEST: () => 'Invalid request.',
  TOO_MANY_REQUESTS: () => 'Too many requests. Please try again later.',
  INTERNAL_SERVER_ERROR: () => 'Internal server error. Please try again later.',
};

const extractFallbackMessage = (payload: ApiErrorPayload | undefined): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    const messages = payload.message.filter((entry): entry is string => typeof entry === 'string');
    if (messages.length > 0) {
      return messages.map((entry) => translateValidationConstraint(entry)).join(' ');
    }
  }

  return null;
};

export const normalizeApiError = (error: unknown): Error => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return new Error('Unexpected error. Please try again.');
  }

  if (!error.response) {
    return new Error(
      'Network/CORS error: API is unreachable or blocked by CORS. Please verify API URL and CORS_ORIGIN.',
    );
  }

  const payload = error.response.data;
  const code = payload?.code;
  if (typeof code === 'string') {
    const translator = errorCodeTranslators[code];
    if (translator) {
      return new Error(translator(payload));
    }
  }

  const fallbackMessage = extractFallbackMessage(payload);
  if (fallbackMessage) {
    return new Error(fallbackMessage);
  }

  return new Error('Request failed. Please try again.');
};

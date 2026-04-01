import { ApiErrorPayload, ApiValidationIssue } from '@react-node-demo/shared-contracts';
import axios from 'axios';

import { ErrorMessageKey, getErrorMessage } from '../i18n/error-messages';
import { AppLanguage, getRuntimeLanguage } from '../i18n/runtime';

type ApiErrorTranslator = (payload: ApiErrorPayload, language: AppLanguage) => string;
type ValidationIssueRuleTranslator = (
  issue: ApiValidationIssue,
  language: AppLanguage,
) => string;

const t = (
  language: AppLanguage,
  key: ErrorMessageKey,
  params?: Record<string, string | number>,
): string => getErrorMessage(language, key, params);

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

const toValidationIssues = (payload: ApiErrorPayload): ApiValidationIssue[] => {
  if (!Array.isArray(payload.validationIssues)) {
    return [];
  }

  return payload.validationIssues.filter((entry): entry is ApiValidationIssue => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const candidate = entry as Partial<ApiValidationIssue>;
    return (
      typeof candidate.field === 'string' &&
      typeof candidate.rule === 'string' &&
      typeof candidate.message === 'string'
    );
  });
};

const parseNumberFromMessage = (message: string, pattern: RegExp): number | null => {
  const match = message.match(pattern);
  if (!match || match.length < 2) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
};

const structuredValidationIssueTranslators: Record<string, ValidationIssueRuleTranslator> = {
  isEmail: (issue, language) =>
    t(language, 'validationIssueEmail', {
      field: issue.field,
    }),
  isString: (issue, language) =>
    t(language, 'validationIssueString', {
      field: issue.field,
    }),
  isInt: (issue, language) =>
    t(language, 'validationIssueInteger', {
      field: issue.field,
    }),
  isNotEmpty: (issue, language) =>
    t(language, 'validationIssueNotEmpty', {
      field: issue.field,
    }),
  isDateString: (issue, language) =>
    t(language, 'validationIssueIsoDate', {
      field: issue.field,
    }),
  whitelistValidation: (issue, language) =>
    t(language, 'validationIssueWhitelist', {
      field: issue.field,
    }),
  isEnum: (issue, language) =>
    t(language, 'validationIssueEnum', {
      field: issue.field,
    }),
  min: (issue, language) => {
    const min = parseNumberFromMessage(issue.message, /must not be less than (\d+)/);
    if (min === null) {
      return issue.message;
    }

    return t(language, 'validationIssueMin', {
      field: issue.field,
      min,
    });
  },
  minLength: (issue, language) => {
    const minLength = parseNumberFromMessage(
      issue.message,
      /longer than or equal to (\d+) characters/,
    );
    if (minLength === null) {
      return issue.message;
    }

    return t(language, 'validationIssueMinLength', {
      field: issue.field,
      minLength,
    });
  },
  maxLength: (issue, language) => {
    const maxLength = parseNumberFromMessage(
      issue.message,
      /shorter than or equal to (\d+) characters/,
    );
    if (maxLength === null) {
      return issue.message;
    }

    return t(language, 'validationIssueMaxLength', {
      field: issue.field,
      maxLength,
    });
  },
};

const translateStructuredValidationIssue = (
  issue: ApiValidationIssue,
  language: AppLanguage,
): string => {
  const translator = structuredValidationIssueTranslators[issue.rule];
  if (!translator) {
    return issue.message;
  }

  return translator(issue, language);
};

const translateStructuredValidationIssues = (
  issues: ApiValidationIssue[],
  language: AppLanguage,
): string =>
  issues
    .map((issue) => translateStructuredValidationIssue(issue, language))
    .join(' ');

const errorCodeTranslators: Record<string, ApiErrorTranslator> = {
  AUTH_INVALID_CREDENTIALS: (_, language) => t(language, 'authInvalidCredentials'),
  AUTH_EMAIL_ALREADY_EXISTS: (payload, language) => {
    const email = toStringParam(payload, 'email');
    if (email) {
      return t(language, 'authEmailAlreadyExistsWithEmail', { email });
    }

    return t(language, 'authEmailAlreadyExists');
  },
  AUTH_REFRESH_TOKEN_INVALID: (_, language) => t(language, 'authRefreshTokenInvalid'),
  EMPLOYEE_EMAIL_ALREADY_EXISTS: (payload, language) => {
    const email = toStringParam(payload, 'email');
    if (email) {
      return t(language, 'employeeEmailAlreadyExistsWithEmail', { email });
    }

    return t(language, 'employeeEmailAlreadyExists');
  },
  EMPLOYEE_NOT_FOUND: (payload, language) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    if (employeeId !== null) {
      return t(language, 'employeeNotFoundWithId', { employeeId });
    }

    return t(language, 'employeeNotFound');
  },
  EMPLOYEE_HAS_ASSIGNED_TASKS: (payload, language) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    if (employeeId !== null) {
      return t(language, 'employeeHasAssignedTasksWithId', { employeeId });
    }

    return t(language, 'employeeHasAssignedTasks');
  },
  TASK_NOT_FOUND: (payload, language) => {
    const taskId = toNumberParam(payload, 'taskId');
    if (taskId !== null) {
      return t(language, 'taskNotFoundWithId', { taskId });
    }

    return t(language, 'taskNotFound');
  },
  TASK_EMPLOYEE_NOT_FOUND: (payload, language) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    if (employeeId !== null) {
      return t(language, 'taskEmployeeNotFoundWithId', { employeeId });
    }

    return t(language, 'taskEmployeeNotFound');
  },
  TASK_SUBTASK_ASSIGNEE_NOT_FOUND: (_, language) => t(language, 'taskSubtaskAssigneeNotFound'),
  TASK_SUBTASK_NOT_BELONG_TO_TASK: (payload, language) => {
    const subtaskId = toNumberParam(payload, 'subtaskId');
    const taskId = toNumberParam(payload, 'taskId');
    if (subtaskId !== null && taskId !== null) {
      return t(language, 'taskSubtaskNotBelongToTaskWithIds', { subtaskId, taskId });
    }

    return t(language, 'taskSubtaskNotBelongToTask');
  },
  TASK_DATE_RANGE_INVALID: (_, language) => t(language, 'taskDateRangeInvalid'),
  TASK_SUBTASK_DATE_RANGE_INVALID: (payload, language) => {
    const index = toNumberParam(payload, 'subtaskIndex');
    if (index !== null) {
      return t(language, 'taskSubtaskDateRangeInvalidWithIndex', {
        subtaskPosition: index + 1,
      });
    }

    return t(language, 'taskSubtaskDateRangeInvalid');
  },
  TASK_EMPLOYEE_ID_QUERY_INVALID: (_, language) => t(language, 'taskEmployeeIdQueryInvalid'),
  VALIDATION_ERROR: (payload, language) => {
    const issues = toValidationIssues(payload);
    if (issues.length > 0) {
      return translateStructuredValidationIssues(issues, language);
    }

    const errors = toStringArrayParam(payload, 'errors');
    if (errors.length > 0) {
      return errors.join(' ');
    }

    return t(language, 'validationFailed');
  },
  UNAUTHORIZED: (_, language) => t(language, 'unauthorized'),
  FORBIDDEN: (_, language) => t(language, 'forbidden'),
  NOT_FOUND: (_, language) => t(language, 'notFound'),
  CONFLICT: (_, language) => t(language, 'conflict'),
  BAD_REQUEST: (_, language) => t(language, 'badRequest'),
  TOO_MANY_REQUESTS: (_, language) => t(language, 'tooManyRequests'),
  INTERNAL_SERVER_ERROR: (_, language) => t(language, 'internalServerError'),
};

const extractFallbackMessage = (
  payload: ApiErrorPayload | undefined,
  language: AppLanguage,
): string | null => {
  if (!payload) {
    return null;
  }

  const issues = toValidationIssues(payload);
  if (issues.length > 0) {
    return translateStructuredValidationIssues(issues, language);
  }

  const errors = toStringArrayParam(payload, 'errors');
  if (errors.length > 0) {
    return errors.join(' ');
  }

  if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    const messages = payload.message.filter((entry): entry is string => typeof entry === 'string');
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return null;
};

export const normalizeApiError = (error: unknown): Error => {
  const language = getRuntimeLanguage();

  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return new Error(t(language, 'unexpectedError'));
  }

  if (!error.response) {
    return new Error(t(language, 'networkCorsError'));
  }

  const payload = error.response.data;
  const code = payload?.code;
  if (typeof code === 'string') {
    const translator = errorCodeTranslators[code];
    if (translator) {
      return new Error(translator(payload, language));
    }
  }

  const fallbackMessage = extractFallbackMessage(payload, language);
  if (fallbackMessage) {
    return new Error(fallbackMessage);
  }

  return new Error(t(language, 'requestFailed'));
};

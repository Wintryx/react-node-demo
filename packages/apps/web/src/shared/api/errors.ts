import { ApiErrorPayload, ApiValidationIssue } from '@react-node-demo/shared-contracts';
import axios from 'axios';

import { ErrorMessageKey, getErrorMessage } from '../i18n/error-translations';
import { AppLanguage, getRuntimeLanguage } from '../i18n/runtime';

type ApiErrorTranslator = (payload: ApiErrorPayload, language: AppLanguage) => string;
type ValidationIssueRuleTranslator = (
  issue: ApiValidationIssue,
  language: AppLanguage,
) => string;

const getLocalizedErrorMessage = (
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

const byStringParam = (
  paramName: string,
  withParamKey: ErrorMessageKey,
  fallbackKey: ErrorMessageKey,
): ApiErrorTranslator => (payload, language) => {
  const value = toStringParam(payload, paramName);
  if (value) {
    return getLocalizedErrorMessage(language, withParamKey, { [paramName]: value });
  }

  return getLocalizedErrorMessage(language, fallbackKey);
};

const byNumberParam = (
  paramName: string,
  withParamKey: ErrorMessageKey,
  fallbackKey: ErrorMessageKey,
): ApiErrorTranslator => (payload, language) => {
  const value = toNumberParam(payload, paramName);
  if (value !== null) {
    return getLocalizedErrorMessage(language, withParamKey, { [paramName]: value });
  }

  return getLocalizedErrorMessage(language, fallbackKey);
};

const byFieldRule = (key: ErrorMessageKey): ValidationIssueRuleTranslator => (issue, language) =>
  getLocalizedErrorMessage(language, key, {
    field: issue.field,
  });

const structuredValidationIssueTranslators: Record<string, ValidationIssueRuleTranslator> = {
  isEmail: byFieldRule('validationIssueEmail'),
  isString: byFieldRule('validationIssueString'),
  isInt: byFieldRule('validationIssueInteger'),
  isNotEmpty: byFieldRule('validationIssueNotEmpty'),
  isDateString: byFieldRule('validationIssueIsoDate'),
  whitelistValidation: byFieldRule('validationIssueWhitelist'),
  isEnum: byFieldRule('validationIssueEnum'),
  min: (issue, language) => {
    const min = parseNumberFromMessage(issue.message, /must not be less than (\d+)/);
    if (min === null) {
      return issue.message;
    }

    return getLocalizedErrorMessage(language, 'validationIssueMin', {
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

    return getLocalizedErrorMessage(language, 'validationIssueMinLength', {
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

    return getLocalizedErrorMessage(language, 'validationIssueMaxLength', {
      field: issue.field,
      maxLength,
    });
  },
};

const translateStructuredValidationIssues = (
  issues: ApiValidationIssue[],
  language: AppLanguage,
): string =>
  issues
    .map((issue) => {
      const translator = structuredValidationIssueTranslators[issue.rule];
      return translator ? translator(issue, language) : issue.message;
    })
    .join(' ');

const translateValidationError = (payload: ApiErrorPayload, language: AppLanguage): string => {
  const issues = toValidationIssues(payload);
  if (issues.length > 0) {
    return translateStructuredValidationIssues(issues, language);
  }

  const errors = toStringArrayParam(payload, 'errors');
  if (errors.length > 0) {
    return errors.join(' ');
  }

  return getLocalizedErrorMessage(language, 'validationFailed');
};

const errorCodeTranslators: Record<string, ApiErrorTranslator> = {
  AUTH_INVALID_CREDENTIALS: (_, language) =>
    getLocalizedErrorMessage(language, 'authInvalidCredentials'),
  AUTH_EMAIL_ALREADY_EXISTS: byStringParam(
    'email',
    'authEmailAlreadyExistsWithEmail',
    'authEmailAlreadyExists',
  ),
  AUTH_REFRESH_TOKEN_INVALID: (_, language) =>
    getLocalizedErrorMessage(language, 'authRefreshTokenInvalid'),
  EMPLOYEE_EMAIL_ALREADY_EXISTS: byStringParam(
    'email',
    'employeeEmailAlreadyExistsWithEmail',
    'employeeEmailAlreadyExists',
  ),
  EMPLOYEE_NOT_FOUND: byNumberParam('employeeId', 'employeeNotFoundWithId', 'employeeNotFound'),
  EMPLOYEE_HAS_ASSIGNED_TASKS: byNumberParam(
    'employeeId',
    'employeeHasAssignedTasksWithId',
    'employeeHasAssignedTasks',
  ),
  TASK_NOT_FOUND: byNumberParam('taskId', 'taskNotFoundWithId', 'taskNotFound'),
  TASK_EMPLOYEE_NOT_FOUND: byNumberParam(
    'employeeId',
    'taskEmployeeNotFoundWithId',
    'taskEmployeeNotFound',
  ),
  TASK_SUBTASK_ASSIGNEE_NOT_FOUND: (_, language) =>
    getLocalizedErrorMessage(language, 'taskSubtaskAssigneeNotFound'),
  TASK_SUBTASK_NOT_BELONG_TO_TASK: (payload, language) => {
    const subtaskId = toNumberParam(payload, 'subtaskId');
    const taskId = toNumberParam(payload, 'taskId');
    if (subtaskId !== null && taskId !== null) {
      return getLocalizedErrorMessage(language, 'taskSubtaskNotBelongToTaskWithIds', {
        subtaskId,
        taskId,
      });
    }

    return getLocalizedErrorMessage(language, 'taskSubtaskNotBelongToTask');
  },
  TASK_DATE_RANGE_INVALID: (_, language) =>
    getLocalizedErrorMessage(language, 'taskDateRangeInvalid'),
  TASK_SUBTASK_DATE_RANGE_INVALID: (payload, language) => {
    const index = toNumberParam(payload, 'subtaskIndex');
    if (index !== null) {
      return getLocalizedErrorMessage(language, 'taskSubtaskDateRangeInvalidWithIndex', {
        subtaskPosition: index + 1,
      });
    }

    return getLocalizedErrorMessage(language, 'taskSubtaskDateRangeInvalid');
  },
  TASK_EMPLOYEE_ID_QUERY_INVALID: (_, language) =>
    getLocalizedErrorMessage(language, 'taskEmployeeIdQueryInvalid'),
  VALIDATION_ERROR: translateValidationError,
  UNAUTHORIZED: (_, language) => getLocalizedErrorMessage(language, 'unauthorized'),
  FORBIDDEN: (_, language) => getLocalizedErrorMessage(language, 'forbidden'),
  NOT_FOUND: (_, language) => getLocalizedErrorMessage(language, 'notFound'),
  CONFLICT: (_, language) => getLocalizedErrorMessage(language, 'conflict'),
  BAD_REQUEST: (_, language) => getLocalizedErrorMessage(language, 'badRequest'),
  TOO_MANY_REQUESTS: (_, language) =>
    getLocalizedErrorMessage(language, 'tooManyRequests'),
  INTERNAL_SERVER_ERROR: (_, language) =>
    getLocalizedErrorMessage(language, 'internalServerError'),
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
    return new Error(getLocalizedErrorMessage(language, 'unexpectedError'));
  }

  if (!error.response) {
    return new Error(getLocalizedErrorMessage(language, 'networkCorsError'));
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

  return new Error(getLocalizedErrorMessage(language, 'requestFailed'));
};

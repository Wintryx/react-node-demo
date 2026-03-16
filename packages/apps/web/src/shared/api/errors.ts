import axios from 'axios';

import { ApiErrorPayload } from './types';

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
        'Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
    },
    {
      pattern: /^email must be an email$/,
      replace: 'E-Mail muss gültig sein.',
    },
    {
      pattern: /^password must be a string$/,
      replace: 'Passwort muss ein Text sein.',
    },
    {
      pattern: /^password must be longer than or equal to (\d+) characters$/,
      replace: 'Passwort muss mindestens $1 Zeichen lang sein.',
    },
    {
      pattern: /^password must be shorter than or equal to (\d+) characters$/,
      replace: 'Passwort darf höchstens $1 Zeichen lang sein.',
    },
    {
      pattern: /^(.+) must be a string$/,
      replace: '$1 muss ein Text sein.',
    },
    {
      pattern: /^(.+) must be an integer number$/,
      replace: '$1 muss eine ganze Zahl sein.',
    },
    {
      pattern: /^(.+) must not be less than (\d+)$/,
      replace: '$1 darf nicht kleiner als $2 sein.',
    },
    {
      pattern: /^(.+) must be a valid ISO 8601 date string$/,
      replace: '$1 muss ein gültiges ISO-8601-Datum sein.',
    },
  ];

  const match = rules.find((rule) => rule.pattern.test(message));
  if (!match) {
    return message;
  }

  return message.replace(match.pattern, match.replace);
};

const errorCodeTranslators: Record<string, ApiErrorTranslator> = {
  AUTH_INVALID_CREDENTIALS: () => 'Ungültige E-Mail oder falsches Passwort.',
  AUTH_EMAIL_ALREADY_EXISTS: (payload) => {
    const email = toStringParam(payload, 'email');
    return email
      ? `Ein Benutzer mit der E-Mail "${email}" existiert bereits.`
      : 'Ein Benutzer mit dieser E-Mail existiert bereits.';
  },
  EMPLOYEE_EMAIL_ALREADY_EXISTS: (payload) => {
    const email = toStringParam(payload, 'email');
    return email
      ? `Eine mitarbeitende Person mit der E-Mail "${email}" existiert bereits.`
      : 'Eine mitarbeitende Person mit dieser E-Mail existiert bereits.';
  },
  EMPLOYEE_NOT_FOUND: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Mitarbeitende Person mit ID "${employeeId}" wurde nicht gefunden.`
      : 'Mitarbeitende Person wurde nicht gefunden.';
  },
  EMPLOYEE_HAS_ASSIGNED_TASKS: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Mitarbeitende Person mit ID "${employeeId}" hat zugewiesene Aufgaben und kann nicht gelöscht werden.`
      : 'Mitarbeitende Person hat zugewiesene Aufgaben und kann nicht gelöscht werden.';
  },
  TASK_NOT_FOUND: (payload) => {
    const taskId = toNumberParam(payload, 'taskId');
    return taskId !== null
      ? `Aufgabe mit ID "${taskId}" wurde nicht gefunden.`
      : 'Aufgabe wurde nicht gefunden.';
  },
  TASK_EMPLOYEE_NOT_FOUND: (payload) => {
    const employeeId = toNumberParam(payload, 'employeeId');
    return employeeId !== null
      ? `Mitarbeitende Person mit ID "${employeeId}" wurde nicht gefunden.`
      : 'Mitarbeitende Person wurde nicht gefunden.';
  },
  TASK_SUBTASK_ASSIGNEE_NOT_FOUND: () =>
    'Eine oder mehrere zugewiesene Personen bei Teilaufgaben existieren nicht.',
  TASK_SUBTASK_NOT_BELONG_TO_TASK: (payload) => {
    const subtaskId = toNumberParam(payload, 'subtaskId');
    const taskId = toNumberParam(payload, 'taskId');

    if (subtaskId !== null && taskId !== null) {
      return `Teilaufgabe "${subtaskId}" gehört nicht zu Aufgabe "${taskId}".`;
    }

    return 'Teilaufgabe gehört nicht zur angegebenen Aufgabe.';
  },
  TASK_DATE_RANGE_INVALID: () => 'Fälligkeitsdatum darf nicht vor dem Startdatum liegen.',
  TASK_SUBTASK_DATE_RANGE_INVALID: (payload) => {
    const index = toNumberParam(payload, 'subtaskIndex');
    return index !== null
      ? `Enddatum der Teilaufgabe #${index + 1} darf nicht vor dem Startdatum liegen.`
      : 'Enddatum der Teilaufgabe darf nicht vor dem Startdatum liegen.';
  },
  TASK_EMPLOYEE_ID_QUERY_INVALID: () =>
    'Query-Parameter "employeeId" muss eine positive Ganzzahl sein.',
  VALIDATION_ERROR: (payload) => {
    const errors = toStringArrayParam(payload, 'errors');
    if (errors.length === 0) {
      return 'Validierung fehlgeschlagen.';
    }

    return errors.map((entry) => translateValidationConstraint(entry)).join(' ');
  },
  UNAUTHORIZED: () => 'Nicht autorisiert.',
  FORBIDDEN: () => 'Zugriff verweigert.',
  NOT_FOUND: () => 'Ressource wurde nicht gefunden.',
  CONFLICT: () => 'Konflikt bei der Anfrage.',
  BAD_REQUEST: () => 'Ungültige Anfrage.',
  TOO_MANY_REQUESTS: () => 'Zu viele Anfragen. Bitte später erneut versuchen.',
  INTERNAL_SERVER_ERROR: () => 'Interner Serverfehler. Bitte später erneut versuchen.',
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
    return new Error('Unerwarteter Fehler. Bitte erneut versuchen.');
  }

  if (!error.response) {
    return new Error(
      'Netzwerk-/CORS-Fehler: API ist nicht erreichbar oder durch CORS blockiert. Bitte API-URL und CORS_ORIGIN prüfen.',
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

  return new Error('Anfrage fehlgeschlagen. Bitte erneut versuchen.');
};

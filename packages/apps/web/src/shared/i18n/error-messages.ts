import { AppLanguage } from './runtime';

const errorMessagesEn = {
  authInvalidCredentials: 'Invalid email or password.',
  authEmailAlreadyExistsWithEmail: 'A user with email "{{email}}" already exists.',
  authEmailAlreadyExists: 'A user with this email already exists.',
  authRefreshTokenInvalid: 'Session expired. Please sign in again.',
  employeeEmailAlreadyExistsWithEmail: 'An employee with email "{{email}}" already exists.',
  employeeEmailAlreadyExists: 'An employee with this email already exists.',
  employeeNotFoundWithId: 'Employee with ID "{{employeeId}}" was not found.',
  employeeNotFound: 'Employee was not found.',
  employeeHasAssignedTasksWithId:
    'Employee with ID "{{employeeId}}" has assigned tasks and cannot be deleted.',
  employeeHasAssignedTasks: 'Employee has assigned tasks and cannot be deleted.',
  taskNotFoundWithId: 'Task with ID "{{taskId}}" was not found.',
  taskNotFound: 'Task was not found.',
  taskEmployeeNotFoundWithId: 'Employee with ID "{{employeeId}}" was not found.',
  taskEmployeeNotFound: 'Employee was not found.',
  taskSubtaskAssigneeNotFound: 'One or more subtask assignees do not exist.',
  taskSubtaskNotBelongToTaskWithIds:
    'Subtask "{{subtaskId}}" does not belong to task "{{taskId}}".',
  taskSubtaskNotBelongToTask: 'Subtask does not belong to the specified task.',
  taskDateRangeInvalid: 'Due date must not be before start date.',
  taskSubtaskDateRangeInvalidWithIndex:
    'End date of subtask #{{subtaskPosition}} must not be before start date.',
  taskSubtaskDateRangeInvalid: 'Subtask end date must not be before start date.',
  taskEmployeeIdQueryInvalid: 'Query parameter "employeeId" must be a positive integer.',
  validationFailed: 'Validation failed.',
  unauthorized: 'Unauthorized.',
  forbidden: 'Access denied.',
  notFound: 'Resource not found.',
  conflict: 'Request conflict.',
  badRequest: 'Invalid request.',
  tooManyRequests: 'Too many requests. Please try again later.',
  internalServerError: 'Internal server error. Please try again later.',
  unexpectedError: 'Unexpected error. Please try again.',
  networkCorsError:
    'Network/CORS error: API is unreachable or blocked by CORS. Please verify API URL and CORS_ORIGIN.',
  requestFailed: 'Request failed. Please try again.',
  validationIssueEmail: '{{field}} must be a valid email.',
  validationIssueString: '{{field}} must be a string.',
  validationIssueInteger: '{{field}} must be an integer.',
  validationIssueNotEmpty: '{{field}} must not be empty.',
  validationIssueMin: '{{field}} must not be less than {{min}}.',
  validationIssueMinLength: '{{field}} must be at least {{minLength}} characters long.',
  validationIssueMaxLength: '{{field}} must be at most {{maxLength}} characters long.',
  validationIssueIsoDate: '{{field}} must be a valid ISO-8601 date string.',
  validationIssueWhitelist: 'Property "{{field}}" is not allowed.',
  validationIssueEnum: '{{field}} must be one of the allowed values.',
};

export type ErrorMessageKey = keyof typeof errorMessagesEn;
export type ErrorMessageParams = Record<string, string | number>;

const errorMessagesByLanguage: Record<AppLanguage, Record<ErrorMessageKey, string>> = {
  en: errorMessagesEn,
  de: {
    authInvalidCredentials: 'Ungültige E-Mail oder ungültiges Passwort.',
    authEmailAlreadyExistsWithEmail: 'Ein Benutzer mit der E-Mail "{{email}}" existiert bereits.',
    authEmailAlreadyExists: 'Ein Benutzer mit dieser E-Mail existiert bereits.',
    authRefreshTokenInvalid: 'Sitzung abgelaufen. Bitte erneut anmelden.',
    employeeEmailAlreadyExistsWithEmail:
      'Ein Mitarbeiter mit der E-Mail "{{email}}" existiert bereits.',
    employeeEmailAlreadyExists: 'Ein Mitarbeiter mit dieser E-Mail existiert bereits.',
    employeeNotFoundWithId: 'Mitarbeiter mit ID "{{employeeId}}" wurde nicht gefunden.',
    employeeNotFound: 'Mitarbeiter wurde nicht gefunden.',
    employeeHasAssignedTasksWithId:
      'Mitarbeiter mit ID "{{employeeId}}" hat zugewiesene Aufgaben und kann nicht gelöscht werden.',
    employeeHasAssignedTasks: 'Mitarbeiter hat zugewiesene Aufgaben und kann nicht gelöscht werden.',
    taskNotFoundWithId: 'Aufgabe mit ID "{{taskId}}" wurde nicht gefunden.',
    taskNotFound: 'Aufgabe wurde nicht gefunden.',
    taskEmployeeNotFoundWithId: 'Mitarbeiter mit ID "{{employeeId}}" wurde nicht gefunden.',
    taskEmployeeNotFound: 'Mitarbeiter wurde nicht gefunden.',
    taskSubtaskAssigneeNotFound: 'Eine oder mehrere Unteraufgaben-Zuweisungen existieren nicht.',
    taskSubtaskNotBelongToTaskWithIds:
      'Unteraufgabe "{{subtaskId}}" gehört nicht zu Aufgabe "{{taskId}}".',
    taskSubtaskNotBelongToTask: 'Unteraufgabe gehört nicht zur angegebenen Aufgabe.',
    taskDateRangeInvalid: 'Fälligkeitsdatum darf nicht vor dem Startdatum liegen.',
    taskSubtaskDateRangeInvalidWithIndex:
      'Enddatum der Unteraufgabe #{{subtaskPosition}} darf nicht vor dem Startdatum liegen.',
    taskSubtaskDateRangeInvalid: 'Enddatum der Unteraufgabe darf nicht vor dem Startdatum liegen.',
    taskEmployeeIdQueryInvalid:
      'Query-Parameter "employeeId" muss eine positive Ganzzahl sein.',
    validationFailed: 'Validierung fehlgeschlagen.',
    unauthorized: 'Nicht autorisiert.',
    forbidden: 'Zugriff verweigert.',
    notFound: 'Ressource nicht gefunden.',
    conflict: 'Anfragekonflikt.',
    badRequest: 'Ungültige Anfrage.',
    tooManyRequests: 'Zu viele Anfragen. Bitte später erneut versuchen.',
    internalServerError: 'Interner Serverfehler. Bitte später erneut versuchen.',
    unexpectedError: 'Unerwarteter Fehler. Bitte erneut versuchen.',
    networkCorsError:
      'Netzwerk/CORS-Fehler: API ist nicht erreichbar oder durch CORS blockiert. Bitte API-URL und CORS_ORIGIN prüfen.',
    requestFailed: 'Anfrage fehlgeschlagen. Bitte erneut versuchen.',
    validationIssueEmail: '{{field}} muss eine gültige E-Mail sein.',
    validationIssueString: '{{field}} muss eine Zeichenkette sein.',
    validationIssueInteger: '{{field}} muss eine Ganzzahl sein.',
    validationIssueNotEmpty: '{{field}} darf nicht leer sein.',
    validationIssueMin: '{{field}} darf nicht kleiner als {{min}} sein.',
    validationIssueMinLength: '{{field}} muss mindestens {{minLength}} Zeichen lang sein.',
    validationIssueMaxLength: '{{field}} darf höchstens {{maxLength}} Zeichen lang sein.',
    validationIssueIsoDate: '{{field}} muss ein gültiger ISO-8601-Datumswert sein.',
    validationIssueWhitelist: 'Eigenschaft "{{field}}" ist nicht erlaubt.',
    validationIssueEnum: '{{field}} muss einem erlaubten Wert entsprechen.',
  },
};

const interpolate = (template: string, params?: ErrorMessageParams): string => {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    return '';
  });
};

export const getErrorMessage = (
  language: AppLanguage,
  key: ErrorMessageKey,
  params?: ErrorMessageParams,
): string => interpolate(errorMessagesByLanguage[language][key], params);

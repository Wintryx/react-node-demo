import { ErrorMessageCatalog } from './error-translations.en';

export const errorTranslationsDe: ErrorMessageCatalog = {
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
};

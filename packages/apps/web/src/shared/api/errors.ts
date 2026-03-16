import axios from 'axios';

import { ApiErrorPayload } from './types';

const translateApiMessage = (message: string): string => {
  if (message === 'Invalid email or password.') {
    return 'Ungültige E-Mail oder falsches Passwort.';
  }

  return message
    .replace(
      /^User with email "(.+)" already exists\.$/,
      'Ein Benutzer mit der E-Mail "$1" existiert bereits.',
    )
    .replace(
      /^Employee with email "(.+)" already exists\.$/,
      'Eine mitarbeitende Person mit der E-Mail "$1" existiert bereits.',
    )
    .replace(
      /^Employee with id "(.+)" was not found\.$/,
      'Mitarbeitende Person mit ID "$1" wurde nicht gefunden.',
    )
    .replace(/^Task with id "(.+)" was not found\.$/, 'Aufgabe mit ID "$1" wurde nicht gefunden.')
    .replace(
      /^One or more subtask assignees do not exist\.$/,
      'Eine oder mehrere zugewiesene Personen bei Teilaufgaben existieren nicht.',
    )
    .replace(/^Subtask with id "(.+)" does not belong to task "(.+)"\.$/, 'Teilaufgabe "$1" gehört nicht zu Aufgabe "$2".')
    .replace(
      /^Query parameter "employeeId" must be a positive integer\.$/,
      'Query-Parameter "employeeId" muss eine positive Ganzzahl sein.',
    )
    .replace(
      /^password must contain at least one lowercase letter, one uppercase letter, one number and one special character\.$/,
      'Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
    )
    .replace(/^email must be an email$/, 'E-Mail muss gültig sein.')
    .replace(/^password must be a string$/, 'Passwort muss ein Text sein.')
    .replace(/^password must be longer than or equal to (\d+) characters$/, 'Passwort muss mindestens $1 Zeichen lang sein.')
    .replace(/^password must be shorter than or equal to (\d+) characters$/, 'Passwort darf höchstens $1 Zeichen lang sein.')
    .replace(/^(.+) must be a string$/, '$1 muss ein Text sein.')
    .replace(/^(.+) must be an integer number$/, '$1 muss eine ganze Zahl sein.')
    .replace(/^(.+) must not be less than (\d+)$/, '$1 darf nicht kleiner als $2 sein.')
    .replace(/^(.+) must be a valid ISO 8601 date string$/, '$1 muss ein gültiges ISO-8601-Datum sein.');
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

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return new Error(message.map((item) => translateApiMessage(item)).join(' '));
  }

  if (typeof message === 'string' && message.length > 0) {
    return new Error(translateApiMessage(message));
  }

  return new Error('Anfrage fehlgeschlagen. Bitte erneut versuchen.');
};

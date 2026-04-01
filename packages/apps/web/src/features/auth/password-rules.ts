import { AppLanguage } from '../../shared/i18n/runtime';

export const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const getPasswordPolicyHint = (language: AppLanguage): string =>
  language === 'de'
    ? 'Mindestens 10 Zeichen mit Großbuchstaben, Kleinbuchstaben, Zahl und Sonderzeichen.'
    : 'At least 10 characters including uppercase, lowercase, number, and special character.';

import { errorTranslationsDe } from './error-translations.de';
import {
  ErrorMessageCatalog,
  errorTranslationsEn,
} from './error-translations.en';
import { AppLanguage } from './runtime';

export type ErrorMessageKey = keyof ErrorMessageCatalog;
export type ErrorMessageParams = Record<string, string | number>;

const errorTranslationsByLanguage: Record<AppLanguage, ErrorMessageCatalog> = {
  en: errorTranslationsEn,
  de: errorTranslationsDe,
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
): string => interpolate(errorTranslationsByLanguage[language][key], params);

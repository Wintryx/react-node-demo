import { dashboardTranslationsDe } from './dashboard-translations.de';
import { dashboardTranslationsEn } from './dashboard-translations.en';
import { AppLanguage, getRuntimeLanguage } from '../../shared/i18n/runtime';

export type DashboardTranslations = typeof dashboardTranslationsEn;

const dashboardTranslationsByLanguage: Record<AppLanguage, DashboardTranslations> = {
  en: dashboardTranslationsEn,
  de: dashboardTranslationsDe,
};

export const getDashboardTranslations = (
  language: AppLanguage = getRuntimeLanguage(),
): DashboardTranslations => dashboardTranslationsByLanguage[language];

export const dashboardTranslations: DashboardTranslations = {
  get common() {
    return getDashboardTranslations().common;
  },
  get header() {
    return getDashboardTranslations().header;
  },
  get tasks() {
    return getDashboardTranslations().tasks;
  },
  get subtasks() {
    return getDashboardTranslations().subtasks;
  },
  get employees() {
    return getDashboardTranslations().employees;
  },
};

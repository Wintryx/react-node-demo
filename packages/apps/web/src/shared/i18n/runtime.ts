export type AppLanguage = 'en' | 'de';

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en';

let currentRuntimeLanguage: AppLanguage = DEFAULT_APP_LANGUAGE;

export const getRuntimeLanguage = (): AppLanguage => currentRuntimeLanguage;

export const setRuntimeLanguage = (language: AppLanguage): void => {
  currentRuntimeLanguage = language;
};

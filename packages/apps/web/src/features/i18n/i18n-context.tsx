import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

import {
  AppLanguage,
  DEFAULT_APP_LANGUAGE,
  setRuntimeLanguage,
} from '../../shared/i18n/runtime';

const I18N_STORAGE_KEY = 'app.language';

interface I18nContextValue {
  language: AppLanguage;
  setLanguage(language: AppLanguage): void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const toLanguage = (value: string | null): AppLanguage =>
  value === 'de' ? 'de' : DEFAULT_APP_LANGUAGE;

const readInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_LANGUAGE;
  }

  return toLanguage(window.localStorage.getItem(I18N_STORAGE_KEY));
};

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const initialLanguage = readInitialLanguage();
    setRuntimeLanguage(initialLanguage);
    return initialLanguage;
  });

  const setLanguage = (nextLanguage: AppLanguage): void => {
    setRuntimeLanguage(nextLanguage);
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(I18N_STORAGE_KEY, nextLanguage);
    }
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.');
  }

  return context;
};

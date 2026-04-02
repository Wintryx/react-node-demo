import { AppLanguage } from '../../shared/i18n/runtime';

const authTranslationsByLanguage = {
  en: {
    shell: {
      badge: 'React + NestJS Demo',
    },
    login: {
      title: 'Welcome back',
      description: 'Sign in to access your task board.',
      footerLabel: 'No account yet?',
      footerLinkLabel: 'Register',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      submitting: 'Signing in...',
    },
    register: {
      title: 'Create account',
      description: 'Register to manage your task board.',
      footerLabel: 'Already registered?',
      footerLinkLabel: 'Sign in',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Create account',
      submitting: 'Creating account...',
      passwordMismatch: 'Passwords do not match.',
    },
    passwordPolicyHint:
      'At least 10 characters including uppercase, lowercase, number, and special character.',
  },
  de: {
    shell: {
      badge: 'React + NestJS Demo',
    },
    login: {
      title: 'Willkommen zurück',
      description: 'Melde dich an, um dein Task-Board zu öffnen.',
      footerLabel: 'Noch kein Konto?',
      footerLinkLabel: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      submitting: 'Anmeldung läuft...',
    },
    register: {
      title: 'Konto erstellen',
      description: 'Registriere dich, um dein Task-Board zu verwalten.',
      footerLabel: 'Bereits registriert?',
      footerLinkLabel: 'Anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      submit: 'Konto erstellen',
      submitting: 'Konto wird erstellt...',
      passwordMismatch: 'Passwörter stimmen nicht überein.',
    },
    passwordPolicyHint:
      'Mindestens 10 Zeichen mit Großbuchstaben, Kleinbuchstaben, Zahl und Sonderzeichen.',
  },
} as const;

export type AuthTranslations = (typeof authTranslationsByLanguage)['en'];

export const getAuthTranslations = (language: AppLanguage): AuthTranslations => <AuthTranslations>authTranslationsByLanguage[language];

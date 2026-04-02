# Projektfortschritt

Stand: 2026-04-02

## Kurzstatus

- Review-Pflichtpunkte sind umgesetzt (Employee-CRUD UI, English default, Compose-Startfähigkeit, dueDate-Clearing, Seed-Flow).
- Auth-Flow ist auf finalem Stand mit `auth_refresh_sessions`, Rotation, `logout` und `logout-all`.
- Language-Toggle im Dashboard schaltet Texte jetzt direkt bei Klick (EN/DE) ohne zusätzlichen Refresh.
- Web/API-Lint und Tests laufen grün für die zuletzt umgesetzten Häppchen.

## Laufende Refactoring-Initiative (Vereinfachung)

Ziel: Code- und Doku-Komplexität reduzieren, ohne Architektur neu zu erfinden.

1. Doku verschlanken und Rollen klar trennen.
2. Testdaten/Fixtures stärker zentralisieren.
3. i18n-Dateien nach Locales aufteilen.
4. Kleine Form-Entkopplungen fortsetzen.

## Umgesetzt (relevante Pakete)

- Paket 20: Doku-Konsistenz, Dashboard-Test-Split, Employee-Form-Refactor.
  - Auth-Doku auf finalen Ist-Stand gebracht.
  - Großer Dashboard-Integrationstest in 3 fokussierte Suites aufgeteilt.
  - Employee-Panel um eigenen Form-State-Hook reduziert.

## Aktiver Plan (Häppchen 21)

- [x] Häppchen 1: Doku vereinfachen (`progress.md`, `implementation-guide.md`, Archivhinweis)
- [x] Häppchen 2: E2E-Testdaten-Helfer zentralisiert (`api-e2e/support/resource-helpers.ts`)
- [x] Häppchen 3: i18n-Split nach Locale-Dateien (`error-translations.en/de`, `dashboard-translations.en/de`)
- [x] Häppchen 4: weitere kleine Form-Entkopplung im Web-UI (`validateTaskFormState`)
- [x] Häppchen 5: konsistentes Naming für UI-Textmodule (`*-translations`) inkl. Import-/Symbolumstellung

## Verifizierung (zuletzt)

- `npx nx lint web`
- `npx nx test web`
- `npx nx lint api-e2e`
- `npx nx run api-e2e:e2e`

## Wichtige Referenzen

- Auth-Überblick: `docs/descriptions/authentication-deep-dive.md`
- Session-Regeln: `docs/security/session-policy.md`
- Produktionsbetrieb Auth: `docs/security/auth-production-runbook.md`
- Implementierungsleitfaden: `docs/implementation-guide.md`
- Historie: `docs/archive/progress-history.md`

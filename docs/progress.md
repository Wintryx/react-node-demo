# Projektfortschritt

Stand: 2026-03-16

## Entscheidungen

- Datenbank: `SQLite`
- Paketmanager: `npm`
- Monorepo: `Nx`
- ORM: `TypeORM`
- Frontend-Test: `Vitest`
- Backend-Test: `Jest` (Nest-Standard)
- Timeline: Custom MVP (CSS Grid), Library nur als Fallback

## Erledigt

- Strenge Typisierung als Regel gesetzt:
  - `strict: true`
  - `noImplicitAny: true`
  - ESLint `no-explicit-any: error`
- Nx-Workspace aufgesetzt
- Projekte angelegt:
  - `packages/apps/api`
  - `packages/apps/web`
  - `packages/apps/api-e2e`
- ESLint + Prettier + EditorConfig konfiguriert
- Skripte für `build`, `lint`, `test`, `dev:web`, `dev:api` eingerichtet
- API-Skeleton erweitert:
  - `ConfigModule` global
  - `TypeORM` mit `SQLite`
  - `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`)
  - `helmet`
  - CORS-Basis
  - Swagger unter `/api`
  - Health-Endpoint unter `/health`
- `.env.example` ergänzt

## Verifiziert

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich

## Nächste Schritte

1. `employees` Modul (DDD-light Schichten + CRUD Endpoints)
2. `tasks` + `subtasks` Modul (inkl. `employeeId`-Filter)
3. Auth-Modul (`register` + `login`, JWT Guard)
4. React Foundation (API-Client, Query-Setup, Layout)
5. Task-Board + Employee-Switcher + CRUD + Timeline

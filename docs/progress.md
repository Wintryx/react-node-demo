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
- Task-Regeln:
  - `startDate` ist Pflicht
  - `dueDate` ist optional
  - API-Fieldnamen konsistent in `camelCase`
  - Task-Delete loescht Subtasks per Cascade
- Auth-Regeln:
  - `register` ist oeffentlich
  - JWT Access Token sichern geschuetzte Endpunkte
  - `health` und `auth` bleiben per `@Public()` erreichbar

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
- Skripte fuer `build`, `lint`, `test`, `dev:web`, `dev:api` eingerichtet
- API-Skeleton erweitert:
  - `ConfigModule` global
  - `TypeORM` mit `SQLite`
  - `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`)
  - `helmet`
  - CORS-Basis
  - Swagger unter `/api`
  - Health-Endpoint unter `/health`
- `employees` Modul umgesetzt (DDD-light):
  - Domain: Model + Repository Port
  - Enums: `EmployeeRole`, `EmployeeDepartment`
  - Application: Create/List/Update/Delete Use Cases
  - Delete-Policy: Blockieren bei zugeordneten Tasks (`409 Conflict`)
  - Infrastructure: TypeORM Repository + Entity
  - Presentation: DTOs + Controller (`GET/POST/PATCH/DELETE /employees`)
  - Unit-Tests fuer wichtige Edge-Cases (Conflict/NotFound)
- `tasks` Modul umgesetzt (DDD-light):
  - Domain: Model + Repository Port + Enums (`TaskStatus`, `TaskPriority`)
  - Application: List/Create/Update/Delete Use Cases mit Datums- und Assignee-Pruefung
  - Infrastructure: TypeORM Task/Subtask Entities + Repository + Employee-Checks
  - Presentation: DTOs + Controller (`GET/POST/PATCH/DELETE /tasks`)
  - Subtasks als relationale Tabelle, kein JSON-Blob
  - Task-Filter via `GET /tasks?employeeId=...`
  - Task-Delete mit Cascade auf Subtasks
- `auth` Modul umgesetzt (DDD-light):
  - Endpunkte: `POST /auth/register`, `POST /auth/login`
  - Passwort-Hashing mit `bcrypt` (12 rounds)
  - JWT Access Token Ausgabe bei Register/Login
  - Globaler JWT Guard via `APP_GUARD`
  - `@Public()` fuer oeffentliche Endpunkte
  - Strengeres Throttling auf Auth-Endpunkten
  - Unit-Tests fuer Register/Login Use Cases
- API-E2E erweitert:
  - Health endpoint
  - Auth:
    - Register success
    - Duplicate email conflict (`409`)
    - Login success
    - Invalid credentials (`401`)
    - Protected endpoint blocked without token (`401`)
    - Protected endpoint allowed with token (`200`)
  - Employees:
    - Create + List
    - Duplicate-Email Konflikt (`409`)
    - Enum-Validierung (`400`)
    - Update + Email-Normalisierung
    - Delete + NotFound (`404`)
    - Delete-Konflikt bei zugeordneten Tasks (`409`)
  - Tasks:
    - Create + List mit `employeeId`-Filter
    - Datumsvalidierung (`400`)
    - Update inkl. Subtasks
    - Delete + NotFound (`404`)
- `.env.example` ergaenzt

## Verifiziert

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich
- `npx nx run api-e2e:e2e` erfolgreich (17 Tests)

## Offene technische Punkte (relevant)

- TypeORM Migrations einfuehren (statt langfristig nur `synchronize`)
- Optional: Seed-Daten fuer schnellere lokale UI-Demos
- Auth-Hardening in spaeteren Schritten:
  - Refresh-Token-Flow (optional)
  - Rotation/Revocation-Konzept

## Naechste Schritte

1. React Foundation (API-Client, Query-Setup, Layout)
2. Task-Board + Employee-Switcher + CRUD + Timeline
3. Docker Compose + finale Doku

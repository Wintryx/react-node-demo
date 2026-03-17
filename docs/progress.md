# Projektfortschritt

Stand: 2026-03-17

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
  - Task-Delete löscht Subtasks per Cascade
- Auth-Regeln:
  - `register` ist öffentlich
  - JWT Access Token sichern geschützte Endpunkte
  - `health` und `auth` bleiben per `@Public()` erreichbar
  - Akzeptierter Demo-Tradeoff: Authentifizierte Nutzer teilen einen globalen Workspace (keine Per-User-Ownership-Isolation für Employees/Tasks)
- Frontend-Auth-Regeln:
  - Token-Storage in `sessionStorage` (Demo-Entscheidung)
  - Public Routes: `/login`, `/register`
  - Protected Route: `/app`

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
- Nx-Architekturgrenzen geschärft:
  - Projekt-Tags für `api`, `web`, `api-e2e` eingeführt
  - `@nx/enforce-module-boundaries` auf echte Scope-Constraints umgestellt
- Shared Contract Library eingeführt:
  - `packages/libs/shared-contracts` als gemeinsame Typquelle
  - Web-API-Typen auf Re-Export aus Shared-Lib umgestellt
  - OpenAPI-basierte Typgenerierung via `npm run contracts:generate` eingeführt
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
  - Unit-Tests für wichtige Edge-Cases (Conflict/NotFound)
- `tasks` Modul umgesetzt (DDD-light):
  - Domain: Model + Repository Port + Enums (`TaskStatus`, `TaskPriority`)
  - Application: List/Create/Update/Delete Use Cases mit Datums- und Assignee-Prüfung
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
  - `@Public()` für öffentliche Endpunkte
  - Strengeres Throttling auf Auth-Endpunkten
  - Unit-Tests für Register/Login Use Cases
  - Security-Hardening:
    - fail-fast für `JWT_ACCESS_TOKEN_SECRET` (kein unsicherer Fallback)
    - Mindestlänge für JWT-Secret (>= 32 Zeichen)
    - zentrale JWT-Config-Validierung in `jwt-config.ts` mit Unit-Tests
    - Swagger nur außerhalb von Production aktiviert
    - Environment-Check für Swagger in `swagger-environment.ts` mit Unit-Tests
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
- `.env.example` ergänzt
- Frontend Foundation umgesetzt:
  - Tailwind CSS + Shadcn-style UI-Basis
  - React Query + Axios API-Client
  - Login + Register gegen `/auth/*`
  - Session-basierte Auth (`sessionStorage`)
  - Protected Routing
  - Responsive Dashboard-Shell
  - Employee Switcher + Task-Liste
  - API-Client in fachliche Module aufgeteilt (`auth`, `employees`, `tasks`)
  - Dashboard-Datenlogik als eigener Hook (`useDashboardData`)
  - List + Kanban View für Tasks
  - Timeline/Gantt-like View für Tasks:
    - nach `dueDate` sortiert
    - status-farbige Balken
    - Overdue-Highlighting
    - Klick auf Task öffnet Edit-Modal
    - Zoom-Presets (`compact`, `balanced`, `expanded`)
    - optionale Gruppierung nach Status
    - Tick-Marker + Today-Marker
  - Timeline-Helper mit Unit-Tests (`task-timeline-utils.spec.ts`)
  - Mapper/Helper-Unit-Tests ergänzt:
    - `task-request-mapper.spec.ts`
    - `task-utils.spec.ts`
    - `shared/lib/date.spec.ts`
  - Dashboard-Refactor (Smart/Dumb-Aufteilung):
    - `dashboard-page.tsx` als orchestrierender Container
    - `dashboard-header.tsx`, `dashboard-controls-panel.tsx`, `dashboard-task-section.tsx`
    - `use-task-mutations.ts` für Task-Mutationslogik
  - Frontend-Integrationstests mit gemockter API ergänzt:
    - `dashboard-crud.integration.spec.tsx`
    - Create / Update / Delete / Error-Feedback
    - Modal-Validierung (Pflichtfelder, invalide Subtasks)
    - Delete-Cancel-Flow
    - Inline-Subtask Toggle/Add/Remove
    - Timeline-Klick öffnet Edit-Modal
  - Task Create/Edit/Delete über Modal mit `react-day-picker`
  - Inline Subtask-Interaktionen (Toggle/Add/Remove) in List und Kanban
  - Frontend README erstellt (`packages/apps/web/README.md`)
- Docker Compose Setup umgesetzt:
  - `docker-compose.yml`
  - `docker/api.Dockerfile`
  - `docker/web.Dockerfile`
  - `docker/web.nginx.conf`
  - SPA-Fallback im Web-Container via Nginx `try_files`
  - persistente SQLite-DB via Volume `api_data`
- Fehlerstrategie refactored:
  - Backend liefert strukturierte Fehler-Payloads mit `code`, `message`, `params`
  - Globaler Exception-Filter normalisiert auch Validation-/Guard-Fehler
  - Fachliche Fehlercodes in Auth/Employees/Tasks eingeführt
  - Frontend-Error-Mapping auf code-basierten Ansatz umgestellt (ohne lange Replace-Ketten)
  - API-E2E auf Code-Assertions erweitert
- Build/Quality-Workflow erweitert:
  - Root `npm run lint` schließt `api-e2e` ein
  - Root `npm run test` schließt `api-e2e` ein
- API-E2E Lauf robuster gemacht:
  - eigener API-Prozess pro Testlauf
  - dynamischer dedizierter Port (optional über `API_E2E_PORT`)
  - temporäre SQLite-Datei pro Lauf mit Cleanup im Teardown
- Doku ergänzt:
  - API-Error-Contract in Root-README und API-README dokumentiert
  - Hinweis zu bewusst committeten Demo-ENV-Templates (`.env.example`) hinzugefügt
  - Demo-Authorization-Scope explizit dokumentiert (Root-README + API-README)
  - Root-README um Teststrategie + Coverage-Snapshot ergänzt
  - Root-README um kurzen Demo-Skript-Abschnitt (typische End-to-End-Flows) ergänzt
- TypeORM-Migrationsstrategie umgesetzt:
  - zentrale TypeORM-Konfiguration (`typeorm.config.ts`) eingeführt
  - `synchronize` deaktiviert
  - initiale SQL-Migration für Auth/Employees/Tasks/Subtasks erstellt
  - zentrale CLI-DataSource für TypeORM-Migrationsbefehle angelegt
  - Root-Skripte für `db:migration:*` hinzugefügt
  - API startet standardmäßig mit `migrationsRun` (via `TYPEORM_MIGRATIONS_RUN`)

## Verifiziert

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich
- `npx nx run api-e2e:e2e` erfolgreich (17 Tests)
- Re-Check am 2026-03-17:
  - API Unit: 12 Suites / 27 Tests erfolgreich
  - Web (Vitest): 10 Files / 42 Tests erfolgreich
  - API-E2E: 4 Suites / 17 Tests erfolgreich

## Offene technische Punkte (relevant)

- Optional: Seed-Daten für schnellere lokale UI-Demos
- Auth-Hardening in späteren Schritten:
  - Refresh-Token-Flow (optional)
  - Rotation/Revocation-Konzept

## Nächste Schritte

1. Optional: E2E UI-Smoke-Tests
2. Optional: Seed-Workflow für reproduzierbare Demo-Daten
3. Optional: Auth-Hardening (Refresh/Rotation/Revocation)

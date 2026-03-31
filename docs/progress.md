# Projektfortschritt

Stand: 2026-03-31

## Refactoring-Pakete (ab 2026-03-30)

- [x] Paket 1 - Docker Compose Startfähigkeit stabilisiert
  - `docker-compose.yml` um fehlende Auth-Variablen ergänzt:
    - `JWT_REFRESH_TOKEN_SECRET`
    - `JWT_REFRESH_TOKEN_EXPIRES_IN`
    - `AUTH_COOKIE_SAME_SITE`
    - `AUTH_COOKIE_SECURE`
    - `TYPEORM_MIGRATIONS_RUN`
  - fail-fast-kompatible Default-Secrets mit ausreichender Mindestlänge gesetzt
  - Compose auf lokalen Demo-Betrieb ausgerichtet (`NODE_ENV=development`)
  - Verifiziert mit `docker compose config`
- [x] Paket 2 - `dueDate`-Clearing-Fix (Update-Semantik + Tests)
  - Backend akzeptiert explizites `dueDate: null` im Task-Update (`UpdateTaskDto`)
  - Mapper-Semantik getrennt: `undefined` = unverändert, `null` = löschen
  - Frontend-Update-Payload unterscheidet jetzt zuverlässig zwischen "unverändert" und "explizit gelöscht"
  - Tests ergänzt:
    - API Unit: `task-input.mapper.spec.ts`
    - Web Unit: `task-form-state.spec.ts`
    - API E2E: `tasks.spec.ts` (`dueDate` wird per PATCH auf `null` gelöscht)
- [x] Paket 3 - Employee-CRUD-Frontend (API/Hook/UI + Integrationstests)
  - Slice 3A umgesetzt (API + Hook-Grundlage)
  - `employeesApi` um `create`, `update`, `delete` erweitert
  - `useEmployeeMutations` als eigener Hook ergänzt (Smart-Logik, Query-Invalidation für `employees`/`tasks`)
  - API-Client-Tests ergänzt: `employees-api.spec.ts`
  - Slice 3B umgesetzt (Dashboard-UI + Integration)
  - Employee-Management-Panel im Dashboard: Create/Edit/Delete
  - Integrationstests ergänzt: Create/Edit/Delete Employee in `dashboard-crud.integration.spec.tsx`
- [x] Paket 4 - UI-Sprache Englisch als Default (inkl. Error-Mapping)
  - Auth-Views auf Englisch umgestellt (`login-page.tsx`, `register-page.tsx`, `password-rules.ts`)
  - Dashboard-UI, Formulare und Timeline-Texte auf Englisch umgestellt
  - API-Error-Mapping auf Englisch umgestellt (`shared/api/errors.ts`)
  - Tests angepasst:
    - `dashboard-crud.integration.spec.tsx`
    - `errors.spec.ts`
  - Verifiziert mit:
    - `npx nx test web`
    - `npx nx lint web`
- [x] Cleanup nach Paket 4 - Refactor ohne Overengineering
  - `window.confirm` aus Hook-Layer in UI/Container verschoben (`dashboard-page.tsx`)
  - gemeinsame Mutation-Utility für Fehler-Mapping/Execution eingeführt (`hooks/mutation-utils.ts`)
  - Dashboard-Copy zentralisiert (`dashboard-copy.ts`) und in Komponenten/Tests angebunden
  - Verifiziert mit:
    - `npx nx test web`
    - `npx nx lint web`
- [x] Paket 5 - Seed-Workflow + Doku-Roundup
  - idempotenter Seed-Workflow ergänzt (`npm run db:seed`)
  - Demo-Seeddaten für Auth-User, Employees, Tasks und Subtasks umgesetzt
  - Demo-Login-Credentials in Root/API-README dokumentiert (`demo.user@example.com` / `DemoPass!123`)
  - Seed-Sicherheitsgrenze ergänzt:
    - Blockierung in Production ohne explizites `ALLOW_PRODUCTION_DB_SEED=true`
  - Seed-Importe pragmatisch gehalten (direkte Importe, nur bestehende sinnvolle Barrels beibehalten)
  - API-Tests ergänzt:
    - `seed-demo-data.spec.ts` (Erstlauf + Idempotenz)
  - Dokumentation ergänzt:
    - Root-README und API-README um Seed-Nutzung erweitert
  - Verifiziert mit:
    - `npx nx test api`
    - `npx nx lint api`
    - `npm run db:seed` (zweimaliger Smoke-Run, idempotent)

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
  - Umgesetzter Ausbau: Session-Continuity in kleinen Schritten (Silent Refresh + kontrollierter 401-Retry + Rotation + Hardening-Doku)

## Auth-Roadmap (Update 2026-03-24)

Status:

- Phase 1 abgeschlossen (2026-03-24)
  - `authApi.refresh()` umgesetzt
  - `AuthProvider` Bootstrap mit Session-Validierung und Refresh-Fallback umgesetzt
  - Testabdeckung erweitert: `auth-context.spec.tsx` und `app.spec.tsx`
- Phase 2 abgeschlossen (2026-03-24)
  - kontrollierter 401-Retry mit Single-Flight-Refresh im API-Client umgesetzt
  - neue Tests: `auth-refresh.spec.ts` (Endpoint-Erkennung, Erfolg/Fehler, Single-Flight)
- Phase 3 abgeschlossen (2026-03-24)
  - `/auth/refresh` rotiert Refresh-Token und setzt ein neues HttpOnly-Cookie
  - Replay-Schutz verbessert: Refresh-Token werden vor Persistenz gehasht (SHA-256 -> bcrypt), um bcrypt-72-Byte-Trunkierung zu vermeiden
  - API-Tests erweitert: Rotationsfall in `api-e2e/src/api/auth.spec.ts` + Regressionstest `auth-refresh-session.service.spec.ts`
- Phase 4 abgeschlossen (2026-03-24)
  - Session-Policy dokumentiert: `docs/security/session-policy.md`
  - Produktions-Runbook dokumentiert: `docs/security/auth-production-runbook.md`
  - Produktions-Guardrails ergänzt: API fail-fast bei unsicherer `CORS_ORIGIN`/`AUTH_COOKIE_SECURE` Konfiguration

Kurzfazit (Phasen 1-4):
Kernfazit: Silent-Refresh beim App-Start und kontrollierter 401-Retry halten die Session im normalen Nutzungsfluss stabil. Der Refresh-Flow wurde backendseitig durch Token-Rotation und Replay-Schutz gehärtet. Phase 4 ergänzt verbindliche Session-Policy, ein Produktions-Runbook und API-Guardrails gegen unsichere Cookie/CORS-Produktionskonfigurationen.

Referenzdokumente:

- `docs/descriptions/authentication-deep-dive.md`
- `docs/descriptions/frontend-click-flow-guide.md`
- `docs/security/session-policy.md`
- `docs/security/auth-production-runbook.md`

Zielbild:

- Kurzlebiges Access Token bleibt (`15m` als Security-Basis).
- Refresh Token bleibt im HttpOnly-Cookie.
- Nutzer sollen bei abgelaufenem Access Token nicht unnötig sofort auf Login fallen.

Geplante Häppchen:

- [x] **Phase 1 - Silent Refresh Bootstrap (Frontend)**
  - `authApi.refresh()` einführen
  - `AuthProvider` startet mit `isInitializing=true`
  - beim App-Start einmal `/auth/refresh` versuchen, wenn Session nicht verwertbar ist
  - DoD: Reload nach >15min funktioniert ohne sofortige Login-Weiterleitung (bei gültigem Refresh-Cookie)

- [x] **Phase 2 - Kontrollierter 401-Retry (Frontend)**
  - Axios-Interceptor: bei erstem `401` einmal Refresh versuchen, Request einmalig wiederholen
  - Single-Flight für parallele `401` Requests
  - Schutz gegen Endlosschleife via Retry-Flag
  - DoD: Access-Token-Ablauf während Nutzung löst nicht sofort Logout aus

- [x] **Phase 3 - Refresh-Token-Rotation (Backend + Frontend)**
  - `/auth/refresh` stellt neues Refresh-Cookie + neuen Hash in DB aus
  - altes Refresh-Token wird dadurch unbrauchbar
  - API-E2E-Tests um Rotationsfall erweitern
  - DoD: Replay-Fenster reduziert, Logout/Refresh bleibt stabil

- [x] **Phase 4 - Optionales Hardening**
  - Session-Policy klar dokumentieren (Idle + Absolute Timeout)
  - Produktions-Runbook für Cookie/CORS/Secret-Rotation ergänzen

## Erledigt

- Auth Session Continuity - Phase 1 (Silent Refresh Bootstrap) umgesetzt
- Auth Session Continuity - Phase 2 (401-Retry + Single-Flight) umgesetzt
- Auth Session Continuity - Phase 3 (Refresh-Token-Rotation + Replay-Schutz) umgesetzt
- Auth Session Continuity - Phase 4 (Policy + Runbook + Produktions-Guardrails) umgesetzt
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
  - Layer-Tags (`layer:app`, `layer:test`, `layer:contracts`) und zusätzliche Constraints ergänzt
- Shared Contract Library eingeführt:
  - `packages/libs/shared-contracts` als gemeinsame Typquelle
  - Web-API-Typen auf Re-Export aus Shared-Lib umgestellt
  - OpenAPI-basierte Typgenerierung via `npm run contracts:generate` eingeführt
  - API-Layer-Imports im Web teilweise direkt auf `@react-node-demo/shared-contracts` umgestellt
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
  - Repository-Refactor:
    - Duplikate in `TypeOrmTaskRepository` reduziert (zentrale Load-/Patch-Helper)
- `auth` Modul umgesetzt (DDD-light):
  - Endpunkte: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
  - Passwort-Hashing mit `bcrypt` (12 rounds)
  - JWT Access Token Ausgabe bei Register/Login/Refresh
  - HttpOnly Refresh-Token-Cookie Flow (Stage 1):
    - Persistierter Refresh-Token-Hash in `auth_users`
    - Refresh-Token-Verifikation via JWT + Hash-Abgleich
    - Logout invalidiert serverseitige Refresh-Session
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
  - Task-Form-Refactor:
    - `TaskFormDialog` in Hook + Subcomponents aufgeteilt
    - `use-task-form-state.ts`, `task-form-core-fields.tsx`, `task-form-subtasks-editor.tsx`
    - Payload-/Validation-Logik in `task-form-state.ts` zentralisiert
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

## Struktur-Update (2026-03-17)

- Dashboard-Feature weiter modularisiert:
  - `form/` für Task-Form-Dialog + State-Hook + Payload-Mapping
  - `components/` für Dashboard-UI-Bausteine
  - `views/` für List/Kanban/Timeline
  - `hooks/` für Daten- und Mutationslogik
  - `utils/` für Helper/Mapper und zugehörige Tests

## Verifiziert

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich
- `npx nx run api-e2e:e2e` erfolgreich (21 Tests)
- Re-Check am 2026-03-17:
  - API Unit: 14 Suites / 35 Tests erfolgreich
  - Web (Vitest): 10 Files / 42 Tests erfolgreich
  - API-E2E: 4 Suites / 20 Tests erfolgreich
- Re-Check am 2026-03-24:
  - API Unit: 16 Suites / 37 Tests erfolgreich
  - API-E2E: 4 Suites / 21 Tests erfolgreich

## Review-Feedback 2026-03-30 (offene Maßnahmen)

- P0: Employee-CRUD im Frontend nachziehen (Create/Edit/Delete inkl. Tests), damit der Requirement-Scope auch in der UI vollständig erfüllt ist. (Erledigt 2026-03-30)
- P0: UI-Sprache auf Englisch als Default umstellen oder i18n mit `en` als Default einführen (inkl. Error-Messages). (Erledigt 2026-03-31)
- P0: `docker-compose.yml` um fehlende Pflicht-Variablen ergänzen (`JWT_REFRESH_TOKEN_SECRET` und konsistente Auth-Cookie-Settings), damit Fresh-Clone-Start stabil funktioniert. (Erledigt 2026-03-30)
- P1: `dueDate`-Clearing im Task-Update-Flow explizit absichern (Unterscheidung zwischen "nicht geändert" vs. "explizit löschen") und mit Tests abdecken. (Erledigt 2026-03-30)
- P1: Seed-Workflow für reproduzierbare Demo-Daten ergänzen (`npm`/`nx` Script + dev-only Seed-Quelle). (Erledigt 2026-03-31)
- P2: Transparenzabschnitt zu AI-unterstützter Entwicklung ergänzen (welche Teile assistiert waren, welche Architekturentscheidungen manuell getroffen wurden).
- P2: Scope-Kalibrierung im Frontend/Docs vornehmen (Komplexität reduzieren, wo sie keinen funktionalen Mehrwert für den Requirement-Scope bringt).
- P2: Session-Strategie für Production explizit entscheiden (weiter `sessionStorage` als Demo-Tradeoff vs. Memory-Token + Refresh-Only Ansatz).
- P2: Roadmap für Per-User-Data-Isolation definieren (Ownership/Scope je Benutzer statt globalem Workspace).
- Hinweis: Refresh-Token-Rotation ist bereits umgesetzt (Phase 3 abgeschlossen) und gilt nicht mehr als offener Punkt.

Historische Restpunkte (nachrangig, durch Backlog oben übersteuert):

## Offene technische Punkte (relevant)

Verbindlicher Backlog (Stand 2026-03-30):

- P0: Employee-CRUD im Frontend nachziehen (Create/Edit/Delete inkl. Tests), damit der Requirement-Scope auch in der UI vollständig erfüllt ist. (Erledigt 2026-03-30)
- P0: UI-Sprache auf Englisch als Default umstellen oder i18n mit `en` als Default einführen (inkl. Error-Messages in UI und `errors.ts`). (Erledigt 2026-03-31)
- P0: `docker-compose.yml` um fehlende Pflicht-Variablen ergänzen (`JWT_REFRESH_TOKEN_SECRET`, `AUTH_COOKIE_SECURE`, `AUTH_COOKIE_SAME_SITE`) und Fresh-Clone-Start verifizieren. (Erledigt 2026-03-30)
- P1: `dueDate`-Clearing im Task-Update-Flow explizit absichern (Unterscheidung zwischen "nicht geändert" vs. "explizit löschen") und mit Tests abdecken. (Erledigt 2026-03-30)
- P1: Seed-Workflow für reproduzierbare Demo-Daten ergänzen (`npm`/`nx` Script + dev-only Seed-Quelle). (Erledigt 2026-03-31)
- P2: Transparenzabschnitt zu AI-unterstützter Entwicklung ergänzen (welche Teile assistiert waren, welche Architekturentscheidungen manuell getroffen wurden).
- Hinweis: Refresh-Token-Rotation ist bereits umgesetzt (Phase 3 abgeschlossen) und gilt nicht mehr als offener Punkt.

- Optional: Seed-Daten für schnellere lokale UI-Demos
- Auth-Hardening in späteren Schritten:
  - Optional: Multi-Device Session-Management/Revocation

## Nächste Schritte (historisch)

1. P2: Doku-Polish (AI-Transparenz + Scope-Kalibrierung) abschließen.

## Review-Backlog 2026-03-30 (autoritativ für Umsetzung)

- P0: Employee-CRUD-UI (Create/Edit/Delete) inkl. Integrationstests im Dashboard umsetzen. (Erledigt 2026-03-30)
- P0: UI auf Englisch als Default (oder i18n mit `en` als Default) umstellen, inklusive `errors.ts`. (Erledigt 2026-03-31)
- P0: Docker-Compose-Startfix umsetzen (`JWT_REFRESH_TOKEN_SECRET` + konsistente Cookie-Env-Werte). (Erledigt 2026-03-30)
- P1: `dueDate`-Clearing-Bug im Task-Update-Mapper fixen und mit gezielten Tests absichern. (Erledigt 2026-03-30)
- P1: Seed-Script für reproduzierbare Demo-Daten ergänzen. (Erledigt 2026-03-31)
- P2: Transparenz zu AI-Assistenz dokumentieren (kurzer Abschnitt in Doku).
- P2: Scope-Kalibrierung/Produktions-Roadmap festhalten (Session-Strategie, Per-User-Isolation).
- Hinweis: Refresh-Token-Rotation ist bereits umgesetzt und nicht mehr offen.

Empfohlene Reihenfolge:
1. A: Doku-Polish (AI-Transparenz + Scope-Kalibrierung).

## Nächste Schritte (verbindlich, Stand 2026-03-31)

1. P2: Doku-Polish (AI-Transparenz + Scope-Kalibrierung) abschließen.

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
- `.env.example` ergaenzt

## Verifiziert

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich

## Offene technische Punkte (relevant)

- TypeORM Migrations einfuehren (statt langfristig nur `synchronize`)
- Delete-Policy technisch nachziehen, sobald `tasks` Modul existiert:
  - aktueller Task-Check im Employees-Repository ist als Uebergang geloest
  - spaeter sauber ueber Task-Entity/FK und Domain-Regel absichern
- API-E2E um `employees` Endpunkte erweitern (CRUD + Konflikt-/Validierungsfaelle)
- Optional: Seed-Daten fuer schnellere lokale UI-Demos

## Naechste Schritte

1. `tasks` + `subtasks` Modul (inkl. `employeeId`-Filter)
2. Auth-Modul (`register` + `login`, JWT Guard)
3. React Foundation (API-Client, Query-Setup, Layout)
4. Task-Board + Employee-Switcher + CRUD + Timeline

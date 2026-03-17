# Implementierungsguide (harmonisiert auf Ist-Stand)

Stand: 2026-03-17

## 1. Ziel und Scope

Dieses Projekt liefert eine Senior-level Demo für das Assessment:

- Frontend: React + TypeScript
- Backend: NestJS + TypeScript
- DB: SQLite mit TypeORM
- Bonus: JWT Auth, Docker Compose, Tests

Architekturziel:

- DDD-light pro Modul (`auth`, `employees`, `tasks`)
- SOLID-orientierte Trennung in `domain`, `application`, `infrastructure`, `presentation`
- strikte Typisierung ohne `any`
- pragmatisch, ohne Over-Engineering

---

## 2. Erfüllungsgrad gegen Anforderungen

### Pflichtanforderungen

Alle Pflichtanforderungen sind umgesetzt:

- Employees CRUD (`GET/POST/PATCH/DELETE /employees`)
- Tasks CRUD inkl. `employeeId` Filter (`GET/POST/PATCH/DELETE /tasks`)
- Task-Subtasks inkl. inline Add/Remove/Toggle im Frontend
- Task Create/Edit/Delete mit Dialogen und Confirm-Flow
- Employee Switcher als Board-Filter
- Timeline/Gantt-like View:
  - nach `dueDate` sortiert
  - Status-Farbcodes
  - Overdue Highlight
  - Klick auf Task öffnet Edit-Modal
- Swagger unter `/api`
- DTO-Validierung via `class-validator`
- Moderne UI mit Tailwind + Shadcn-style Basis

### Bonusanforderungen

Ebenfalls umgesetzt:

- JWT Auth (`/auth/register`, `/auth/login`, geschützte Endpunkte)
- `docker-compose.yml` (API + Web, persistente SQLite via Volume)
- Unit-/Integrations-/funktionale E2E-Tests

---

## 3. Reale Architektur im Repository

```txt
react-node-demo/
  packages/
    apps/
      api/
        src/
          modules/
            auth/
            employees/
            tasks/
          shared/
            docs/
            errors/
            persistence/
      web/
        src/
          app/
          features/
            auth/
            dashboard/
          shared/
            api/
            lib/
            ui/
      api-e2e/
        src/
          api/
          support/
  docs/
    requirements.md
    implementation-guide.md
    progress.md
```

Kontext:

- `dashboard-page.tsx` ist Container/Orchestrator
- Dashboard-UI in dedizierte Teilkomponenten aufgeteilt
- API-Client modular (`auth`, `employees`, `tasks`)

---

## 4. Technische Kernentscheidungen (umgesetzt)

1. Nx Monorepo mit `packages/apps/*`
2. npm als Paketmanager
3. SQLite + TypeORM
4. Migration-based Schema Strategy (kein long-term `synchronize`)
5. React Query für Server State
6. Session Storage für JWT (Demo-Tradeoff)
7. Strikte Typisierung:
   - TypeScript `strict`
   - `noImplicitAny`
   - ESLint `no-explicit-any: error`
8. Nx Boundary Enforcement:
   - Scope-Tags für Projekte
   - echte `depConstraints` statt Wildcard-Regel
9. Shared API Contracts:
   - gemeinsame Typen in `packages/libs/shared-contracts`
   - OpenAPI-basierte Typgenerierung via `npm run contracts:generate`

---

## 5. Security- und API-Stand

Umgesetzt:

- `helmet`
- restriktives CORS-Setup
- globale ValidationPipe (`whitelist`, `forbidNonWhitelisted`, `transform`)
- JWT Guard global mit `@Public()` Ausnahmen
- Rate Limiting auf Auth-Endpunkten
- Passwort-Hashing via `bcrypt`
- fail-fast JWT Secret Validation (inkl. Mindestlänge)
- Swagger nur außerhalb Produktion
- strukturierter API-Error-Contract:
  - `statusCode`, `code`, `message`, `params`, `path`, `timestamp`
- Frontend mappt Fehler primär über stabile `code` Werte

Bewusster Demo-Tradeoff:

- Authentifizierte Nutzer arbeiten in einem globalen Workspace
- keine Per-User-Ownership-Isolation für Employees/Tasks

---

## 6. Teststrategie und Qualität

Aktueller Stand:

- Backend Unit Tests mit Jest (`packages/apps/api`)
- Frontend Unit + Integration mit Vitest/Testing Library (`packages/apps/web`)
- API-E2E (funktionale Blackbox-Tests) mit Jest (`packages/apps/api-e2e`)
- Root-Skripte:
  - `npm run lint` -> web + api + api-e2e
  - `npm run test` -> web + api + api-e2e
  - `npm run build` -> web + api

Verifiziert:

- lint/test/build erfolgreich
- api-e2e erfolgreich

---

## 7. Was fehlt noch an Umsetzung?

### Für die Assessment-Abgabe (Pflicht)

Nichts Kritisches. Der Pflichtumfang ist umgesetzt.
Ein kurzer Demo-Skript-Abschnitt ist in der Root-README enthalten.

### Sinnvolle optionale Abschlusspunkte (kurzfristig)

1. UI Smoke E2E (z. B. Playwright)
2. Seed-Workflow für reproduzierbare Demo-Daten
3. CI Workflow (Lint/Test/Build bei Push/PR)

### Production-Hardening (bewusst außerhalb Demo-Scope)

1. Refresh-Token Rotation + Revocation
2. Ownership/RBAC Autorisierung statt globalem Workspace
3. Audit Logging sicherheitsrelevanter Aktionen
4. Security Header/CSP Feintuning pro Deployment
5. Backup-/Migrations-Runbook

---

## 8. Empfohlene Reihenfolge ab jetzt

1. CI Pipeline (schneller Qualitätshebel)
2. Seed-Workflow (bessere Reproduzierbarkeit)
3. UI Smoke E2E (Abgabesicherheit)
4. Optional Auth-Hardening (nur wenn gewünscht)

---

## 9. Agent-Arbeitsmodus (fortlaufend)

Pro Schritt:

1. Kleine, klar abgegrenzte Aufgabe
2. Implementierung + lokale Verifikation
3. README + `docs/progress.md` aktualisieren
4. Englischer Commit-Text und exakte Git-Befehle

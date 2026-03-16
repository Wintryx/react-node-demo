# Implementierungsguide (React + NestJS)  
Senior-Level, DDD/SOLID, ohne Over-Engineering

## 1. Zielbild

Wir bauen eine produktionsnahe Demo-App für Task-Management mit:

- Frontend: React + TypeScript
- Backend: NestJS + TypeScript (Node.js)
- Datenbank: SQLite
- Bonus: JWT Auth, `docker-compose.yml`, Unit-Tests

Fokus:

- klare Domänengrenzen (DDD-light)
- wartbare, testbare Schichten (SOLID)
- pragmatisch: nur so viel Abstraktion wie notwendig

---

## 2. Architekturprinzipien

## DDD-light statt Full-Enterprise-DDD

- Bounded Contexts: `employees`, `tasks`, `auth`
- Pro Context klare Schichten:
  - `domain` (Kernlogik, Regeln, Interfaces)
  - `application` (Use Cases)
  - `infrastructure` (ORM/Repos/DB-Mapping)
  - `presentation` (Controller/DTOs)

Wichtig: Wir modellieren **Use Cases explizit**, vermeiden aber unnötige Patterns (keine Event-Sourcing/CQRS-Overhead, solange nicht nötig).

## SOLID konkret

- `S`: Kleine Services/Use Cases mit einem Zweck
- `O`: Erweiterbar über Interfaces (z. B. Repository-Abstraktion)
- `L`: Klare Contracts für Repositories/Services
- `I`: Schmale Interfaces pro Use Case
- `D`: Controller hängen von Use Cases/Ports, nicht direkt von ORM-Details

---

## 3. Zielstruktur im Repository

```txt
react-node-demo/
  packages/
    apps/
      api/                       # NestJS
        src/
          modules/
            employees/
              domain/
              application/
              infrastructure/
              presentation/
            tasks/
              domain/
              application/
              infrastructure/
              presentation/
            auth/
              domain/
              application/
              infrastructure/
              presentation/
          shared/
            domain/
            infrastructure/
            presentation/
      web/                       # React
        src/
          app/
          pages/
          widgets/
          features/
            employee-switcher/
            task-editor/
            subtask-inline-editor/
          entities/
            employee/
            task/
          shared/
            api/
            lib/
            ui/
  docs/
  docker-compose.yml
  README.md
```

Hinweis: Wir nutzen Nx als Monorepo-Tool, halten die Struktur bewusst klar mit `packages/apps/api` + `packages/apps/web`.

---

## 4. Technologiewahl (empfohlen)

Backend:

- NestJS
- TypeORM + SQLite
- `class-validator` + `class-transformer`
- Swagger via `@nestjs/swagger`
- JWT via `@nestjs/jwt` + `passport-jwt`

Frontend:

- React + TypeScript + Vite
- React Query (`@tanstack/react-query`) für Server-State
- React Hook Form für Formulare
- Shadcn/UI + TailwindCSS (modern, schnell)
- Timeline/Gantt: custom mit CSS Grid (leichtgewichtig) oder lib (z. B. `frappe-gantt`) falls Zeit knapp

Qualität:

- ESLint + Prettier
- Husky + lint-staged (Pre-Commit)
- Optional: Commitlint + Conventional Commits

---

## 5. Umsetzung in Häppchen (iterativ)

Jedes Häppchen endet mit: lauffähigem Stand, Commit, kurzer README-Notiz.

## Häppchen 0: Projekt-Setup & Tooling

Ergebnis:

- Nx Workspace initialisiert
- Ordnerstruktur (`packages/apps/api`, `packages/apps/web`)
- Node-Version fixieren (`.nvmrc` / Volta optional)
- ESLint + Prettier + EditorConfig
- Basis-Skripte (`dev`, `build`, `lint`, `test`)

Definition of Done:

- `npm run lint` in beiden Apps grün
- einheitliche Formatierung aktiv

## Häppchen 1: Backend Skeleton (Nest)

Ergebnis:

- Nest App mit globalem Prefix (`/api` optional) und Swagger unter `/api`
- zentrale Config (`ConfigModule`)
- Health-Endpoint

Definition of Done:

- App startet lokal
- Swagger UI verfügbar

## Häppchen 2: Employees CRUD

Ergebnis:

- Endpoints:
  - `GET /employees`
  - `POST /employees`
  - `PATCH /employees/:id`
  - `DELETE /employees/:id`
- DTO-Validierung mit `class-validator`
- Fehlerbehandlung (404, 400)

Definition of Done:

- CRUD manuell über Swagger getestet
- Basis-Unit-Tests für Service/Use Cases

## Häppchen 3: Tasks + Subtasks CRUD

Ergebnis:

- Endpoints:
  - `GET /tasks?employeeId=`
  - `POST /tasks`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
- Task gehört zu Employee
- Subtasks inline im Task-Payload

Definition of Done:

- `employeeId`-Filter funktioniert
- Update von Subtasks robust (add/edit/remove)

## Häppchen 4: Frontend Foundation

Ergebnis:

- React App mit Routing, Layout, Design Tokens
- API Client + React Query Setup
- Basis-UI in Shadcn/Tailwind

Definition of Done:

- App startet
- API-Anbindung zu Nest funktioniert

## Häppchen 5: Task Board + Employee Switcher

Ergebnis:

- Employee-Auswahl
- Task-Liste gefiltert nach Employee
- Status/Priority Badges

Definition of Done:

- Wechsel Employee aktualisiert Daten korrekt

## Häppchen 6: Task erstellen/bearbeiten/löschen

Ergebnis:

- Create/Edit Modal mit Feldern laut Anforderungen
- Delete mit Confirmation Dialog
- Inline Subtask Editor (toggle/add/remove)

Definition of Done:

- Komplettes Task-Lifecycle im UI nutzbar
- Formvalidierung und Fehlermeldungen klar

## Häppchen 7: Timeline / Gantt View

Ergebnis:

- Tasks nach `dueDate` sortiert
- Farbcode nach Status
- Overdue-Highlight
- Klick auf Task öffnet Edit-Modal

Definition of Done:

- Timeline interaktiv und visuell klar auf Desktop + Mobile

## Häppchen 8 (Bonus): JWT Auth

Ergebnis:

- Auth-Endpoints (`login`, optional `register`)
- JWT Guard für Task/Employee-Endpoints
- Frontend Login-Flow + Token Handling

Definition of Done:

- Ungeschützte Zugriffe auf geschützte Endpoints blockiert
- User kann einloggen und weiterarbeiten

## Häppchen 9 (Bonus): Docker Compose

Ergebnis:

- `docker-compose.yml` mit `api` und `web` (SQLite läuft in der API, kein separater DB-Container nötig)
- Env-Handling dokumentiert

Definition of Done:

- One-command Start funktioniert

## Häppchen 10 (Bonus): Tests & Finalisierung

Ergebnis:

- Backend Unit-Tests für zentrale Use Cases
- Frontend smoke/integration Tests (mind. Kernflows)
- README mit Setup, Architektur, Entscheidungen

Definition of Done:

- reproduzierbares Setup von Null
- Bewerbungstaugliche Dokumentation

---

## 6. Backend-Detaildesign (pragmatisch)

## Domain-Regeln (Beispiele)

- `dueDate` darf nicht vor `startDate` liegen
- Subtask ohne `title` ist ungültig
- Task muss einem existierenden Employee zugewiesen sein

## API- und DTO-Strategie

- `CreateTaskDto`, `UpdateTaskDto`, `CreateEmployeeDto`, `UpdateEmployeeDto`
- `ValidationPipe` global mit `whitelist`, `forbidNonWhitelisted`
- Fehlerformat konsistent halten

## Persistenzmodell (TypeORM-Vorschlag)

- `Employee` 1:n `Task`
- `Task` 1:n `Subtask` (als eigene Tabelle, nicht JSON)

Warum: sauberere Queries, bessere Erweiterbarkeit, klare Constraints.

---

## 7. Frontend-Detaildesign (Angular -> React Brücke)

## Denkweise-Mapping für dich

- Angular Service + RxJS Store -> React Query + API Client
- Angular Reactive Forms -> React Hook Form
- Input/Output + DI -> Props + Hooks + Context (sparsam)
- Module-lastig -> Feature-first Ordnerstruktur

## State-Strategie

- Server-State: React Query
- UI-State (Modals/Filter): lokaler State
- Kein globaler Store (Redux/Zustand) ohne echten Bedarf

## Komponenten-Schnitt

- Container-Komponenten: Daten laden, Mutations triggern
- Presentational-Komponenten: rein UI, props-getrieben

---

## 8. Linting, Formatting, Codequalität

## ESLint (sinnvoll, nicht dogmatisch)

- `@typescript-eslint/recommended`
- `eslint-plugin-import`
- `eslint-plugin-unused-imports`
- `no-console`: `warn` (in App-Code), `off` für lokale Scripts
- `@typescript-eslint/no-explicit-any`: `error` (keine `any`-Deklarationen im Projektcode)
- `import/order`: konsistente Imports

## Prettier

- `semi: true`
- `singleQuote: true`
- `trailingComma: all`
- `printWidth: 100`

Typisierungsregel:

- `strict: true` + `noImplicitAny: true` als Default-Basis

## Git Hooks

- pre-commit: `lint-staged` (nur geänderte Dateien)
- optional pre-push: Test-Suite (mindestens Backend Unit-Tests)

---

## 9. Risiken und Gegenmaßnahmen

- Risiko: Zu viele Abstraktionen früh.
  - Maßnahme: Erst direkte Use Cases + Repo-Interface; nur extrahieren, wenn Wiederholung entsteht.
- Risiko: Timeline frisst Zeit.
  - Maßnahme: MVP-Timeline zuerst (sortiert + farbig + click/edit), danach visuelle Verfeinerung.
- Risiko: JWT + CORS + Token-Handling.
  - Maßnahme: Früh E2E-Smoke testen (`login -> list tasks -> create task`).

---

## 10. Entscheidungen (festgelegt)

Stand: 2026-03-16

1. Datenbank: `SQLite`
2. Paketmanager: `npm`
3. Monorepo-Tool: `Nx`
4. Auth-Scope: `register + login` und Schutz für alle relevanten Endpoints
5. Testtiefe: `minimal + wichtige Edge-Cases`

## Empfehlung Timeline/Gantt

Empfehlung: **Custom Timeline MVP** (ohne externe Gantt-Library) mit CSS Grid.

Begründung:

- schneller kontrollierbar für Demo-Anforderungen
- weniger Abhängigkeiten/Komplexität
- gutes Signal für Senior-Level (eigene, saubere UI-Logik)

Fallback:

- Falls Zeit knapp oder Layout zu aufwendig wird: `frappe-gantt` als gezielter Ersatz.

---

## 10.1 Nx-Baseline (für Angular-Hintergrund)

Ziel: Vorteile von Nx nutzen, ohne Setup-Overhead.

- Workspace als Integrated Monorepo mit `packages/apps/api` und `packages/apps/web`
- Nx Plugins:
  - `@nx/nest`
  - `@nx/react`
  - `@nx/vite`
  - `@nx/eslint`
  - `@nx/jest` (nur falls wir für Backend nicht Vitest nehmen)
- Aktivieren: `@nx/enforce-module-boundaries` für klare Layer-Grenzen
- `nx.json`:
  - `targetDefaults` mit Cache für `build`, `test`, `lint`
  - `namedInputs` sauber setzen (`production`, `default`)
- Projekt-Tags für Architekturgrenzen:
  - Beispiel: `scope:api`, `scope:web`, `layer:domain`, `layer:application`, `layer:infrastructure`, `layer:presentation`

Angular-Mapping:

- Denk an Nx wie an Angular Workspace + stärkere Monorepo-Tooling-Layer.
- `nx graph` hilft dir sofort bei Abhängigkeiten/Architektur-Checks.

---

## 10.2 Security-Baseline (OWASP Top 10 relevant)

Wir setzen bewusst Security-Mindeststandards, ohne unnötige Komplexität:

- `helmet` im Nest Backend (sichere HTTP Header)
- strikte DTO-Validierung (`ValidationPipe`, `whitelist`, `forbidNonWhitelisted`)
- `bcrypt` fürs Passwort-Hashing
- kein Klartext-Passwort-Logging
- CORS restriktiv auf Frontend-Origin
- Rate Limiting auf Auth-Endpunkte (`/auth/login`, `/auth/register`)
- einheitliches Error-Handling ohne interne Stack-Details für Clients

XSS:

- React rendert escaped by default
- kein `dangerouslySetInnerHTML`
- serverseitig Input-Validierung + Längenlimits

CSRF:

- Bei JWT im `Authorization` Header ist klassisches CSRF-Risiko deutlich reduziert.
- Wenn wir Tokens in Cookies nutzen, ergänzen wir CSRF-Token-Strategie (`double submit`).

Passwort-/Token-Policy (pragmatisch):

- Access Token kurzlebig (z. B. 15m)
- sichere Secret-Verwaltung via `.env`
- optional später: Refresh Token Rotation

---

## 10.3 Teststrategie mit Vitest

Ja, **Vitest passt sehr gut** zu React (Vite-nativ) und ist auch für Node/Nest-Unit-Tests nutzbar.

Empfehlung:

- Frontend: `Vitest + Testing Library`
- Backend:
  - Option A: Nest Standard mit Jest (konservativ)
  - Option B: Vitest auch im Backend (konsistent, schneller)

Für diese Demo empfehle ich:

- Vitest im Frontend sicher
- Backend zunächst bei Jest lassen oder früh auf Vitest festlegen (wir können beides sauber aufsetzen)

Minimale Testabdeckung + Edge-Cases:

- Task Date Rules (`dueDate >= startDate`)
- Subtask-Validierung (leerer Titel, inkonsistente Daten)
- Auth Fehlerfälle (invalid credentials, fehlender Token)
- Task-Filter nach `employeeId`

---

## 11. Arbeitsmodus für den KI-Agenten (Folgeschritte)

Bei jeder Iteration:

1. Kleine Teilaufgabe auswählen.
2. Implementieren + lokal prüfen.
3. Kurz dokumentieren (README/`docs/progress.md`).
4. Nächsten Schritt starten.

Definition “senior-mäßig” für dieses Projekt:

- saubere Struktur, klare Namen, stabile Defaults
- sinnvolle Validierung und Fehlermeldungen
- nachvollziehbare Commit-Schritte
- dokumentierte Architekturentscheidungen
- keine unnötige Komplexität

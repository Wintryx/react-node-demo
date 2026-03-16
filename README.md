# React + NestJS Task Management Demo

Full-Stack Demoprojekt auf Basis der bereitgestellten Anforderungen.

## Projektziel

Eine moderne Task-Management-App mit:

- React + TypeScript Frontend
- NestJS + TypeScript Backend
- Employee- und Task-Management inkl. Subtasks
- Timeline/Gantt-Ansicht
- Bonus-Features: JWT Auth, Docker Compose, Tests

## Aktueller Stand

- Nx Monorepo aufgesetzt (`packages/apps/web`, `packages/apps/api`, `packages/apps/api-e2e`)
- API-Basis mit:
  - Swagger unter `/api`
  - Health-Endpoint unter `/health`
  - `TypeORM + SQLite`
  - globale DTO-Validierung
  - Security-Basics (`helmet`, CORS, Throttling-Basis)
  - Employees CRUD (`GET/POST/PATCH/DELETE /employees`)
  - Employee `role` und `department` als Enums
  - Delete-Policy fuer Employees: blockiert (`409`), wenn Tasks zugeordnet sind
- Lint/Test/Build laufen erfolgreich

## Wichtige Entscheidungen (mit Begründung)

1. Monorepo mit Nx
Warum: Klare Struktur für Frontend/Backend, gute Skalierung, Caching, konsistente Tooling-Pipeline.

2. TypeORM + SQLite
Warum: Schnell für Demo-Setup, einfache lokale Ausführung, trotzdem saubere relationale Modellierung.

3. Strikte Typisierung
Warum: Clean-Code-Anspruch und langfristige Wartbarkeit.
Regeln: `strict: true`, `noImplicitAny: true`, ESLint `no-explicit-any: error`.

4. React-Test mit Vitest, Backend-Test mit Jest
Warum: Vitest ist ideal für Vite/React, Jest ist stabiler Standard im Nest-Ökosystem.

5. DDD-light + SOLID ohne Over-Engineering
Warum: Fachliche Trennung und Testbarkeit, aber keine unnötige Komplexität.

## Lokales Setup

## Voraussetzungen

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Environment

```bash
cp .env.example .env
```

Unter Windows PowerShell alternativ:

```powershell
Copy-Item .env.example .env
```

## Starten (2 Terminals)

Terminal 1 (Backend):

```bash
npm run dev:api
```

Terminal 2 (Frontend):

```bash
npm run dev:web
```

Standard-URLs:

- Frontend: `http://localhost:4200` oder die von Vite ausgegebene URL
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`

## Nützliche Skripte

```bash
npm run lint
npm run test
npm run build
npm run graph
npm run format
npm run format:write
```

## Projektstruktur (aktuell)

```txt
packages/
  apps/
    api/      # NestJS API
    web/      # React App
    api-e2e/  # API E2E Tests
docs/
  requirements.md
  implementation-guide.md
  progress.md
```

## App-spezifische Dokumentation

- Backend API: [`packages/apps/api/README.md`](packages/apps/api/README.md)
- Backend API E2E Tests: [`packages/apps/api-e2e/README.md`](packages/apps/api-e2e/README.md)

## Security-Baseline

- `helmet` aktiv
- DTO-Validierung global (`whitelist`, `forbidNonWhitelisted`)
- CORS eingeschränkt konfigurierbar
- Basis-Throttling aktiv
- JWT ist als nächster Schritt eingeplant

## Roadmap (nächste Häppchen)

1. Tasks/Subtasks CRUD + Filter
2. Auth (`register` + `login`, JWT Guards)
3. Frontend Task Board + Employee Switcher
4. Timeline/Gantt
5. Docker Compose + finale Doku

## Dokumentationsmodus (fortlaufend)

Diese README ist ein lebendes Dokument.

- Bei jedem Umsetzungsschritt werden Entscheidungen und Änderungen hier ergänzt.
- Technischer Zwischenstand wird zusätzlich in `docs/progress.md` gepflegt.
- Architektur- und Umsetzungsdetails stehen in `docs/implementation-guide.md`.

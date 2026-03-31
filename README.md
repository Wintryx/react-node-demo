# React + NestJS Task Management Demo

Full-stack demoproject based on the provided assessment requirements.

## Project Goal

Build a modern task management app with:

- React + TypeScript frontend
- NestJS + TypeScript backend
- Employee and task management including subtasks
- Timeline/Gantt view
- Bonus features: JWT auth, Docker Compose, tests

## Current Status

- Nx monorepo initialized (`packages/apps/web`, `packages/apps/api`, `packages/apps/api-e2e`)
- API foundation implemented:
  - Swagger at `/api`
  - Health endpoint at `/health`
  - `TypeORM + SQLite`
  - migration-based schema management (no long-term `synchronize`)
  - global DTO validation
  - security baseline (`helmet`, CORS, throttling module)
- Employees module:
  - CRUD (`GET/POST/PATCH/DELETE /employees`)
  - enum-based `role` and `department`
  - delete policy blocks removal if tasks are assigned (`409`)
- Tasks module:
  - CRUD (`GET/POST/PATCH/DELETE /tasks`)
  - optional filter via `employeeId`
  - subtasks as relational data
  - validation rules:
    - `startDate` required
    - `dueDate` optional
    - date consistency checks
  - delete policy cascades to subtasks
- Auth module:
  - public `POST /auth/register`
  - public `POST /auth/login`
  - public `POST /auth/refresh` (refresh token cookie)
  - public `POST /auth/logout` (refresh token invalidation)
  - JWT access token flow
  - HttpOnly refresh token cookie flow
  - global JWT guard with `@Public()` exceptions
  - stricter rate limits on auth endpoints
- Frontend foundation:
  - Tailwind CSS + Shadcn-style component base
  - login + register pages
  - protected route with session-based auth (`sessionStorage`)
  - authenticated employee switcher
  - task list and kanban board views
  - timeline/gantt-style view (due-date sorted, status-colored, overdue highlight)
  - timeline UX controls (zoom presets, status grouping, tick markers, today marker)
  - task CRUD modal (with date picker and subtask handling)
  - inline subtask toggle/add/remove
  - toast notifications for task create/update/delete success actions
  - responsive dashboard shell
- Docker:
  - `docker-compose.yml` for one-command startup
  - dedicated API and web Dockerfiles
  - SQLite persistence via Docker volume (`api_data`)
- Verification status:
  - lint/test/build successful
  - API e2e covers health + auth + employees + tasks
  - web tests include mapper/helper units + dashboard CRUD integration tests with mocked API
  - Nx boundary rules hardened (scope tags + dependency constraints)
  - shared contract types moved to `packages/libs/shared-contracts`
  - OpenAPI-based contract type generation available via script

## Key Decisions

1. Nx monorepo
   Reason: clear separation of frontend/backend, consistent tooling, scalability.

2. TypeORM + SQLite
   Reason: fast local setup with proper relational modeling.

3. Strict typing
   Reason: maintainability and clean code baseline.
   Rules: `strict: true`, `noImplicitAny: true`, ESLint `no-explicit-any: error`.

4. Vitest for React, Jest for Nest
   Reason: Vite-native frontend test runner and stable Nest ecosystem defaults.

5. DDD-light + SOLID without over-engineering
   Reason: clear domain boundaries and testability with pragmatic scope.

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+

Workspace root note:

- Open the repository root folder that contains `nx.json` (for example in IntelliJ or VS Code).
- Run all root scripts (`npm run ...`) from that same folder.

### Install

```bash
npm install
```

Contract type generation note:

- No extra step is required to run the app locally; generated contract types are committed.
- Run `npm run contracts:generate` only when backend Swagger contracts changed and you want to refresh frontend/shared typings.

### Environment

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Note on committed env files:

- This repository intentionally commits non-sensitive demo env templates/defaults (for example `.env.example`) to keep setup friction low.
- In real production projects, secrets and real environment values must never be committed to git.

Optional migration toggle:

- `TYPEORM_MIGRATIONS_RUN=true` (default behavior if not set)
- Set `TYPEORM_MIGRATIONS_RUN=false` only if you explicitly want to skip migration execution on app startup.

JWT configuration:

- `JWT_ACCESS_TOKEN_SECRET` is mandatory and must be at least 32 characters.
- `JWT_REFRESH_TOKEN_SECRET` is mandatory and must be at least 32 characters.
- `JWT_REFRESH_TOKEN_EXPIRES_IN` controls refresh token lifetime (default `7d`).
- `AUTH_COOKIE_SAME_SITE` (`lax|strict|none`) and `AUTH_COOKIE_SECURE` (`true|false`) control refresh cookie behavior.
- API startup fails fast if the secret is missing or too short.

### Run (2 terminals)

Terminal 1 (backend):

```bash
npm run dev:api
```

Terminal 2 (frontend):

```bash
npm run dev:web
```

Default URLs:

- Frontend: `http://localhost:4200` (or Vite output URL)
- API: `http://localhost:3000`
- Swagger (non-production only): `http://localhost:3000/api`
- Health: `http://localhost:3000/health`

### Seed Demo Data (optional)

Run this from workspace root to create a reusable demo user plus sample employees/tasks/subtasks:

```bash
npm run db:seed
```

Seed behavior:

- idempotent (no duplicate records on repeated runs)
- runs migrations automatically before inserting seed records
- blocked in production unless `ALLOW_PRODUCTION_DB_SEED=true` is set explicitly

Demo login after seeding:

- Email: `demo.user@example.com`
- Password: `DemoPass!123`

### Run with Docker Compose

```bash
docker compose up --build
```

Compose URLs:

- Web: `http://localhost:8080`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## Demo Script (Quick Walkthrough)

Use these 3 short flows for a live demo (5-10 minutes total):

1. Authentication + App Access
   - Open `/register`, create a new user, and show successful redirect/login capability.
   - Login via `/login` and confirm protected route `/app` is accessible only after auth.

2. Employee + Task Lifecycle
   - Create an employee in the dashboard.
   - Create a task for that employee with:
     - title/description
     - status/priority
     - `startDate` and optional `dueDate`
     - at least one subtask with assignee
   - Edit the task (for example change status to `in-progress`) and show toast feedback.
   - Delete the task and show confirmation dialog behavior.

3. Board and Timeline Behavior
   - Switch employee filter and verify list/kanban content updates.
   - Open timeline view and show:
     - due-date ordering
     - status color coding
     - overdue highlighting
   - Click a timeline task bar and demonstrate edit modal opening directly from timeline.

## Useful Scripts

```bash
npm run lint
npm run test
npm run build
npm run graph
npm run format
npm run format:write
npm run contracts:generate
npm run db:migration:run
npm run db:migration:revert
npm run db:migration:show
npm run db:migration:create
npm run db:migration:generate
npm run db:seed
```

`npm run test` includes API E2E and starts the API on a dedicated dynamic test port.

## Test Strategy & Coverage

Test execution (where and with what):

- Frontend tests (`packages/apps/web`): `Vitest` + `Testing Library` in `jsdom`.
- Backend unit tests (`packages/apps/api`): `Jest` for NestJS modules/use cases/helpers.
- Backend functional E2E tests (`packages/apps/api-e2e`): `Jest` against a real API process on a dynamic test port and temporary SQLite DB.

Test types in this project:

- Unit tests:
  - Backend use cases and helper logic.
  - Frontend helper/mapper/date/auth-storage utilities.
- Integration tests:
  - Frontend dashboard integration tests with mocked API module (`tasksApi` etc.).
- Functional tests:
  - API E2E flows (`auth`, `employees`, `tasks`, `health`) in `api-e2e`.
- Non-functional tests:
  - Static quality gates via `eslint` and strict TypeScript typing.
  - No dedicated performance/load/stress tests yet (out of demo scope).

Coverage commands:

```bash
# API (Jest, text summary)
npx nx test api --coverage --coverageReporters=text-summary

# Web (Vitest, text summary)
cd packages/apps/web
npx vitest run --coverage --coverage.reporter=text-summary
```

Coverage snapshot (local run on 2026-03-17):

- API (`packages/apps/api`)
  - Statements: `86.17%`
  - Branches: `65.59%`
  - Functions: `85.33%`
  - Lines: `85.75%`
- Web (`packages/apps/web`)
  - Statements: `67.87%`
  - Branches: `58.03%`
  - Functions: `58.21%`
  - Lines: `69.41%`
- API E2E (`packages/apps/api-e2e`)
  - Functional black-box tests; no separate code-coverage percentage is tracked for this suite.

## Structure

```txt
packages/
  apps/
    api/      # NestJS API
    web/      # React app
    api-e2e/  # API end-to-end tests
  libs/
    shared-contracts/  # shared API contract types (OpenAPI-based generation)
docs/
  requirements.md
  implementation-guide.md
  progress.md
```

## App-specific Docs

- Backend API: [`packages/apps/api/README.md`](packages/apps/api/README.md)
- Frontend Web App: [`packages/apps/web/README.md`](packages/apps/web/README.md)
- Backend API E2E: [`packages/apps/api-e2e/README.md`](packages/apps/api-e2e/README.md)

## Security Baseline

- `helmet` enabled
- global DTO validation (`whitelist`, `forbidNonWhitelisted`)
- restricted CORS configuration
- CORS credentials enabled for cookie-based auth flows
- auth endpoint throttling
- JWT access tokens for protected routes
- HttpOnly refresh token cookie flow (`/auth/refresh`, `/auth/logout`)
- password policy on register (minimum length + complexity)
- fail-fast JWT secret validation (no insecure fallback secret)
- Swagger disabled in production mode

## Demo Authorization Scope

- Authenticated users share one global workspace.
- There is intentionally no per-user ownership isolation for employees/tasks in demo scope.
- This is an accepted demo tradeoff and must be tightened in production (role/scope/ownership-based authorization).

## API Error Contract

The backend returns structured error payloads with stable codes:

```json
{
  "statusCode": 409,
  "code": "EMPLOYEE_EMAIL_ALREADY_EXISTS",
  "message": "Employee with email \"jane.doe@example.com\" already exists.",
  "params": {
    "email": "jane.doe@example.com"
  },
  "path": "/employees",
  "timestamp": "2026-03-16T15:30:00.000Z"
}
```

Frontend error handling maps primarily by `code` and uses `message` only as fallback.

## Roadmap (Next Chunks)

1. Optional UI smoke E2E tests
2. Optional auth hardening (refresh-token rotation/revocation)
3. Optional i18n layer (currently English default copy)

## Documentation Mode

This README is a living document.

- It is updated after each implementation chunk.
- Technical progress is tracked in `docs/progress.md`.
- Architecture and implementation details live in `docs/implementation-guide.md`.

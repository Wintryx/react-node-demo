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
  - JWT access token flow
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

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

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
- Swagger: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`

### Run with Docker Compose

```bash
docker compose up --build
```

Compose URLs:

- Web: `http://localhost:8080`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## Useful Scripts

```bash
npm run lint
npm run test
npm run build
npm run graph
npm run format
npm run format:write
```

## Structure

```txt
packages/
  apps/
    api/      # NestJS API
    web/      # React app
    api-e2e/  # API end-to-end tests
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
- auth endpoint throttling
- JWT access tokens for protected routes
- password policy on register (minimum length + complexity)

## Roadmap (Next Chunks)

1. Optional UI smoke E2E tests
2. TypeORM migration strategy (replace long-term `synchronize` usage)
3. Optional auth hardening (refresh-token rotation/revocation)

## Documentation Mode

This README is a living document.

- It is updated after each implementation chunk.
- Technical progress is tracked in `docs/progress.md`.
- Architecture and implementation details live in `docs/implementation-guide.md`.

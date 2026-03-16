# Web App (`packages/apps/web`)

## Purpose

This app is the React frontend for the task management demo.
It consumes the NestJS backend and provides:

- login + register flow
- JWT-protected app area
- employee switcher
- task list and kanban board filtered by selected employee
- task CRUD with subtask management
- responsive dashboard layout

## Stack

- React + TypeScript + Vite
- React Router
- TanStack Query (server state)
- Tailwind CSS + Shadcn-style UI primitives
- `react-day-picker` for date inputs

## Current Scope

- Public routes:
  - `/login`
  - `/register`
- Protected route:
  - `/app`
- Session handling:
  - access token stored in `sessionStorage`
  - token attached as `Authorization: Bearer ...` via Axios interceptor
- Task management UI:
  - list, kanban, and timeline views
  - create/edit task modal with date picker
  - delete confirmation
  - toast notifications for create/update/delete success actions
  - inline subtask toggle/add/remove in list and kanban
  - timeline ordered by due date, status color coding, overdue highlighting
  - timeline zoom presets (`compact`, `balanced`, `expanded`)
  - optional timeline grouping by status
  - timeline tick markers and today marker line
  - timeline task click opens edit modal

## Security Notes (Demo Scope)

- `sessionStorage` was chosen for pragmatic demo delivery.
- This remains vulnerable to XSS token theft in general SPA scenarios.
- Production-hardening recommendation:
  - move to HttpOnly Secure SameSite cookies
  - add CSRF protection strategy
  - keep strict input/output handling and CSP policy

## Environment

Use root `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Default fallback in frontend code is `http://localhost:3000`.

## Run

From workspace root:

```bash
npm run dev:web
```

Frontend default URL:

- `http://localhost:4200`

## Quality Checks

From workspace root:

```bash
npx nx lint web
npx nx test web
npx nx build web
```

## Test Coverage Highlights

- Unit tests:
  - date helpers
  - task mappers/helpers
  - timeline helpers
- Integration tests (mocked `tasksApi` / `employeesApi`):
  - create task
  - modal validation (required title, invalid subtask)
  - update task
  - delete task with confirmation
  - delete cancel flow
  - create error feedback
  - update/delete error feedback
  - inline subtask toggle/add/remove update
  - timeline task click opens edit modal

## Next Frontend Steps

1. Optional UX polish (drag/drop board interactions, richer validation hints)
2. End-to-end UI smoke test strategy (optional future hardening)
3. Optional state persistence for active view/filter preferences

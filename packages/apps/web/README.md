# Web App (`packages/apps/web`)

## Purpose

This app is the React frontend for the task management demo.
It consumes the NestJS backend and provides:

- login + register flow
- JWT-protected app area
- employee switcher
- task list filtered by selected employee
- responsive UI foundation for upcoming CRUD and timeline work

## Stack

- React + TypeScript + Vite
- React Router
- TanStack Query (server state)
- Tailwind CSS + Shadcn-style UI primitives

## Current Scope

- Public routes:
  - `/login`
  - `/register`
- Protected route:
  - `/app`
- Session handling:
  - access token stored in `sessionStorage`
  - token attached as `Authorization: Bearer ...` via Axios interceptor

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

## Next Frontend Steps

1. Task create/edit/delete modals with inline subtask editing
2. Timeline/Gantt view with overdue highlighting
3. Additional frontend tests for data mutations and error flows

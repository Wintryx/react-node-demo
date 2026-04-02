# API E2E App (`packages/apps/api-e2e`)

## Purpose

This app contains end-to-end tests for the backend API.
It validates runtime behavior through real HTTP calls.

In short:

- `api`: implements backend behavior
- `api-e2e`: verifies backend behavior from outside

## Run

From workspace root:

```bash
npx nx run api-e2e:e2e
```

The suite starts its own API process on a dedicated dynamic local port
(or `API_E2E_PORT` when explicitly set) and configures Axios automatically.

## Current Coverage

- Health endpoint
- Auth:
  - register success
  - duplicate email conflict (`409`)
  - login success
  - refresh rotation behavior
  - logout-all session revocation
  - invalid credentials (`401`)
  - protected route access without token (`401`)
  - protected route access with token (`200`)
- Employees:
  - create + list
  - duplicate email conflict
  - enum validation
  - update
  - delete + not-found case
  - delete conflict when tasks are assigned (`409`)
- Tasks:
  - create + list with `employeeId` filter
  - date range validation
  - update including subtasks
  - delete + not-found case
  - smoke flow for authenticated core CRUD path

## Next

- Optional UI-driven E2E flow (browser-level) if end-to-end frontend automation is prioritized.

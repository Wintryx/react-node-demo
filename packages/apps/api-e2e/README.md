# API E2E App (`packages/apps/api-e2e`)

## Purpose

This app contains **end-to-end tests** for the backend API.
It verifies runtime behavior through HTTP calls (black-box), not just unit-level classes.

In short:

- `api`: implements the backend
- `api-e2e`: tests the backend against real endpoints

## Run

From workspace root:

```bash
npx nx run api-e2e:e2e
```

By default, tests expect the API on port `3000`.
Test setup configures the axios base URL to `http://localhost:3000`.

## Current Coverage

- Health endpoint smoke test
- Employees endpoints:
  - create + list
  - duplicate email conflict
  - enum validation
  - update
  - delete + not-found case

## Next

- Add E2E coverage for `tasks` and `auth` once those modules are implemented.

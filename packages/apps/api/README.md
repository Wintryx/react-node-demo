# API App (`packages/apps/api`)

## Purpose

This app is the NestJS backend of the demo.
It provides the REST API and contains:

- business logic (DDD-light use cases)
- persistence (`TypeORM + SQLite`)
- request validation (`class-validator`)
- Swagger docs at `/api`
- JWT authentication and route protection

## Endpoints (current)

- Public:
  - `GET /health`
  - `POST /auth/register`
  - `POST /auth/login`
- Protected (JWT):
  - `GET /employees`
  - `POST /employees`
  - `PATCH /employees/:id`
  - `DELETE /employees/:id`
  - `GET /tasks?employeeId=`
  - `POST /tasks`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`

## Rules (current)

- Task:
  - `startDate` required
  - `dueDate` optional
  - `dueDate >= startDate`
  - `subtask.endDate >= subtask.startDate`
  - deleting a task cascades to subtasks
- Employee:
  - deleting employee with assigned tasks returns `409`
- Auth:
  - register is public
  - password is hashed with bcrypt
  - register/login return JWT access token

## Demo Authorization Scope

- Authenticated users share one global workspace.
- There is intentionally no per-user ownership isolation for employees/tasks in demo scope.
- This is an accepted demo tradeoff for assessment delivery and should be replaced by role/scope/ownership authorization in production.

## Error Contract

API errors use a structured payload with stable `code` values:

```json
{
  "statusCode": 404,
  "code": "TASK_NOT_FOUND",
  "message": "Task with id \"123\" was not found.",
  "params": {
    "taskId": 123
  },
  "path": "/tasks/123",
  "timestamp": "2026-03-16T15:30:00.000Z"
}
```

Notes:

- `code` is the stable contract for frontend/client behavior.
- `message` is human-readable fallback.
- `params` contains interpolation values for localized client messages.

## Run Locally

From workspace root:

```bash
npx nx serve api
```

Or via root script:

```bash
npm run dev:api
```

Default URL:

- API: `http://localhost:3000`
- Swagger (non-production only): `http://localhost:3000/api`

## Database

- SQLite file: `packages/apps/api/data/app.db`
- Schema management is migration-based (TypeORM migrations), `synchronize` is disabled.
- Migrations run automatically on API startup by default.

Migration commands (from workspace root):

```bash
npm run db:migration:run
npm run db:migration:revert
npm run db:migration:show
npm run db:migration:create
npm run db:migration:generate
```

Optional env toggle:

- `TYPEORM_MIGRATIONS_RUN=false` skips migration execution on app bootstrap.
- `DATABASE_PATH=...` controls which SQLite file is used by migration commands.
- `JWT_ACCESS_TOKEN_SECRET` is required and must be at least 32 characters (API fails fast otherwise).

## Tests

```bash
npx nx test api
```

## Docker Compose

From workspace root:

```bash
docker compose up --build
```

Default URLs in compose mode:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- Web app: `http://localhost:8080`

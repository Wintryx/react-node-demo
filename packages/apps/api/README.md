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
- Swagger: `http://localhost:3000/api`

## Database

- SQLite file: `packages/apps/api/data/app.db`
- The file is created automatically on first startup.

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

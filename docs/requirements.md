# Full-Stack Assessment Task

Build a simple task management app using NestJS (backend) and React (frontend).

## Entities

### Employee

- `id`, `firstName`, `lastName`, `email`, `role`, `department`, `createdAt`

### Task

- `id`, `title`, `description`, `status` (`todo | in-progress | done`), `priority` (`low | medium | high`), `startDate`, `dueDate`, `createdAt`
- belongs to an Employee
- has a list of subtasks:

```txt
{ id, title, completed, start_date, end_date,
  assignee: {
    id:123, name: ABC
  }
}
```

You can add more fields to it, or use different structure.

## Backend - NestJS + TypeScript

Implement a REST CRUD API for both entities:

```txt
None
GET    /employees
POST   /employees
PATCH  /employees/:id
DELETE /employees/:id

GET    /tasks?employeeId=
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```

- Use TypeORM or Prisma with SQLite or PostgreSQL
- Validate request bodies with class-validator
- Expose Swagger docs at `/api`

## Frontend - React + TypeScript

- List all tasks for a selected employee
- Add a task (with subtasks)
- Edit a task (title, description, status, priority, due date, subtasks)
- Delete a task (with confirmation)
- Toggle subtask completion, add/remove subtasks inline
- **Timeline view / Gantt chart** - tasks ordered by due date, color-coded by status; overdue tasks highlighted; click a task to open the edit modal
- Employee switcher to filter the board
- UI requirements at least to be modern.
- Regarding UI libraries is up to you. (Preferably ShadcnUI)

## Delivery

Push to a public GitHub/GitLab repository with a `README.md` that includes setup instructions and any notes on your decisions.

## Bonus

`docker-compose.yml` for one-command setup, unit tests, JWT auth.

# API App (`packages/apps/api`)

## Zweck

Diese App ist das **NestJS Backend** der Demo.
Sie stellt die REST-API bereit (z. B. `/employees`) und kapselt:

- Business-Logik (DDD-light Use Cases)
- Persistenz mit `TypeORM + SQLite`
- Request-Validierung (`class-validator`)
- Swagger-Dokumentation unter `/api`

## Wichtige Endpunkte (aktueller Stand)

- `GET /health`
- `GET /employees`
- `POST /employees`
- `PATCH /employees/:id`
- `DELETE /employees/:id`
- `GET /tasks?employeeId=`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

## Task-Regeln (aktuell)

- `startDate` ist Pflicht
- `dueDate` ist optional
- Datumsvalidierung:
  - `dueDate >= startDate`
  - `subtask.endDate >= subtask.startDate`
- Beim Loeschen einer Task werden Subtasks per Cascade entfernt

## Lokales Starten

Aus dem Workspace-Root:

```bash
npx nx serve api
```

Oder über das Root-Script:

```bash
npm run dev:api
```

Standard-URL:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## Datenbank

- SQLite-Datei: `packages/apps/api/data/app.db`
- Die Datei wird beim ersten Start automatisch erzeugt.

## Tests

```bash
npx nx test api
```

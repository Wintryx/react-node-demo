# Frontend Click Flow Guide (Presentation Notes)

Date: 2026-03-24

## 1. One-sentence architecture summary

A user click in the web app flows through **UI components -> feature/page state -> React Query hooks -> API layer (Axios) -> NestJS controller -> use case -> repository/database**, then returns through React Query cache updates back to the UI.

## 2. Layer map and responsibilities

- `packages/apps/web/src/components/ui/*`
  - Reusable visual UI primitives (`Button`, `Card`, `Alert`, etc.).
- `packages/apps/web/src/features/dashboard/*`
  - Feature logic and composition (page state, handlers, dialogs, task views).
- `packages/apps/web/src/features/dashboard/hooks/*`
  - Data orchestration via React Query (`useQuery`, `useMutation`).
- `packages/apps/web/src/shared/api/*`
  - Typed HTTP API calls (`tasksApi`, `employeesApi`) and Axios client setup.
- `packages/apps/api/src/modules/tasks/presentation/tasks.controller.ts`
  - HTTP endpoint entry point (`GET /tasks`, `PATCH /tasks/:id`, etc.).
- `packages/apps/api/src/modules/tasks/application/*.use-case.ts`
  - Business rules, validations, and orchestration.
- `packages/apps/api/src/modules/tasks/infrastructure/persistence/typeorm-task.repository.ts`
  - TypeORM persistence, loading relations, save/update/delete in DB.

## 3. Example flow A: "Refresh data" button

### Click source

- File: `packages/apps/web/src/features/dashboard/components/dashboard-controls-panel.tsx`
- Button: `onClick={onRefresh}`

### Frontend chain

1. `DashboardControlsPanel` triggers `onRefresh`.
2. `DashboardPage` passes `refreshData` from `useDashboardData` as `onRefresh`.
3. `useDashboardData.refreshData()` calls:
   - `employeesQuery.refetch()`
   - `tasksQuery.refetch()`
4. Query functions call:
   - `employeesApi.list()` -> `GET /employees`
   - `tasksApi.list(employeeId?)` -> `GET /tasks`
5. Requests go through `apiClient` in `shared/api/client.ts`:
   - sets `Authorization: Bearer <token>` in request interceptor
   - handles `401` in response interceptor

### Backend chain

1. `GET /tasks` enters `TasksController.listTasks()`.
2. Controller calls `ListTasksUseCase.execute(employeeId?)`.
3. Use case calls `taskRepository.findAll(employeeId)`.
4. `TypeOrmTaskRepository.findAll()` loads data from DB with relations.
5. Response returns to frontend and React Query updates cached task/employee data.

## 4. Example flow B: "Edit task" and save

### Open edit dialog

1. User clicks **Edit** on task card:
   - File: `packages/apps/web/src/features/dashboard/components/task-card.tsx`
   - Action: `onClick={() => onEdit(task)}`
2. Handler is passed through task section/list/board to `DashboardPage.handleEditTask`.
3. `handleEditTask` sets `editingTask` state.
4. `TaskFormDialog` opens because `open={editingTask !== null}`.

### Save edit (submit)

1. In `TaskFormDialog`, form submit runs `handleSubmit`.
2. Dialog validates form and builds payload (`toUpdateTaskPayload`).
3. Calls `onUpdate(task.id, payload)`.
4. `onUpdate` is `taskMutations.updateTask` from `useTaskMutations`.
5. `useTaskMutations` executes `tasksApi.update(taskId, payload)` -> `PATCH /tasks/:id`.

### Backend update path

1. `PATCH /tasks/:id` enters `TasksController.updateTask()`.
2. Controller maps DTO and calls `UpdateTaskUseCase.execute(id, patch)`.
3. Use case performs validations:
   - task exists
   - employee/subtask assignee validity
   - date and subtask constraints
4. Use case calls repository `update(id, normalizedPatch)`.
5. `TypeOrmTaskRepository.update()` persists and reloads full task relations.

### UI refresh after successful mutation

1. `useTaskMutations` runs `queryClient.invalidateQueries({ queryKey: ['tasks'] })`.
2. Tasks query refetches automatically.
3. UI re-renders with updated data and dialog closes.
4. Success toast is shown.

## 5. React Query role (important interview point)

- Reads are done with `useQuery` in `useDashboardData`.
- Writes are done with `useMutation` in `useTaskMutations`.
- Cache invalidation (`invalidateQueries`) keeps UI consistent after create/update/delete.
- This separates UI event handlers from networking details and cache logic.

## 6. Quick interview answer template

If asked "What happens when I click a button?", answer:

1. "The UI component fires a typed callback."
2. "The page/feature layer maps that callback to a hook action."
3. "React Query hook performs fetch or mutation via our API layer."
4. "Axios client adds auth header and handles auth failures."
5. "NestJS controller receives the request and forwards to a use case."
6. "Use case validates business rules and calls repository persistence."
7. "Result comes back, React Query updates/invalidate cache, UI re-renders."

## 7. Key files to mention live

- Frontend entry/composition: `packages/apps/web/src/features/dashboard/dashboard-page.tsx`
- Data fetching hook: `packages/apps/web/src/features/dashboard/hooks/use-dashboard-data.ts`
- Mutation hook: `packages/apps/web/src/features/dashboard/hooks/use-task-mutations.ts`
- API wrapper: `packages/apps/web/src/shared/api/tasks-api.ts`
- Axios client: `packages/apps/web/src/shared/api/client.ts`
- Backend endpoint: `packages/apps/api/src/modules/tasks/presentation/tasks.controller.ts`
- Backend business logic: `packages/apps/api/src/modules/tasks/application/update-task.use-case.ts`
- Backend persistence: `packages/apps/api/src/modules/tasks/infrastructure/persistence/typeorm-task.repository.ts`


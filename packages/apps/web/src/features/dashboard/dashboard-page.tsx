import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, LogOut, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import { EmployeeSwitcher } from './employee-switcher';
import { TaskBoard } from './task-board';
import { TaskFormDialog } from './task-form-dialog';
import { TaskList } from './task-list';
import { toUpsertSubtaskRequests } from './task-request-mapper';
import { useDashboardData } from './use-dashboard-data';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { tasksApi } from '../../shared/api';
import { CreateTaskRequest, Task, UpdateTaskRequest, UpsertSubtaskRequest } from '../../shared/api/types';
import { useAuth } from '../auth/auth-context';

type DashboardViewMode = 'list' | 'kanban';

const mapError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed. Please try again.';
};

export function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<DashboardViewMode>('list');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    employees,
    tasks,
    effectiveSelectedEmployeeId,
    isEmployeesError,
    isEmployeesLoading,
    isTasksError,
    isTasksFetching,
    isTasksLoading,
    employeesError,
    tasksError,
    refreshData,
    setSelectedEmployeeId,
  } = useDashboardData();

  const invalidateTasks = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ['tasks'],
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskRequest) => tasksApi.create(payload),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskRequest }) =>
      tasksApi.update(taskId, payload),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: async () => {
      await invalidateTasks();
    },
  });

  const isMutating =
    createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending;

  const handleCreateTask = async (payload: CreateTaskRequest): Promise<void> => {
    setActionError(null);
    await createTaskMutation.mutateAsync(payload);
  };

  const handleUpdateTask = async (taskId: number, payload: UpdateTaskRequest): Promise<void> => {
    setActionError(null);
    await updateTaskMutation.mutateAsync({ taskId, payload });
  };

  const handleDeleteTask = async (task: Task): Promise<void> => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    setActionError(null);
    await deleteTaskMutation.mutateAsync(task.id);
  };

  const updateTaskSubtasksInline = async (task: Task, subtasks: UpsertSubtaskRequest[]): Promise<void> => {
    try {
      await handleUpdateTask(task.id, { subtasks });
    } catch (error: unknown) {
      setActionError(mapError(error));
    }
  };

  const handleToggleSubtask = (task: Task, subtaskId: number, completed: boolean): void => {
    const subtasks = toUpsertSubtaskRequests(task).map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed } : subtask,
    );
    void updateTaskSubtasksInline(task, subtasks);
  };

  const handleAddSubtask = (task: Task, title: string): void => {
    const subtasks = [
      ...toUpsertSubtaskRequests(task),
      {
        title,
        completed: false,
        startDate: task.startDate,
      },
    ];
    void updateTaskSubtasksInline(task, subtasks);
  };

  const handleRemoveSubtask = (task: Task, subtaskId: number): void => {
    const subtasks = toUpsertSubtaskRequests(task).filter((subtask) => subtask.id !== subtaskId);
    void updateTaskSubtasksInline(task, subtasks);
  };

  const handleEditTask = (task: Task): void => {
    setActionError(null);
    setEditingTask(task);
  };

  const onCreateTaskSubmit = async (payload: CreateTaskRequest): Promise<void> => {
    try {
      await handleCreateTask(payload);
    } catch (error: unknown) {
      setActionError(mapError(error));
      throw error;
    }
  };

  const onUpdateTaskSubmit = async (taskId: number, payload: UpdateTaskRequest): Promise<void> => {
    try {
      await handleUpdateTask(taskId, payload);
      setEditingTask(null);
    } catch (error: unknown) {
      setActionError(mapError(error));
      throw error;
    }
  };

  const onDeleteTask = (task: Task): void => {
    void handleDeleteTask(task).catch((error: unknown) => {
      setActionError(mapError(error));
    });
  };

  if (isEmployeesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isEmployeesError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert variant="danger">Failed to load employees. {employeesError?.message}</Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
        <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-bold">Task Console</p>
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{currentUser?.email}</span>
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workspace Controls</CardTitle>
                <CardDescription>Filter the board by employee assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.length > 0 ? (
                  <EmployeeSwitcher
                    employees={employees}
                    selectedEmployeeId={effectiveSelectedEmployeeId}
                    onChange={setSelectedEmployeeId}
                  />
                ) : (
                  <Alert>No employees available. Please create one via API/Swagger.</Alert>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={refreshData}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh data
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Tasks</h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  Kanban
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={employees.length === 0}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  New Task
                </Button>
                {isTasksFetching ? (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    Updating...
                  </span>
                ) : null}
              </div>
            </div>
            {actionError ? <Alert variant="danger">{actionError}</Alert> : null}

            {effectiveSelectedEmployeeId === null ? (
              <Card>
                <CardContent className="flex min-h-40 items-center justify-center text-muted-foreground">
                  Select an employee to load tasks.
                </CardContent>
              </Card>
            ) : isTasksLoading ? (
              <Card>
                <CardContent className="flex min-h-40 items-center justify-center">
                  <Spinner className="h-6 w-6 text-primary" />
                </CardContent>
              </Card>
            ) : isTasksError ? (
              <Alert variant="danger">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {tasksError?.message}
                </span>
              </Alert>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <TaskList
                    tasks={tasks}
                    isPending={isMutating}
                    onEdit={handleEditTask}
                    onDelete={onDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onRemoveSubtask={handleRemoveSubtask}
                  />
                ) : (
                  <TaskBoard
                    tasks={tasks}
                    isPending={isMutating}
                    onEdit={handleEditTask}
                    onDelete={onDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onRemoveSubtask={handleRemoveSubtask}
                  />
                )}
              </>
            )}
          </section>
        </main>
      </div>

      <TaskFormDialog
        key={`create-${isCreateDialogOpen ? 'open' : 'closed'}-${effectiveSelectedEmployeeId ?? 'none'}`}
        open={isCreateDialogOpen}
        mode="create"
        employees={employees}
        selectedEmployeeId={effectiveSelectedEmployeeId}
        task={null}
        isSubmitting={isMutating}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={onCreateTaskSubmit}
        onUpdate={onUpdateTaskSubmit}
      />

      <TaskFormDialog
        key={editingTask ? `edit-${editingTask.id}` : 'edit-empty'}
        open={editingTask !== null}
        mode="edit"
        employees={employees}
        selectedEmployeeId={effectiveSelectedEmployeeId}
        task={editingTask}
        isSubmitting={isMutating}
        onClose={() => setEditingTask(null)}
        onCreate={onCreateTaskSubmit}
        onUpdate={onUpdateTaskSubmit}
      />
    </div>
  );
}

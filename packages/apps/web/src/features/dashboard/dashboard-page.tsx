import { useState } from 'react';

import { DashboardControlsPanel } from './dashboard-controls-panel';
import { DashboardHeader } from './dashboard-header';
import { DashboardTaskSection } from './dashboard-task-section';
import { DashboardViewMode } from './dashboard-view-mode';
import { TaskFormDialog } from './task-form-dialog';
import { useDashboardData } from './use-dashboard-data';
import { useTaskMutations } from './use-task-mutations';
import { Alert } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Task } from '../../shared/api/types';
import { useAuth } from '../auth/auth-context';

export function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [viewMode, setViewMode] = useState<DashboardViewMode>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    employees,
    tasks,
    selectedEmployeeId,
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
  const taskMutations = useTaskMutations();

  const handleEditTask = (task: Task): void => {
    taskMutations.clearActionError();
    setEditingTask(task);
  };

  const handleOpenCreateTask = (): void => {
    taskMutations.clearActionError();
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTask = (task: Task): void => {
    void taskMutations.deleteTask(task).catch(() => undefined);
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
        <Alert variant="danger">
          Mitarbeitende konnten nicht geladen werden. {employeesError?.message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
        <DashboardHeader userEmail={currentUser?.email ?? null} onSignOut={logout} />

        <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="space-y-4">
            <DashboardControlsPanel
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeChange={setSelectedEmployeeId}
              onRefresh={refreshData}
            />
          </section>

          <DashboardTaskSection
            tasks={tasks}
            employeesCount={employees.length}
            viewMode={viewMode}
            isTasksLoading={isTasksLoading}
            isTasksError={isTasksError}
            isTasksFetching={isTasksFetching}
            tasksError={tasksError}
            actionError={taskMutations.actionError}
            isMutating={taskMutations.isMutating}
            onChangeViewMode={setViewMode}
            onOpenCreateTask={handleOpenCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={taskMutations.toggleSubtask}
            onAddSubtask={taskMutations.addSubtask}
            onRemoveSubtask={taskMutations.removeSubtask}
          />
        </main>
      </div>

      <TaskFormDialog
        key={`create-${isCreateDialogOpen ? 'open' : 'closed'}-${effectiveSelectedEmployeeId ?? 'none'}`}
        open={isCreateDialogOpen}
        mode="create"
        employees={employees}
        selectedEmployeeId={effectiveSelectedEmployeeId}
        task={null}
        isSubmitting={taskMutations.isMutating}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={taskMutations.createTask}
        onUpdate={taskMutations.updateTask}
      />

      <TaskFormDialog
        key={editingTask ? `edit-${editingTask.id}` : 'edit-empty'}
        open={editingTask !== null}
        mode="edit"
        employees={employees}
        selectedEmployeeId={effectiveSelectedEmployeeId}
        task={editingTask}
        isSubmitting={taskMutations.isMutating}
        onClose={() => setEditingTask(null)}
        onCreate={taskMutations.createTask}
        onUpdate={taskMutations.updateTask}
      />
    </div>
  );
}

import { useState } from 'react';

import { DashboardControlsPanel, DashboardHeader, DashboardTaskSection } from './components';
import { dashboardCopy } from './dashboard-copy';
import { DashboardViewMode } from './dashboard-view-mode';
import { TaskFormDialog } from './form';
import { useDashboardData, useEmployeeMutations, useTaskMutations } from './hooks';
import { getEmployeeDisplayName } from './utils';
import { Alert } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { CreateEmployeeRequest, Employee, Task, UpdateEmployeeRequest } from '../../shared/api/types';
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
  const employeeMutations = useEmployeeMutations();
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
    const confirmed = window.confirm(dashboardCopy.tasks.confirmDelete(task.title));
    if (!confirmed) {
      return;
    }
    void taskMutations.deleteTask(task).catch(() => undefined);
  };

  const handleCreateEmployee = async (payload: CreateEmployeeRequest): Promise<Employee> =>
    employeeMutations.createEmployee(payload);

  const handleUpdateEmployee = async (
    employeeId: number,
    payload: UpdateEmployeeRequest,
  ): Promise<Employee> => employeeMutations.updateEmployee(employeeId, payload);

  const handleDeleteEmployee = async (employee: Employee): Promise<void> => {
    const confirmed = window.confirm(
      dashboardCopy.employees.confirmDelete(getEmployeeDisplayName(employee)),
    );
    if (!confirmed) {
      return;
    }

    await employeeMutations.deleteEmployee(employee);
    if (selectedEmployeeId === employee.id) {
      setSelectedEmployeeId(null);
    }
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
          Failed to load employees. {employeesError?.message}
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
              employeeActionError={employeeMutations.actionError}
              isEmployeeMutating={employeeMutations.isMutating}
              onEmployeeChange={setSelectedEmployeeId}
              onClearEmployeeActionError={employeeMutations.clearActionError}
              onCreateEmployee={handleCreateEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
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

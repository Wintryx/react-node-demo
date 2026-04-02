import { AlertTriangle } from 'lucide-react';

import { Alert, Button, Card, CardContent, Spinner } from '../../../components/ui';
import { Task } from '../../../shared/api/types';
import { dashboardTranslations } from '../dashboard-translations';
import { DashboardViewMode } from '../dashboard-view-mode';
import { TaskBoard, TaskList, TaskTimeline } from '../views';

interface DashboardTaskSectionProps {
  tasks: Task[];
  employeesCount: number;
  viewMode: DashboardViewMode;
  isTasksLoading: boolean;
  isTasksError: boolean;
  isTasksFetching: boolean;
  tasksError: Error | null;
  actionError: string | null;
  isMutating: boolean;
  onChangeViewMode(viewMode: DashboardViewMode): void;
  onOpenCreateTask(): void;
  onEditTask(task: Task): void;
  onDeleteTask(task: Task): void;
  onToggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  onAddSubtask(task: Task, title: string): void;
  onRemoveSubtask(task: Task, subtaskId: number): void;
}

export function DashboardTaskSection({
  tasks,
  employeesCount,
  viewMode,
  isTasksLoading,
  isTasksError,
  isTasksFetching,
  tasksError,
  actionError,
  isMutating,
  onChangeViewMode,
  onOpenCreateTask,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}: DashboardTaskSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{dashboardTranslations.tasks.sectionTitle}</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChangeViewMode('list')}
          >
            {dashboardTranslations.tasks.listView}
          </Button>
          <Button
            type="button"
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChangeViewMode('kanban')}
          >
            {dashboardTranslations.tasks.kanbanView}
          </Button>
          <Button
            type="button"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChangeViewMode('timeline')}
          >
            {dashboardTranslations.tasks.timelineView}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={employeesCount === 0}
            onClick={onOpenCreateTask}
          >
            {dashboardTranslations.tasks.newTask}
          </Button>
          {isTasksFetching ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              {dashboardTranslations.tasks.refreshing}
            </span>
          ) : null}
        </div>
      </div>

      {actionError ? <Alert variant="danger">{actionError}</Alert> : null}

      {employeesCount === 0 ? (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center text-muted-foreground">
            {dashboardTranslations.tasks.noEmployees}
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
      ) : viewMode === 'list' ? (
        <TaskList
          tasks={tasks}
          isPending={isMutating}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggleSubtask={onToggleSubtask}
          onAddSubtask={onAddSubtask}
          onRemoveSubtask={onRemoveSubtask}
        />
      ) : viewMode === 'kanban' ? (
        <TaskBoard
          tasks={tasks}
          isPending={isMutating}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggleSubtask={onToggleSubtask}
          onAddSubtask={onAddSubtask}
          onRemoveSubtask={onRemoveSubtask}
        />
      ) : (
        <TaskTimeline tasks={tasks} onTaskClick={onEditTask} />
      )}
    </section>
  );
}

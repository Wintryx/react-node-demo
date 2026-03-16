import { CalendarClock, CircleCheckBig, Clock3 } from 'lucide-react';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Task, TaskPriority, TaskStatus } from '../../shared/api/types';

interface TaskListProps {
  tasks: Task[];
}

const taskStatusVariant: Record<TaskStatus, 'warning' | 'secondary' | 'success'> = {
  todo: 'warning',
  'in-progress': 'secondary',
  done: 'success',
};

const taskPriorityVariant: Record<TaskPriority, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }

  const dueDate = new Date(task.dueDate).getTime();
  return dueDate < Date.now();
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          No tasks found for the selected employee.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const overdue = isOverdue(task);

        return (
          <Card
            key={task.id}
            className={overdue ? 'border-red-300 bg-red-50/50 shadow-red-100/60' : 'border-border'}
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">{task.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={taskStatusVariant[task.status]}>{task.status}</Badge>
                  <Badge variant={taskPriorityVariant[task.priority]}>{task.priority}</Badge>
                </div>
              </div>

              {task.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
              ) : null}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  Due: {formatDate(task.dueDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  Subtasks: {task.subtasks.length}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheckBig className="h-4 w-4" />
                  Done: {task.subtasks.filter((subtask) => subtask.completed).length}
                </span>
              </div>

              {overdue ? <Badge variant="danger">Overdue</Badge> : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

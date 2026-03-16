import { CalendarClock } from 'lucide-react';

import { getTimelinePosition, getTimelineRange, sortTasksForTimeline } from './task-timeline-utils';
import { formatTaskDate, isTaskOverdue, taskStatusVariant } from './task-utils';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Task, TaskStatus } from '../../shared/api/types';

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick(task: Task): void;
}

const timelineBarColorClass: Record<TaskStatus, string> = {
  todo: 'bg-amber-500',
  'in-progress': 'bg-sky-600',
  done: 'bg-emerald-600',
};

const formatAxisDate = (value: number): string =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value));

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          No tasks found for the selected employee.
        </CardContent>
      </Card>
    );
  }

  const sortedTasks = sortTasksForTimeline(tasks);
  const timelineRange = getTimelineRange(sortedTasks);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="hidden grid-cols-[260px_1fr] gap-3 px-2 md:grid">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Task</span>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{formatAxisDate(timelineRange.startMs)}</span>
            <span>{formatAxisDate(timelineRange.endMs)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const overdue = isTaskOverdue(task);
            const { leftPercent, widthPercent } = getTimelinePosition(task, timelineRange);

            return (
              <button
                key={task.id}
                type="button"
                className={
                  overdue
                    ? 'grid w-full gap-3 rounded-lg border border-red-300 bg-red-50/40 p-3 text-left transition hover:bg-red-50 md:grid-cols-[260px_1fr]'
                    : 'grid w-full gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:bg-muted/40 md:grid-cols-[260px_1fr]'
                }
                onClick={() => onTaskClick(task)}
              >
                <div className="space-y-2">
                  <p className="font-display text-sm font-semibold">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={taskStatusVariant[task.status]}>{task.status}</Badge>
                    {overdue ? <Badge variant="danger">Overdue</Badge> : null}
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Due: {formatTaskDate(task.dueDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative h-7 overflow-hidden rounded-md bg-muted/70">
                    <span
                      className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-md ${timelineBarColorClass[task.status]}`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Start: {formatTaskDate(task.startDate)} • Due: {formatTaskDate(task.dueDate)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

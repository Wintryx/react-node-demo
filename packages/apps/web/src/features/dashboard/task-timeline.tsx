import { CalendarClock } from 'lucide-react';
import { useState } from 'react';

import {
  applyTimelineZoom,
  createTimelineTicks,
  getTimelinePosition,
  getTimelineRange,
  getTodayMarkerPosition,
  sortTasksForTimeline,
  TimelineZoomPreset,
} from './task-timeline-utils';
import { formatTaskDate, isTaskOverdue, taskStatusLabels, taskStatusVariant } from './task-utils';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Task, TaskStatus } from '../../shared/api/types';

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick(task: Task): void;
}

interface TaskTimelineGroup {
  key: string;
  label: string;
  tasks: Task[];
}

const timelineBarColorClass: Record<TaskStatus, string> = {
  todo: 'bg-amber-500',
  'in-progress': 'bg-sky-600',
  done: 'bg-emerald-600',
};

const timelineZoomLabels: Record<TimelineZoomPreset, string> = {
  compact: 'Kompakt',
  balanced: 'Ausgewogen',
  expanded: 'Erweitert',
};

const timelineGroupOrder: TaskStatus[] = ['todo', 'in-progress', 'done'];

const formatAxisDate = (value: number): string =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value));

const groupTimelineTasks = (tasks: Task[], grouped: boolean): TaskTimelineGroup[] => {
  if (!grouped) {
    return [
      {
        key: 'all',
        label: 'Alle Aufgaben',
        tasks,
      },
    ];
  }

  return timelineGroupOrder
    .map((status) => ({
      key: status,
      label: taskStatusLabels[status],
      tasks: tasks.filter((task) => task.status === status),
    }))
    .filter((group) => group.tasks.length > 0);
};

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
  const [zoomPreset, setZoomPreset] = useState<TimelineZoomPreset>('balanced');
  const [groupByStatus, setGroupByStatus] = useState(false);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          Keine Aufgaben für die ausgewählte Person gefunden.
        </CardContent>
      </Card>
    );
  }

  const sortedTasks = sortTasksForTimeline(tasks);
  const baseRange = getTimelineRange(sortedTasks);
  const timelineRange = applyTimelineZoom(baseRange, zoomPreset);
  const timelineTicks = createTimelineTicks(timelineRange, 6);
  const todayMarkerPosition = getTodayMarkerPosition(timelineRange);
  const timelineGroups = groupTimelineTasks(sortedTasks, groupByStatus);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Steuerung für Zeitachsen-Skalierung und Gruppierung.
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={zoomPreset}
              className="w-32"
              onChange={(event) => setZoomPreset(event.target.value as TimelineZoomPreset)}
            >
              {Object.entries(timelineZoomLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              size="sm"
              variant={groupByStatus ? 'default' : 'outline'}
              onClick={() => setGroupByStatus((current) => !current)}
            >
              {groupByStatus ? 'Gruppiert' : 'Nach Status gruppieren'}
            </Button>
          </div>
        </div>

        <div className="hidden grid-cols-[260px_1fr] gap-3 px-2 md:grid">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Aufgabe
          </span>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{formatAxisDate(timelineRange.startMs)}</span>
            <span>{formatAxisDate(timelineRange.endMs)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {timelineGroups.map((group) => (
            <div key={group.key} className="space-y-2">
              {groupByStatus ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
              ) : null}

              <div className="space-y-3">
                {group.tasks.map((task) => {
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
                          <Badge variant={taskStatusVariant[task.status]}>
                            {taskStatusLabels[task.status]}
                          </Badge>
                          {overdue ? <Badge variant="danger">Überfällig</Badge> : null}
                        </div>
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Fällig: {formatTaskDate(task.dueDate)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="relative h-7 overflow-hidden rounded-md bg-muted/70">
                          {timelineTicks.map((tick) => {
                            const tickLeftPercent = ((tick - timelineRange.startMs) / timelineRange.spanMs) * 100;
                            return (
                              <span
                                key={`${task.id}-${tick}`}
                                className="pointer-events-none absolute top-0 h-full w-px bg-border/50"
                                style={{
                                  left: `${tickLeftPercent}%`,
                                }}
                              />
                            );
                          })}
                          {todayMarkerPosition !== null ? (
                            <span
                              className="pointer-events-none absolute top-0 h-full w-px bg-red-500/80"
                              style={{
                                left: `${todayMarkerPosition}%`,
                              }}
                            />
                          ) : null}
                          <span
                            className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-md ${timelineBarColorClass[task.status]}`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Start: {formatTaskDate(task.startDate)} | Fällig: {formatTaskDate(task.dueDate)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

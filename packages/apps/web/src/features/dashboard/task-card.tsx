import { CalendarClock, CircleCheckBig, Clock3, Pencil, Trash2 } from 'lucide-react';

import { TaskSubtasksInline } from './task-subtasks-inline';
import {
  formatTaskDate,
  getCompletedSubtasksCount,
  isTaskOverdue,
  taskPriorityLabels,
  taskPriorityVariant,
  taskStatusLabels,
  taskStatusVariant,
} from './task-utils';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Task } from '../../shared/api/types';

interface TaskCardProps {
  task: Task;
  isPending?: boolean;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
  onToggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  onAddSubtask(task: Task, title: string): void;
  onRemoveSubtask(task: Task, subtaskId: number): void;
}

export function TaskCard({
  task,
  isPending = false,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  return (
    <Card className={overdue ? 'border-red-300 bg-red-50/50 shadow-red-100/60' : 'border-border'}>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold">{task.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={taskStatusVariant[task.status]}>{taskStatusLabels[task.status]}</Badge>
              <Badge variant={taskPriorityVariant[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
              {overdue ? <Badge variant="danger">Überfällig</Badge> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => onEdit(task)}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Bearbeiten
            </Button>
            <Button type="button" variant="danger" size="sm" disabled={isPending} onClick={() => onDelete(task)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Löschen
            </Button>
          </div>
        </div>

        {task.description ? <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p> : null}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" />
            Fällig: {formatTaskDate(task.dueDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            Teilaufgaben: {task.subtasks.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleCheckBig className="h-4 w-4" />
            Erledigt: {getCompletedSubtasksCount(task)}
          </span>
        </div>

        <TaskSubtasksInline
          task={task}
          isPending={isPending}
          onToggleSubtask={onToggleSubtask}
          onAddSubtask={onAddSubtask}
          onRemoveSubtask={onRemoveSubtask}
        />
      </CardContent>
    </Card>
  );
}

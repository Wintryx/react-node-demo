import { Trash2 } from 'lucide-react';
import { SyntheticEvent, useState } from 'react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Task } from '../../shared/api/types';

interface TaskSubtasksInlineProps {
  task: Task;
  isPending?: boolean;
  onToggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  onAddSubtask(task: Task, title: string): void;
  onRemoveSubtask(task: Task, subtaskId: number): void;
}

export function TaskSubtasksInline({
  task,
  isPending = false,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}: TaskSubtasksInlineProps) {
  const [draftTitle, setDraftTitle] = useState('');

  const handleAddSubtask = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ): void => {
    event.preventDefault();

    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    onAddSubtask(task, trimmedTitle);
    setDraftTitle('');
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teilaufgaben</p>
      <div className="space-y-2">
        {task.subtasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">Noch keine Teilaufgaben.</p>
        ) : (
          task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={subtask.completed}
                disabled={isPending}
                onChange={(event) => onToggleSubtask(task, subtask.id, event.target.checked)}
              />
              <span
                className={subtask.completed ? 'flex-1 text-xs text-muted-foreground line-through' : 'flex-1 text-xs'}
              >
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => onRemoveSubtask(task, subtask.id)}
                aria-label={`Teilaufgabe ${subtask.title} entfernen`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      <form className="flex items-center gap-2" onSubmit={handleAddSubtask}>
        <Input
          value={draftTitle}
          disabled={isPending}
          placeholder="Teilaufgabe hinzufügen..."
          onChange={(event) => setDraftTitle(event.target.value)}
        />
        <Button type="submit" size="sm" disabled={isPending || draftTitle.trim().length === 0}>
          Hinzufügen
        </Button>
      </form>
    </div>
  );
}

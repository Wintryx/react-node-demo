import { TaskCard } from './task-card';
import { Card, CardContent } from '../../components/ui/card';
import { Task } from '../../shared/api/types';

interface TaskListProps {
  tasks: Task[];
  isPending?: boolean;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
  onToggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  onAddSubtask(task: Task, title: string): void;
  onRemoveSubtask(task: Task, subtaskId: number): void;
}

export function TaskList({
  tasks,
  isPending = false,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}: TaskListProps) {
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
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isPending={isPending}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleSubtask={onToggleSubtask}
          onAddSubtask={onAddSubtask}
          onRemoveSubtask={onRemoveSubtask}
        />
      ))}
    </div>
  );
}

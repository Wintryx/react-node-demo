import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Task, TaskStatus } from '../../../shared/api/types';
import { TaskCard } from '../components';
import { taskStatusLabels, taskStatusOrder } from '../utils';

interface TaskBoardProps {
  tasks: Task[];
  isPending?: boolean;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
  onToggleSubtask(task: Task, subtaskId: number, completed: boolean): void;
  onAddSubtask(task: Task, title: string): void;
  onRemoveSubtask(task: Task, subtaskId: number): void;
}

const groupByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => ({
  todo: tasks.filter((task) => task.status === 'todo'),
  'in-progress': tasks.filter((task) => task.status === 'in-progress'),
  done: tasks.filter((task) => task.status === 'done'),
});

export function TaskBoard({
  tasks,
  isPending = false,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}: TaskBoardProps) {
  const groupedTasks = groupByStatus(tasks);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {taskStatusOrder.map((status) => (
        <Card key={status} className="flex h-full flex-col">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{taskStatusLabels[status]}</CardTitle>
              <Badge variant="secondary">{groupedTasks[status].length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 p-3">
            {groupedTasks[status].length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No tasks in this column.
              </div>
            ) : (
              groupedTasks[status].map((task) => (
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
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

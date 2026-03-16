import { Task, TaskPriority, TaskStatus } from '../../shared/api/types';

export const taskStatusVariant: Record<TaskStatus, 'warning' | 'secondary' | 'success'> = {
  todo: 'warning',
  'in-progress': 'secondary',
  done: 'success',
};

export const taskPriorityVariant: Record<TaskPriority, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

export const taskStatusOrder: TaskStatus[] = ['todo', 'in-progress', 'done'];

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const formatTaskDate = (value: string | null): string => {
  if (!value) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }

  const dueDate = new Date(task.dueDate).getTime();
  return dueDate < Date.now();
};

export const getCompletedSubtasksCount = (task: Task): number =>
  task.subtasks.filter((subtask) => subtask.completed).length;

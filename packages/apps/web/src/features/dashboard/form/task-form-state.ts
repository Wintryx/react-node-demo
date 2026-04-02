import {
  CreateTaskRequest,
  Employee,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
  UpsertSubtaskRequest,
} from '../../../shared/api/types';
import { formatDateOnly, toApiDateTime, toDateOnly } from '../../../shared/lib/date';

export type TaskFormMode = 'create' | 'edit';

export interface EditableSubtask {
  id?: number;
  title: string;
  completed: boolean;
  startDate: string;
  endDate: string | null;
  assigneeId: number | null;
}

export interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string | null;
  employeeId: number | null;
  subtasks: EditableSubtask[];
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export const createSubtaskDraft = (startDate: string): EditableSubtask => ({
  title: '',
  completed: false,
  startDate,
  endDate: null,
  assigneeId: null,
});

const toEditableSubtasks = (task: Task): EditableSubtask[] =>
  task.subtasks.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    startDate: toDateOnly(subtask.startDate) ?? formatDateOnly(new Date()),
    endDate: toDateOnly(subtask.endDate),
    assigneeId: subtask.assignee?.id ?? null,
  }));

export const toUpsertSubtaskRequest = (subtask: EditableSubtask): UpsertSubtaskRequest => ({
  id: subtask.id,
  title: subtask.title.trim(),
  completed: subtask.completed,
  startDate: toApiDateTime(subtask.startDate),
  endDate: subtask.endDate ? toApiDateTime(subtask.endDate) : undefined,
  assigneeId: subtask.assigneeId ?? undefined,
});

export const createInitialTaskFormState = (
  mode: TaskFormMode,
  task: Task | null,
  selectedEmployeeId: number | null,
  employees: Employee[],
): TaskFormState => {
  if (mode === 'edit' && task) {
    return {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      startDate: toDateOnly(task.startDate) ?? formatDateOnly(new Date()),
      dueDate: toDateOnly(task.dueDate),
      employeeId: task.employeeId,
      subtasks: toEditableSubtasks(task),
    };
  }

  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    startDate: formatDateOnly(new Date()),
    dueDate: null,
    employeeId: selectedEmployeeId ?? employees[0]?.id ?? null,
    subtasks: [],
  };
};

export const mapTaskFormError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed. Please try again.';
};

export interface TaskValidationCopy {
  titleRequired: string;
  startDateRequired: string;
  assigneeRequired: string;
  subtaskInvalid: string;
}

export const validateTaskFormState = (
  formState: TaskFormState,
  messages: TaskValidationCopy,
): string | null => {
  if (!formState.title.trim()) {
    return messages.titleRequired;
  }

  if (!formState.startDate) {
    return messages.startDateRequired;
  }

  if (!formState.employeeId) {
    return messages.assigneeRequired;
  }

  const hasInvalidSubtask = formState.subtasks.some(
    (subtask) => subtask.title.trim().length === 0 || subtask.startDate.length === 0,
  );
  if (hasInvalidSubtask) {
    return messages.subtaskInvalid;
  }

  return null;
};

export const toCreateTaskPayload = (formState: TaskFormState): CreateTaskRequest => ({
  title: formState.title.trim(),
  description: formState.description.trim() || undefined,
  status: formState.status,
  priority: formState.priority,
  startDate: toApiDateTime(formState.startDate),
  dueDate: formState.dueDate ? toApiDateTime(formState.dueDate) : undefined,
  employeeId: formState.employeeId as number,
  subtasks: formState.subtasks.map((subtask) => toUpsertSubtaskRequest(subtask)),
});

const resolveUpdateDueDate = (
  formState: TaskFormState,
  sourceTask: Task | null,
): UpdateTaskRequest['dueDate'] => {
  if (formState.dueDate) {
    return toApiDateTime(formState.dueDate);
  }

  if (sourceTask?.dueDate) {
    return null;
  }

  return undefined;
};

export const toUpdateTaskPayload = (
  formState: TaskFormState,
  sourceTask: Task | null,
): UpdateTaskRequest => ({
  title: formState.title.trim(),
  description: formState.description.trim() || undefined,
  status: formState.status,
  priority: formState.priority,
  startDate: toApiDateTime(formState.startDate),
  dueDate: resolveUpdateDueDate(formState, sourceTask),
  employeeId: formState.employeeId as number,
  subtasks: formState.subtasks.map((subtask) => toUpsertSubtaskRequest(subtask)),
});

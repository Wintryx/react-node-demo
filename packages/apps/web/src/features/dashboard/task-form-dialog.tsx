import { X } from 'lucide-react';
import { SyntheticEvent, useEffect, useState } from 'react';

import { getEmployeeDisplayName } from './employee-display-name';
import { taskPriorityLabels, taskStatusLabels } from './task-utils';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { DatePickerField } from '../../components/ui/date-picker-field';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import {
  CreateTaskRequest,
  Employee,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
  UpsertSubtaskRequest,
} from '../../shared/api/types';
import { formatDateOnly, toApiDateTime, toDateOnly } from '../../shared/lib/date';

type TaskFormMode = 'create' | 'edit';

interface EditableSubtask {
  id?: number;
  title: string;
  completed: boolean;
  startDate: string;
  endDate: string | null;
  assigneeId: number | null;
}

interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string | null;
  employeeId: number | null;
  subtasks: EditableSubtask[];
}

interface TaskFormDialogProps {
  open: boolean;
  mode: TaskFormMode;
  employees: Employee[];
  selectedEmployeeId: number | null;
  task: Task | null;
  isSubmitting?: boolean;
  onClose(): void;
  onCreate(payload: CreateTaskRequest): Promise<void>;
  onUpdate(taskId: number, payload: UpdateTaskRequest): Promise<void>;
}

const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

const createSubtaskDraft = (startDate: string): EditableSubtask => ({
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

const toUpsertSubtaskRequest = (subtask: EditableSubtask): UpsertSubtaskRequest => ({
  id: subtask.id,
  title: subtask.title.trim(),
  completed: subtask.completed,
  startDate: toApiDateTime(subtask.startDate),
  endDate: subtask.endDate ? toApiDateTime(subtask.endDate) : undefined,
  assigneeId: subtask.assigneeId ?? undefined,
});

const createInitialState = (
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

const mapError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Anfrage fehlgeschlagen. Bitte erneut versuchen.';
};

export function TaskFormDialog({
  open,
  mode,
  employees,
  selectedEmployeeId,
  task,
  isSubmitting = false,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormDialogProps) {
  const [formState, setFormState] = useState<TaskFormState>(() =>
    createInitialState(mode, task, selectedEmployeeId, employees),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ): Promise<void> => {
    event.preventDefault();

    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Titel ist erforderlich.');
      return;
    }

    if (!formState.startDate) {
      setErrorMessage('Startdatum ist erforderlich.');
      return;
    }

    if (!formState.employeeId) {
      setErrorMessage('Mitarbeitende Person ist erforderlich.');
      return;
    }

    const hasInvalidSubtask = formState.subtasks.some(
      (subtask) => subtask.title.trim().length === 0 || subtask.startDate.length === 0,
    );
    if (hasInvalidSubtask) {
      setErrorMessage('Jede Teilaufgabe braucht einen Titel und ein Startdatum.');
      return;
    }

    const payloadSubtasks = formState.subtasks.map((subtask) => toUpsertSubtaskRequest(subtask));

    try {
      if (mode === 'create') {
        await onCreate({
          title: trimmedTitle,
          description: formState.description.trim() || undefined,
          status: formState.status,
          priority: formState.priority,
          startDate: toApiDateTime(formState.startDate),
          dueDate: formState.dueDate ? toApiDateTime(formState.dueDate) : undefined,
          employeeId: formState.employeeId,
          subtasks: payloadSubtasks,
        });
      } else {
        if (!task) {
          setErrorMessage('Aufgabenkontext fehlt.');
          return;
        }

        await onUpdate(task.id, {
          title: trimmedTitle,
          description: formState.description.trim() || undefined,
          status: formState.status,
          priority: formState.priority,
          startDate: toApiDateTime(formState.startDate),
          dueDate: formState.dueDate ? toApiDateTime(formState.dueDate) : undefined,
          employeeId: formState.employeeId,
          subtasks: payloadSubtasks,
        });
      }

      onClose();
    } catch (error: unknown) {
      setErrorMessage(mapError(error));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-lg font-semibold">
            {mode === 'create' ? 'Aufgabe erstellen' : `Aufgabe #${task?.id ?? ''} bearbeiten`}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="max-h-[80vh] space-y-5 overflow-y-auto p-5" onSubmit={handleSubmit}>
          {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

          <div className="space-y-2">
            <Label htmlFor="task-title">Titel</Label>
            <Input
              id="task-title"
              value={formState.title}
              maxLength={200}
              disabled={isSubmitting}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Beschreibung</Label>
            <textarea
              id="task-description"
              value={formState.description}
              maxLength={2000}
              rows={4}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={formState.status}
                disabled={isSubmitting}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    status: event.target.value as TaskStatus,
                  }))
                }
              >
                {TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {taskStatusLabels[option]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priorität</Label>
              <Select
                id="task-priority"
                value={formState.priority}
                disabled={isSubmitting}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    priority: event.target.value as TaskPriority,
                  }))
                }
              >
                {TASK_PRIORITIES.map((option) => (
                  <option key={option} value={option}>
                    {taskPriorityLabels[option]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-employee">Mitarbeitende</Label>
              <Select
                id="task-employee"
                value={formState.employeeId?.toString() ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    employeeId: Number(event.target.value),
                  }))
                }
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {getEmployeeDisplayName(employee)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <DatePickerField
                value={formState.startDate}
                disabled={isSubmitting}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    startDate: value ?? '',
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <DatePickerField
                value={formState.dueDate}
                disabled={isSubmitting}
                allowClear
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    dueDate: value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Teilaufgaben</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() =>
                  setFormState((current) => ({
                    ...current,
                    subtasks: [...current.subtasks, createSubtaskDraft(current.startDate)],
                  }))
                }
              >
                Teilaufgabe hinzufügen
              </Button>
            </div>

            {formState.subtasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Teilaufgaben hinzugefügt.</p>
            ) : (
              <div className="space-y-3">
                {formState.subtasks.map((subtask, index) => (
                  <div key={subtask.id ?? `draft-${index}`} className="space-y-3 rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        value={subtask.title}
                        placeholder="Titel der Teilaufgabe"
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            subtasks: current.subtasks.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, title: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() =>
                          setFormState((current) => ({
                            ...current,
                            subtasks: current.subtasks.filter((_, entryIndex) => entryIndex !== index),
                          }))
                        }
                      >
                        Entfernen
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Start Teilaufgabe</Label>
                        <DatePickerField
                          value={subtask.startDate}
                          disabled={isSubmitting}
                          onChange={(value) =>
                            setFormState((current) => ({
                              ...current,
                              subtasks: current.subtasks.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, startDate: value ?? '' } : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ende Teilaufgabe</Label>
                        <DatePickerField
                          value={subtask.endDate}
                          disabled={isSubmitting}
                          allowClear
                          onChange={(value) =>
                            setFormState((current) => ({
                              ...current,
                              subtasks: current.subtasks.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, endDate: value } : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zugewiesen an</Label>
                        <Select
                          value={subtask.assigneeId?.toString() ?? ''}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              subtasks: current.subtasks.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      assigneeId:
                                        event.target.value === '' ? null : Number(event.target.value),
                                    }
                                  : entry,
                              ),
                            }))
                          }
                        >
                          <option value="">Nicht zugewiesen</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {getEmployeeDisplayName(employee)}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={subtask.completed}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            subtasks: current.subtasks.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, completed: event.target.checked } : entry,
                            ),
                          }))
                        }
                      />
                      Erledigt
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? 'Aufgabe erstellen' : 'Änderungen speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

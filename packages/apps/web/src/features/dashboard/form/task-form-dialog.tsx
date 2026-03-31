import { CreateTaskRequest, Employee, Task, UpdateTaskRequest } from '@react-node-demo/shared-contracts';
import { X } from 'lucide-react';
import { SyntheticEvent, useEffect, useState } from 'react';

import { TaskFormCoreFields } from './task-form-core-fields';
import {
  mapTaskFormError,
  TaskFormMode,
  TaskFormState,
  toCreateTaskPayload,
  toUpdateTaskPayload,
} from './task-form-state';
import { TaskFormSubtasksEditor } from './task-form-subtasks-editor';
import { useTaskFormState } from './use-task-form-state';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { dashboardCopy } from '../dashboard-copy';

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

const validateFormState = (formState: TaskFormState): string | null => {
  if (!formState.title.trim()) {
    return dashboardCopy.tasks.validations.titleRequired;
  }

  if (!formState.startDate) {
    return dashboardCopy.tasks.validations.startDateRequired;
  }

  if (!formState.employeeId) {
    return dashboardCopy.tasks.validations.assigneeRequired;
  }

  const hasInvalidSubtask = formState.subtasks.some(
    (subtask) => subtask.title.trim().length === 0 || subtask.startDate.length === 0,
  );
  if (hasInvalidSubtask) {
    return dashboardCopy.tasks.validations.subtaskInvalid;
  }

  return null;
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
  const { formState, setField, addSubtask, removeSubtask, updateSubtask } = useTaskFormState({
    mode,
    task,
    selectedEmployeeId,
    employees,
  });
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
    setErrorMessage(null);

    const validationError = validateFormState(formState);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      if (mode === 'create') {
        await onCreate(toCreateTaskPayload(formState));
      } else {
        if (!task) {
          setErrorMessage(dashboardCopy.tasks.missingContext);
          return;
        }
        await onUpdate(task.id, toUpdateTaskPayload(formState, task));
      }

      onClose();
    } catch (error: unknown) {
      setErrorMessage(mapTaskFormError(error));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-lg font-semibold">
            {mode === 'create'
              ? dashboardCopy.tasks.create
              : dashboardCopy.tasks.editHeading(task?.id ?? '')}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="max-h-[80vh] space-y-5 overflow-y-auto p-5" onSubmit={handleSubmit}>
          {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

          <TaskFormCoreFields
            formState={formState}
            employees={employees}
            isSubmitting={isSubmitting}
            onChangeTitle={(value) => setField('title', value)}
            onChangeDescription={(value) => setField('description', value)}
            onChangeStatus={(value) => setField('status', value)}
            onChangePriority={(value) => setField('priority', value)}
            onChangeEmployeeId={(value) => setField('employeeId', value)}
            onChangeStartDate={(value) => setField('startDate', value)}
            onChangeDueDate={(value) => setField('dueDate', value)}
          />

          <TaskFormSubtasksEditor
            subtasks={formState.subtasks}
            employees={employees}
            isSubmitting={isSubmitting}
            onAddSubtask={addSubtask}
            onRemoveSubtask={removeSubtask}
            onChangeSubtask={updateSubtask}
          />

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              {dashboardCopy.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? dashboardCopy.tasks.create : dashboardCopy.common.saveChanges}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Employee, Task } from '@react-node-demo/shared-contracts';
import { useState } from 'react';

import {
  createInitialTaskFormState,
  createSubtaskDraft,
  EditableSubtask,
  TaskFormMode,
  TaskFormState,
} from './task-form-state';

interface UseTaskFormStateParams {
  mode: TaskFormMode;
  task: Task | null;
  selectedEmployeeId: number | null;
  employees: Employee[];
}

export const useTaskFormState = ({
  mode,
  task,
  selectedEmployeeId,
  employees,
}: UseTaskFormStateParams) => {
  const [formState, setFormState] = useState<TaskFormState>(() =>
    createInitialTaskFormState(mode, task, selectedEmployeeId, employees),
  );

  const setField = <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]): void => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSubtask = (index: number, patch: Partial<EditableSubtask>): void => {
    setFormState((current) => ({
      ...current,
      subtasks: current.subtasks.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    }));
  };

  const addSubtask = (): void => {
    setFormState((current) => ({
      ...current,
      subtasks: [...current.subtasks, createSubtaskDraft(current.startDate)],
    }));
  };

  const removeSubtask = (index: number): void => {
    setFormState((current) => ({
      ...current,
      subtasks: current.subtasks.filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  return {
    formState,
    setFormState,
    setField,
    updateSubtask,
    addSubtask,
    removeSubtask,
  };
};

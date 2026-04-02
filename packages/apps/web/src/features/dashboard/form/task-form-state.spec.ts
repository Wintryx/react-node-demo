import { describe, expect, it } from 'vitest';

import {
  TaskFormState,
  toUpdateTaskPayload,
  validateTaskFormState,
} from './task-form-state';
import { Task } from '../../../shared/api/types';

const validationMessages = {
  titleRequired: 'title-required',
  startDateRequired: 'start-required',
  assigneeRequired: 'assignee-required',
  subtaskInvalid: 'subtask-invalid',
};

const baseFormState = (dueDate: string | null): TaskFormState => ({
  title: 'Update title',
  description: 'Update description',
  status: 'in-progress',
  priority: 'high',
  startDate: '2026-04-01',
  dueDate,
  employeeId: 1,
  subtasks: [],
});

const validFormState = (): TaskFormState => ({
  ...baseFormState(null),
  title: 'Valid title',
  startDate: '2026-04-02',
  employeeId: 1,
});

const baseTask = (dueDate: string | null): Task => ({
  id: 7,
  title: 'Existing task',
  description: 'Existing description',
  status: 'todo',
  priority: 'medium',
  startDate: '2026-04-01T12:00:00.000Z',
  dueDate,
  createdAt: '2026-03-30T10:00:00.000Z',
  employeeId: 1,
  subtasks: [],
});

describe('task form state payload mapping', () => {
  it('maps an entered due date to ISO datetime', () => {
    const payload = toUpdateTaskPayload(baseFormState('2026-04-05'), baseTask(null));
    expect(payload.dueDate).toBe('2026-04-05T12:00:00.000Z');
  });

  it('sets dueDate=null when user clears an existing due date', () => {
    const payload = toUpdateTaskPayload(
      baseFormState(null),
      baseTask('2026-04-05T12:00:00.000Z'),
    );
    expect(payload.dueDate).toBeNull();
  });

  it('keeps dueDate undefined when no due date exists and none is entered', () => {
    const payload = toUpdateTaskPayload(baseFormState(null), baseTask(null));
    expect(payload.dueDate).toBeUndefined();
  });
});

describe('task form state validation', () => {
  it('returns title validation message when title is empty', () => {
    const invalidState: TaskFormState = {
      ...validFormState(),
      title: '   ',
    };

    expect(validateTaskFormState(invalidState, validationMessages)).toBe(
      validationMessages.titleRequired,
    );
  });

  it('returns subtask validation message when subtask is incomplete', () => {
    const invalidState: TaskFormState = {
      ...validFormState(),
      subtasks: [
        {
          title: '',
          completed: false,
          startDate: '',
          endDate: null,
          assigneeId: null,
        },
      ],
    };

    expect(validateTaskFormState(invalidState, validationMessages)).toBe(
      validationMessages.subtaskInvalid,
    );
  });

  it('returns null for valid state', () => {
    expect(validateTaskFormState(validFormState(), validationMessages)).toBeNull();
  });
});

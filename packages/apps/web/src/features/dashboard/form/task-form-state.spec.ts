import { describe, expect, it } from 'vitest';

import { TaskFormState, toUpdateTaskPayload } from './task-form-state';
import { Task } from '../../../shared/api/types';

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

import { describe, expect, it } from 'vitest';

import { toUpsertSubtaskRequest, toUpsertSubtaskRequests } from './task-request-mapper';
import { Subtask, Task } from '../../../shared/api/types';

const createSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
  id: 1,
  title: 'Implement endpoint',
  completed: false,
  startDate: '2026-03-16T12:00:00.000Z',
  endDate: '2026-03-17T12:00:00.000Z',
  assignee: {
    id: 10,
    name: 'Ada Lovelace',
  },
  ...overrides,
});

const createTask = (subtasks: Subtask[]): Task => ({
  id: 5,
  title: 'Build timeline',
  description: null,
  status: 'in-progress',
  priority: 'high',
  startDate: '2026-03-16T12:00:00.000Z',
  dueDate: '2026-03-20T12:00:00.000Z',
  createdAt: '2026-03-16T10:00:00.000Z',
  employeeId: 1,
  subtasks,
});

describe('task request mapper', () => {
  it('maps a subtask including optional fields when present', () => {
    const subtask = createSubtask();

    expect(toUpsertSubtaskRequest(subtask)).toEqual({
      id: 1,
      title: 'Implement endpoint',
      completed: false,
      startDate: '2026-03-16T12:00:00.000Z',
      endDate: '2026-03-17T12:00:00.000Z',
      assigneeId: 10,
    });
  });

  it('maps nullable fields to undefined for API payload compatibility', () => {
    const subtask = createSubtask({
      endDate: null,
      assignee: null,
    });

    expect(toUpsertSubtaskRequest(subtask)).toEqual({
      id: 1,
      title: 'Implement endpoint',
      completed: false,
      startDate: '2026-03-16T12:00:00.000Z',
      endDate: undefined,
      assigneeId: undefined,
    });
  });

  it('maps all task subtasks in stable order', () => {
    const task = createTask([
      createSubtask({ id: 1, title: 'A' }),
      createSubtask({ id: 2, title: 'B' }),
    ]);

    const result = toUpsertSubtaskRequests(task);
    expect(result.map((entry) => entry.id)).toEqual([1, 2]);
    expect(result.map((entry) => entry.title)).toEqual(['A', 'B']);
  });
});

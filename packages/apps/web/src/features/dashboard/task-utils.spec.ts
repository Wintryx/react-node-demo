import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  formatTaskDate,
  getCompletedSubtasksCount,
  isTaskOverdue,
  taskPriorityVariant,
  taskStatusLabels,
  taskStatusOrder,
  taskStatusVariant,
} from './task-utils';
import { Task } from '../../shared/api/types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Task',
  description: null,
  status: 'todo',
  priority: 'medium',
  startDate: '2026-03-10T12:00:00.000Z',
  dueDate: '2026-03-12T12:00:00.000Z',
  createdAt: '2026-03-09T12:00:00.000Z',
  employeeId: 1,
  subtasks: [
    {
      id: 1,
      title: 'First',
      completed: true,
      startDate: '2026-03-10T12:00:00.000Z',
      endDate: null,
      assignee: null,
    },
    {
      id: 2,
      title: 'Second',
      completed: false,
      startDate: '2026-03-10T12:00:00.000Z',
      endDate: null,
      assignee: null,
    },
  ],
  ...overrides,
});

describe('task utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides stable task status and priority maps', () => {
    expect(taskStatusOrder).toEqual(['todo', 'in-progress', 'done']);
    expect(taskStatusLabels['in-progress']).toBe('In Progress');
    expect(taskStatusVariant.done).toBe('success');
    expect(taskPriorityVariant.high).toBe('danger');
  });

  it('returns fallback text for empty due date', () => {
    expect(formatTaskDate(null)).toBe('No due date');
  });

  it('marks task as overdue only when due date is before now and status is not done', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-20T12:00:00.000Z').getTime());

    expect(isTaskOverdue(createTask({ dueDate: '2026-03-19T12:00:00.000Z', status: 'todo' }))).toBe(
      true,
    );
    expect(isTaskOverdue(createTask({ dueDate: '2026-03-21T12:00:00.000Z', status: 'todo' }))).toBe(
      false,
    );
    expect(isTaskOverdue(createTask({ dueDate: '2026-03-19T12:00:00.000Z', status: 'done' }))).toBe(
      false,
    );
    expect(isTaskOverdue(createTask({ dueDate: null, status: 'todo' }))).toBe(false);
  });

  it('counts completed subtasks correctly', () => {
    expect(getCompletedSubtasksCount(createTask())).toBe(1);
    expect(
      getCompletedSubtasksCount(
        createTask({
          subtasks: [],
        }),
      ),
    ).toBe(0);
  });
});

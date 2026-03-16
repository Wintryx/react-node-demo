import { describe, expect, it } from 'vitest';

import { getTimelinePosition, getTimelineRange, sortTasksForTimeline } from './task-timeline-utils';
import { Task } from '../../shared/api/types';

const createTask = (overrides: Partial<Task>): Task => ({
  id: 1,
  title: 'Task',
  description: null,
  status: 'todo',
  priority: 'medium',
  startDate: '2026-03-10T12:00:00.000Z',
  dueDate: '2026-03-12T12:00:00.000Z',
  createdAt: '2026-03-09T12:00:00.000Z',
  employeeId: 1,
  subtasks: [],
  ...overrides,
});

describe('task timeline helpers', () => {
  it('sorts tasks by due date and pushes tasks without due date to the end', () => {
    const tasks = [
      createTask({ id: 1, dueDate: null }),
      createTask({ id: 2, dueDate: '2026-03-11T12:00:00.000Z' }),
      createTask({ id: 3, dueDate: '2026-03-10T12:00:00.000Z' }),
    ];

    const result = sortTasksForTimeline(tasks);
    expect(result.map((task) => task.id)).toEqual([3, 2, 1]);
  });

  it('creates at least one day range when all tasks share one timestamp', () => {
    const tasks = [createTask({ dueDate: '2026-03-10T12:00:00.000Z' })];

    const range = getTimelineRange(tasks);
    expect(range.spanMs).toBe(24 * 60 * 60 * 1000);
  });

  it('returns a minimum bar width even for zero-length tasks', () => {
    const task = createTask({
      startDate: '2026-03-10T12:00:00.000Z',
      dueDate: '2026-03-10T12:00:00.000Z',
    });
    const range = getTimelineRange([
      task,
      createTask({
        id: 2,
        startDate: '2026-03-10T12:00:00.000Z',
        dueDate: '2026-03-15T12:00:00.000Z',
      }),
    ]);

    const position = getTimelinePosition(task, range);
    expect(position.widthPercent).toBeGreaterThanOrEqual(2);
  });
});

import { describe, expect, it } from 'vitest';

import {
  applyTimelineZoom,
  createTimelineTicks,
  getRelativePositionPercent,
  getTimelinePosition,
  getTimelineRange,
  getTodayMarkerPosition,
  sortTasksForTimeline,
} from './task-timeline-utils';
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

  it('applies zoom padding based on selected preset', () => {
    const baseRange = {
      startMs: new Date('2026-03-10T00:00:00.000Z').getTime(),
      endMs: new Date('2026-03-12T00:00:00.000Z').getTime(),
      spanMs: 2 * 24 * 60 * 60 * 1000,
    };

    const compactRange = applyTimelineZoom(baseRange, 'compact');
    const expandedRange = applyTimelineZoom(baseRange, 'expanded');

    expect(compactRange.startMs).toBeLessThan(baseRange.startMs);
    expect(compactRange.endMs).toBeGreaterThan(baseRange.endMs);
    expect(expandedRange.spanMs).toBeGreaterThan(compactRange.spanMs);
  });

  it('creates requested number of timeline ticks including range bounds', () => {
    const range = {
      startMs: new Date('2026-03-10T00:00:00.000Z').getTime(),
      endMs: new Date('2026-03-20T00:00:00.000Z').getTime(),
      spanMs: 10 * 24 * 60 * 60 * 1000,
    };

    const ticks = createTimelineTicks(range, 5);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(range.startMs);
    expect(ticks[ticks.length - 1]).toBe(range.endMs);
  });

  it('returns today marker only when current date is inside range', () => {
    const range = {
      startMs: new Date('2026-03-10T00:00:00.000Z').getTime(),
      endMs: new Date('2026-03-20T00:00:00.000Z').getTime(),
      spanMs: 10 * 24 * 60 * 60 * 1000,
    };
    const inside = new Date('2026-03-15T00:00:00.000Z').getTime();
    const outside = new Date('2026-03-25T00:00:00.000Z').getTime();

    expect(getTodayMarkerPosition(range, inside)).not.toBeNull();
    expect(getTodayMarkerPosition(range, outside)).toBeNull();
  });

  it('clamps relative position percentage to [0, 100]', () => {
    const range = {
      startMs: new Date('2026-03-10T00:00:00.000Z').getTime(),
      endMs: new Date('2026-03-20T00:00:00.000Z').getTime(),
      spanMs: 10 * 24 * 60 * 60 * 1000,
    };

    expect(getRelativePositionPercent(range.startMs - 1000, range)).toBe(0);
    expect(getRelativePositionPercent(range.endMs + 1000, range)).toBe(100);
  });
});

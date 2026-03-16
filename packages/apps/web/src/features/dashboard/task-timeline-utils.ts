import { Task } from '../../shared/api/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface TimelineTaskRange {
  startMs: number;
  endMs: number;
}

export interface TimelineRange {
  startMs: number;
  endMs: number;
  spanMs: number;
}

export interface TimelinePosition {
  leftPercent: number;
  widthPercent: number;
}

const normalizeTaskRange = (task: Task): TimelineTaskRange => {
  const startMs = new Date(task.startDate).getTime();
  const dueMs = task.dueDate ? new Date(task.dueDate).getTime() : startMs;
  const endMs = Number.isFinite(dueMs) && dueMs >= startMs ? dueMs : startMs;

  return { startMs, endMs };
};

export const sortTasksForTimeline = (tasks: Task[]): Task[] =>
  [...tasks].sort((left, right) => {
    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    return new Date(left.startDate).getTime() - new Date(right.startDate).getTime();
  });

export const getTimelineRange = (tasks: Task[]): TimelineRange => {
  if (tasks.length === 0) {
    const now = Date.now();
    return {
      startMs: now,
      endMs: now + DAY_IN_MS,
      spanMs: DAY_IN_MS,
    };
  }

  const taskRanges = tasks.map((task) => normalizeTaskRange(task));
  const startMs = Math.min(...taskRanges.map((taskRange) => taskRange.startMs));
  const maxEndMs = Math.max(...taskRanges.map((taskRange) => taskRange.endMs));
  const endMs = maxEndMs === startMs ? startMs + DAY_IN_MS : maxEndMs;

  return {
    startMs,
    endMs,
    spanMs: endMs - startMs,
  };
};

export const getTimelinePosition = (task: Task, timelineRange: TimelineRange): TimelinePosition => {
  const taskRange = normalizeTaskRange(task);
  const rawLeft = ((taskRange.startMs - timelineRange.startMs) / timelineRange.spanMs) * 100;
  const rawWidth = ((taskRange.endMs - taskRange.startMs) / timelineRange.spanMs) * 100;

  const leftPercent = Math.min(Math.max(rawLeft, 0), 100);
  const widthPercent = Math.min(Math.max(rawWidth, 2), 100 - leftPercent);

  return {
    leftPercent,
    widthPercent,
  };
};

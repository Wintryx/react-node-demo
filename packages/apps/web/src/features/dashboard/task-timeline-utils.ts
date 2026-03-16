import { Task } from '../../shared/api/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MIN_TIMELINE_SPAN_MS = DAY_IN_MS;

interface TimelineTaskRange {
  startMs: number;
  endMs: number;
}

export type TimelineZoomPreset = 'compact' | 'balanced' | 'expanded';

export interface TimelineRange {
  startMs: number;
  endMs: number;
  spanMs: number;
}

export interface TimelinePosition {
  leftPercent: number;
  widthPercent: number;
}

const timelineZoomPaddingDays: Record<TimelineZoomPreset, number> = {
  compact: 1,
  balanced: 3,
  expanded: 7,
};

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
  const endMs = maxEndMs === startMs ? startMs + MIN_TIMELINE_SPAN_MS : maxEndMs;

  return {
    startMs,
    endMs,
    spanMs: endMs - startMs,
  };
};

export const applyTimelineZoom = (
  timelineRange: TimelineRange,
  zoomPreset: TimelineZoomPreset,
): TimelineRange => {
  const paddingMs = timelineZoomPaddingDays[zoomPreset] * DAY_IN_MS;
  const startMs = timelineRange.startMs - paddingMs;
  const rawEndMs = timelineRange.endMs + paddingMs;
  const endMs =
    rawEndMs <= startMs ? startMs + MIN_TIMELINE_SPAN_MS : rawEndMs;

  return {
    startMs,
    endMs,
    spanMs: endMs - startMs,
  };
};

export const createTimelineTicks = (timelineRange: TimelineRange, tickCount: number): number[] => {
  const safeTickCount = Math.max(tickCount, 2);
  const intervalMs = timelineRange.spanMs / (safeTickCount - 1);

  return Array.from({ length: safeTickCount }, (_, index) =>
    Math.round(timelineRange.startMs + index * intervalMs),
  );
};

export const getRelativePositionPercent = (valueMs: number, timelineRange: TimelineRange): number => {
  const rawPercent = ((valueMs - timelineRange.startMs) / timelineRange.spanMs) * 100;
  return Math.min(Math.max(rawPercent, 0), 100);
};

export const getTodayMarkerPosition = (
  timelineRange: TimelineRange,
  nowMs = Date.now(),
): number | null => {
  if (nowMs < timelineRange.startMs || nowMs > timelineRange.endMs) {
    return null;
  }

  return getRelativePositionPercent(nowMs, timelineRange);
};

export const getTimelinePosition = (task: Task, timelineRange: TimelineRange): TimelinePosition => {
  const taskRange = normalizeTaskRange(task);
  const leftPercent = getRelativePositionPercent(taskRange.startMs, timelineRange);
  const rawWidth = ((taskRange.endMs - taskRange.startMs) / timelineRange.spanMs) * 100;
  const widthPercent = Math.min(Math.max(rawWidth, 2), 100 - leftPercent);

  return {
    leftPercent,
    widthPercent,
  };
};

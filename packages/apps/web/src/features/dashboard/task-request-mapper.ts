import { Subtask, Task, UpsertSubtaskRequest } from '../../shared/api/types';

export const toUpsertSubtaskRequest = (subtask: Subtask): UpsertSubtaskRequest => ({
  id: subtask.id,
  title: subtask.title,
  completed: subtask.completed,
  startDate: subtask.startDate,
  endDate: subtask.endDate ?? undefined,
  assigneeId: subtask.assignee?.id,
});

export const toUpsertSubtaskRequests = (task: Task): UpsertSubtaskRequest[] =>
  task.subtasks.map((subtask) => toUpsertSubtaskRequest(subtask));

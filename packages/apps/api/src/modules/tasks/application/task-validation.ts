import { BadRequestException } from '@nestjs/common';

import { ApiErrorCode } from '../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../shared/errors/api-error.helpers';
import { UpsertSubtaskInput } from '../domain/task.model';

export const ensureDateRange = (
  startDate: Date,
  endDate: Date | null | undefined,
  label: string,
): void => {
  if (!endDate) {
    return;
  }

  if (endDate < startDate) {
    throw new BadRequestException(
      createApiErrorPayload(
        ApiErrorCode.TASK_DATE_RANGE_INVALID,
        `${label} must not be before startDate.`,
        {
          field: label,
        },
      ),
    );
  }
};

export const ensureSubtasksValid = (subtasks: UpsertSubtaskInput[] | undefined): void => {
  if (!subtasks) {
    return;
  }

  subtasks.forEach((subtask, index) => {
    if (subtask.endDate && subtask.endDate < subtask.startDate) {
      throw new BadRequestException(
        createApiErrorPayload(
          ApiErrorCode.TASK_SUBTASK_DATE_RANGE_INVALID,
          `subtasks[${index}].endDate must not be before startDate.`,
          { subtaskIndex: index },
        ),
      );
    }
  });
};

export const collectAssigneeIds = (subtasks: UpsertSubtaskInput[] | undefined): number[] => {
  if (!subtasks) {
    return [];
  }

  const idSet = new Set<number>();
  subtasks.forEach((subtask) => {
    if (subtask.assigneeId !== undefined && subtask.assigneeId !== null) {
      idSet.add(subtask.assigneeId);
    }
  });

  return [...idSet];
};

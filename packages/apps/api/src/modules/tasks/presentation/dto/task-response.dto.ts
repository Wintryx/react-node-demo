import { ApiProperty } from '@nestjs/swagger';

import { TaskPriority, TaskStatus } from '../../domain/task.enums';

export class SubtaskAssigneeResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the assignee employee.',
    example: 123,
  })
  id!: number;

  @ApiProperty({
    description: 'Display name of the assignee employee.',
    example: 'Arne Winter',
  })
  name!: string;
}

export class SubtaskResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the subtask.',
    example: 10,
  })
  id!: number;

  @ApiProperty({
    description: 'Short subtask title.',
    example: 'Prepare API contract',
  })
  title!: string;

  @ApiProperty({
    description: 'Completion flag of the subtask.',
    example: false,
  })
  completed!: boolean;

  @ApiProperty({
    description: 'ISO-8601 start date of the subtask.',
    format: 'date-time',
    example: '2026-03-16T08:00:00.000Z',
  })
  startDate!: string;

  @ApiProperty({
    description: 'ISO-8601 end date of the subtask or null if open-ended.',
    format: 'date-time',
    nullable: true,
    example: '2026-03-17T18:00:00.000Z',
  })
  endDate!: string | null;

  @ApiProperty({
    description: 'Assigned employee for the subtask or null.',
    type: SubtaskAssigneeResponseDto,
    nullable: true,
  })
  assignee!: SubtaskAssigneeResponseDto | null;
}

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the task.',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Short task title.',
    example: 'Build employee board',
  })
  title!: string;

  @ApiProperty({
    description: 'Detailed task description, null when not provided.',
    nullable: true,
    example: 'Implement all requested task management flows.',
  })
  description!: string | null;

  @ApiProperty({
    description: 'Current status of the task.',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'Priority level of the task.',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @ApiProperty({
    description: 'ISO-8601 start date of the task.',
    format: 'date-time',
    example: '2026-03-16T08:00:00.000Z',
  })
  startDate!: string;

  @ApiProperty({
    description: 'ISO-8601 due date of the task or null.',
    format: 'date-time',
    nullable: true,
    example: '2026-03-25T17:00:00.000Z',
  })
  dueDate!: string | null;

  @ApiProperty({
    description: 'ISO-8601 timestamp when the task was created.',
    format: 'date-time',
    example: '2026-03-16T10:20:30.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Identifier of the employee owning the task.',
    example: 1,
  })
  employeeId!: number;

  @ApiProperty({
    description: 'List of subtasks belonging to this task.',
    type: [SubtaskResponseDto],
  })
  subtasks!: SubtaskResponseDto[];
}

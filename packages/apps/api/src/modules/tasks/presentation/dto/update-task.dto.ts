import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { UpsertSubtaskDto } from './upsert-subtask.dto';
import { TaskPriority, TaskStatus } from '../../domain/task.enums';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Updated task title.',
    example: 'Build employee board',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated task description.',
    example: 'Implement all requested task management flows.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated task status.',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Updated task priority.',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Updated ISO-8601 start date.',
    example: '2026-03-16T08:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Updated ISO-8601 due date. Set to null to clear an existing due date.',
    example: '2026-03-25T17:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Updated employee id that owns the task.',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  employeeId?: number;

  @ApiPropertyOptional({
    description:
      'Full subtask list replacement. Existing subtasks omitted from this array will be removed.',
    type: [UpsertSubtaskDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSubtaskDto)
  subtasks?: UpsertSubtaskDto[];
}

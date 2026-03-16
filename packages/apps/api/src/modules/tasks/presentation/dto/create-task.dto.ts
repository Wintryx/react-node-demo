import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateTaskDto {
  @ApiProperty({
    description: 'Short task title.',
    example: 'Build employee board',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed task description.',
    example: 'Implement all requested task management flows.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status. Defaults to "todo" when omitted.',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority. Defaults to "medium" when omitted.',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'ISO-8601 start date of the task.',
    example: '2026-03-16T08:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'ISO-8601 due date of the task.',
    example: '2026-03-25T17:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Employee id that owns the task.',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  employeeId!: number;

  @ApiPropertyOptional({
    description: 'Optional list of subtasks to create with this task.',
    type: [UpsertSubtaskDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSubtaskDto)
  subtasks?: UpsertSubtaskDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertSubtaskDto {
  @ApiPropertyOptional({
    description: 'Existing subtask id for updates. Omit to create a new subtask.',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty({
    description: 'Short subtask title.',
    example: 'Prepare API contract',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Completion flag. Defaults to false when omitted for new subtasks.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({
    description: 'ISO-8601 start date of the subtask.',
    example: '2026-03-16T08:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'ISO-8601 end date of the subtask.',
    example: '2026-03-17T18:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Employee id assigned to this subtask.',
    example: 123,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  assigneeId?: number;
}

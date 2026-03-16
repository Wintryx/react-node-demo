import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Current service health status.',
    example: 'ok',
    enum: ['ok'],
  })
  status!: 'ok';

  @ApiProperty({
    description: 'ISO-8601 timestamp when the health response was generated.',
    example: '2026-03-16T10:20:30.000Z',
    format: 'date-time',
  })
  timestamp!: string;
}

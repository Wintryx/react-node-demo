import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseUserDto {
  @ApiProperty({
    description: 'Unique identifier of the authenticated user.',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Email address of the authenticated user.',
    example: 'candidate@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'ISO-8601 timestamp when the user account was created.',
    example: '2026-03-16T10:20:30.000Z',
    format: 'date-time',
  })
  createdAt!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token used in the Authorization header.',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token type for Authorization header usage.',
    example: 'Bearer',
  })
  tokenType!: 'Bearer';

  @ApiProperty({
    description: 'Access token validity duration.',
    example: '15m',
  })
  expiresIn!: string;

  @ApiProperty({
    description: 'Authenticated user information.',
    type: AuthResponseUserDto,
  })
  user!: AuthResponseUserDto;
}

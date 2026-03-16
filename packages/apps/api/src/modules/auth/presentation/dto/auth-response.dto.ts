import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseUserDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    example: '2026-03-16T10:20:30.000Z',
  })
  createdAt!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({
    example: 'Bearer',
  })
  tokenType!: 'Bearer';

  @ApiProperty({
    example: '15m',
  })
  expiresIn!: string;

  @ApiProperty({
    type: AuthResponseUserDto,
  })
  user!: AuthResponseUserDto;
}

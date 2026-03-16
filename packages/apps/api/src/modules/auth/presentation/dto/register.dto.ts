import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'candidate@example.com',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword!1',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message:
      'password must contain at least one lowercase letter, one uppercase letter, one number and one special character.',
  })
  password!: string;
}

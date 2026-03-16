import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { EmployeeDepartment, EmployeeRole } from '../../domain/employee.enums';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Arne' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName!: string;

  @ApiProperty({ example: 'Winter' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName!: string;

  @ApiProperty({ example: 'arne.winter@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ enum: EmployeeRole, example: EmployeeRole.DEVELOPER })
  @IsEnum(EmployeeRole)
  role!: EmployeeRole;

  @ApiProperty({ enum: EmployeeDepartment, example: EmployeeDepartment.ENGINEERING })
  @IsEnum(EmployeeDepartment)
  department!: EmployeeDepartment;
}

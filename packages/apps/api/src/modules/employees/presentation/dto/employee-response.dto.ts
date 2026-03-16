import { ApiProperty } from '@nestjs/swagger';

import { EmployeeDepartment, EmployeeRole } from '../../domain/employee.enums';

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the employee.',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'First name of the employee.',
    example: 'Arne',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the employee.',
    example: 'Winter',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Unique company email address of the employee.',
    example: 'arne.winter@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Role of the employee within the organization.',
    enum: EmployeeRole,
    example: EmployeeRole.DEVELOPER,
  })
  role!: EmployeeRole;

  @ApiProperty({
    description: 'Department the employee belongs to.',
    enum: EmployeeDepartment,
    example: EmployeeDepartment.ENGINEERING,
  })
  department!: EmployeeDepartment;

  @ApiProperty({
    description: 'ISO-8601 timestamp when the employee was created.',
    format: 'date-time',
    example: '2026-03-16T10:20:30.000Z',
  })
  createdAt!: string;
}

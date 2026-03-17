import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateEmployeeUseCase } from '../application/create-employee.use-case';
import { DeleteEmployeeUseCase } from '../application/delete-employee.use-case';
import { ListEmployeesUseCase } from '../application/list-employees.use-case';
import { UpdateEmployeeUseCase } from '../application/update-employee.use-case';
import { Employee } from '../domain/employee.model';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DEMO_AUTH_SCOPE_NOTE } from '../../../shared/docs/swagger-notes';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly listEmployeesUseCase: ListEmployeesUseCase,
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly deleteEmployeeUseCase: DeleteEmployeeUseCase,
  ) {}

  @ApiOperation({
    summary: 'List employees',
    description: `Returns all employees sorted by creation order. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiOkResponse({
    description: 'Employees returned successfully.',
    type: EmployeeResponseDto,
    isArray: true,
  })
  @Get()
  listEmployees(): Promise<Employee[]> {
    return this.listEmployeesUseCase.execute();
  }

  @ApiOperation({
    summary: 'Create employee',
    description: `Creates a new employee with a unique email address. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiBody({
    description: 'Employee creation payload.',
    type: CreateEmployeeDto,
    required: true,
    examples: {
      default: {
        summary: 'Valid employee payload',
        value: {
          firstName: 'Arne',
          lastName: 'Winter',
          email: 'arne.winter@example.com',
          role: 'developer',
          department: 'engineering',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Employee created successfully.',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed for the request body.' })
  @ApiConflictResponse({ description: 'An employee with the given email already exists.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Post()
  createEmployee(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    return this.createEmployeeUseCase.execute(dto);
  }

  @ApiOperation({
    summary: 'Update employee',
    description: `Updates one or more fields of an existing employee. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiBody({
    description: 'Employee update payload (partial update supported).',
    type: UpdateEmployeeDto,
    required: true,
    examples: {
      default: {
        summary: 'Partial employee update',
        value: {
          firstName: 'Arne',
          role: 'team-lead',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Employee id.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Employee updated successfully.',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid employee id or invalid request body.' })
  @ApiConflictResponse({ description: 'An employee with the given email already exists.' })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Patch(':id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.updateEmployeeUseCase.execute(id, dto);
  }

  @ApiOperation({
    summary: 'Delete employee',
    description: `Deletes an employee if no tasks are currently assigned. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Employee id.',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Deletes an employee.' })
  @ApiBadRequestResponse({ description: 'Invalid employee id.' })
  @ApiConflictResponse({
    description: 'Employee has assigned tasks and cannot be deleted.',
  })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteEmployeeUseCase.execute(id);
  }
}

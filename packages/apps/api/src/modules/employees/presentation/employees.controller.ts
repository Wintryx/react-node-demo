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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateEmployeeUseCase } from '../application/create-employee.use-case';
import { DeleteEmployeeUseCase } from '../application/delete-employee.use-case';
import { ListEmployeesUseCase } from '../application/list-employees.use-case';
import { UpdateEmployeeUseCase } from '../application/update-employee.use-case';
import { Employee } from '../domain/employee.model';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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

  @ApiOkResponse({ description: 'Returns all employees.' })
  @Get()
  listEmployees(): Promise<Employee[]> {
    return this.listEmployeesUseCase.execute();
  }

  @ApiCreatedResponse({ description: 'Creates a new employee.' })
  @Post()
  createEmployee(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    return this.createEmployeeUseCase.execute(dto);
  }

  @ApiOkResponse({ description: 'Updates an existing employee.' })
  @Patch(':id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.updateEmployeeUseCase.execute(id, dto);
  }

  @ApiNoContentResponse({ description: 'Deletes an employee.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteEmployeeUseCase.execute(id);
  }
}

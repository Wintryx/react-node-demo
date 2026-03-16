import {
  BadRequestException,
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
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateTaskUseCase } from '../application/create-task.use-case';
import { DeleteTaskUseCase } from '../application/delete-task.use-case';
import { ListTasksUseCase } from '../application/list-tasks.use-case';
import { UpdateTaskUseCase } from '../application/update-task.use-case';
import { Task } from '../domain/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { toCreateTaskInput, toUpdateTaskInput } from './task-input.mapper';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @ApiOkResponse({ description: 'Returns tasks. Optionally filtered by employeeId.' })
  @Get()
  listTasks(@Query('employeeId') employeeId?: string): Promise<Task[]> {
    const parsedEmployeeId = this.parseEmployeeId(employeeId);
    return this.listTasksUseCase.execute(parsedEmployeeId);
  }

  @ApiCreatedResponse({ description: 'Creates a new task with optional subtasks.' })
  @Post()
  createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.createTaskUseCase.execute(toCreateTaskInput(dto));
  }

  @ApiOkResponse({ description: 'Updates a task and its subtasks.' })
  @Patch(':id')
  updateTask(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.updateTaskUseCase.execute(id, toUpdateTaskInput(dto));
  }

  @ApiNoContentResponse({ description: 'Deletes a task (subtasks are deleted as well).' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteTaskUseCase.execute(id);
  }

  private parseEmployeeId(employeeId?: string): number | undefined {
    if (employeeId === undefined || employeeId.trim() === '') {
      return undefined;
    }

    const numericId = Number(employeeId);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('Query parameter "employeeId" must be a positive integer.');
    }

    return numericId;
  }
}

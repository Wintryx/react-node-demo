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
import {
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto';
import { toCreateTaskInput, toUpdateTaskInput } from './task-input.mapper';
import { DEMO_AUTH_SCOPE_NOTE } from '../../../shared/docs/swagger-notes';
import { ApiErrorCode, createApiErrorPayload } from '../../../shared/errors';
import { CreateTaskUseCase } from '../application/create-task.use-case';
import { DeleteTaskUseCase } from '../application/delete-task.use-case';
import { ListTasksUseCase } from '../application/list-tasks.use-case';
import { UpdateTaskUseCase } from '../application/update-task.use-case';
import { Task } from '../domain/task.model';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @ApiOperation({
    summary: 'List tasks',
    description: `Returns all tasks or filters tasks by employee id. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: Number,
    description: 'Optional employee id to filter tasks.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tasks returned successfully.',
    type: TaskResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameter "employeeId".' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Get()
  listTasks(@Query('employeeId') employeeId?: string): Promise<Task[]> {
    const parsedEmployeeId = this.parseEmployeeId(employeeId);
    return this.listTasksUseCase.execute(parsedEmployeeId);
  }

  @ApiOperation({
    summary: 'Create task',
    description: `Creates a task for an employee, including optional subtasks and subtask assignees. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiBody({
    description: 'Task creation payload.',
    type: CreateTaskDto,
    required: true,
    examples: {
      default: {
        summary: 'Task with subtasks',
        value: {
          title: 'Build employee board',
          description: 'Implement all requested task management flows.',
          status: 'todo',
          priority: 'medium',
          startDate: '2026-03-16T08:00:00.000Z',
          dueDate: '2026-03-25T17:00:00.000Z',
          employeeId: 1,
          subtasks: [
            {
              title: 'Prepare API contract',
              completed: false,
              startDate: '2026-03-16T08:00:00.000Z',
              endDate: '2026-03-17T18:00:00.000Z',
              assigneeId: 1,
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Task created successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid task date ranges.' })
  @ApiNotFoundResponse({
    description: 'Referenced employee or one or more subtask assignees were not found.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Post()
  createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.createTaskUseCase.execute(toCreateTaskInput(dto));
  }

  @ApiOperation({
    summary: 'Update task',
    description: `Updates task fields and replaces the full subtask list when provided. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiBody({
    description: 'Task update payload (partial update supported).',
    type: UpdateTaskDto,
    required: true,
    examples: {
      default: {
        summary: 'Partial task update',
        value: {
          status: 'in-progress',
          priority: 'high',
          dueDate: '2026-03-27T17:00:00.000Z',
          subtasks: [
            {
              id: 10,
              title: 'Prepare API contract',
              completed: true,
              startDate: '2026-03-16T08:00:00.000Z',
              endDate: '2026-03-17T18:00:00.000Z',
              assigneeId: 1,
            },
          ],
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Task id.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Task updated successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid task id, validation failed, or invalid subtask ownership/date range.',
  })
  @ApiNotFoundResponse({
    description: 'Task, referenced employee, or one or more subtask assignees were not found.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @Patch(':id')
  updateTask(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.updateTaskUseCase.execute(id, toUpdateTaskInput(dto));
  }

  @ApiOperation({
    summary: 'Delete task',
    description: `Deletes a task and all of its subtasks. ${DEMO_AUTH_SCOPE_NOTE}`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Task id.',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Deletes a task (subtasks are deleted as well).' })
  @ApiBadRequestResponse({ description: 'Invalid task id.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
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
      throw new BadRequestException(
        createApiErrorPayload(
          ApiErrorCode.TASK_EMPLOYEE_ID_QUERY_INVALID,
          'Query parameter "employeeId" must be a positive integer.',
          { employeeId },
        ),
      );
    }

    return numericId;
  }
}

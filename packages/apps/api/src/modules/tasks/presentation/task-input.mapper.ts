import { CreateTaskDto, UpdateTaskDto } from './dto';
import { CreateTaskInput, UpdateTaskInput, UpsertSubtaskInput } from '../domain/task.model';

const mapSubtasks = (
  subtasks: { id?: number; title: string; completed?: boolean; startDate: string; endDate?: string; assigneeId?: number }[] | undefined,
): UpsertSubtaskInput[] | undefined =>
  subtasks?.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    startDate: new Date(subtask.startDate),
    endDate: subtask.endDate ? new Date(subtask.endDate) : null,
    assigneeId: subtask.assigneeId ?? null,
  }));

export const toCreateTaskInput = (dto: CreateTaskDto): CreateTaskInput => ({
  title: dto.title,
  description: dto.description,
  status: dto.status,
  priority: dto.priority,
  startDate: new Date(dto.startDate),
  dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
  employeeId: dto.employeeId,
  subtasks: mapSubtasks(dto.subtasks),
});

export const toUpdateTaskInput = (dto: UpdateTaskDto): UpdateTaskInput => ({
  title: dto.title,
  description: dto.description,
  status: dto.status,
  priority: dto.priority,
  startDate: dto.startDate ? new Date(dto.startDate) : undefined,
  dueDate: Object.prototype.hasOwnProperty.call(dto, 'dueDate')
    ? dto.dueDate === null
      ? null
      : dto.dueDate === undefined
        ? undefined
        : new Date(dto.dueDate)
    : undefined,
  employeeId: dto.employeeId,
  subtasks: mapSubtasks(dto.subtasks),
});

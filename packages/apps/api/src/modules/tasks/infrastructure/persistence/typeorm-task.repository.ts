import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { SubtaskOrmEntity } from './subtask.orm-entity';
import { TaskOrmEntity } from './task.orm-entity';
import { EmployeeOrmEntity } from '../../../employees/infrastructure/persistence/employee.orm-entity';
import { CreateTaskInput, Subtask, Task, UpdateTaskInput, UpsertSubtaskInput } from '../../domain/task.model';
import { TaskRepository } from '../../domain/task.repository';

@Injectable()
export class TypeOrmTaskRepository implements TaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly taskRepository: Repository<TaskOrmEntity>,
    @InjectRepository(EmployeeOrmEntity)
    private readonly employeeRepository: Repository<EmployeeOrmEntity>,
  ) {}

  async findAll(employeeId?: number): Promise<Task[]> {
    const entities = await this.taskRepository.find({
      where: employeeId !== undefined ? { employeeId } : undefined,
      order: {
        dueDate: 'ASC',
        createdAt: 'DESC',
      },
      relations: {
        subtasks: {
          assignee: true,
        },
      },
    });

    return entities.map((entity) => this.toDomainModel(entity));
  }

  async findById(id: number): Promise<Task | null> {
    const entity = await this.taskRepository.findOne({
      where: {
        id,
      },
      relations: {
        subtasks: {
          assignee: true,
        },
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const entity = this.taskRepository.create({
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      startDate: input.startDate,
      dueDate: input.dueDate ?? null,
      employeeId: input.employeeId,
      employee: { id: input.employeeId } as EmployeeOrmEntity,
      subtasks: (input.subtasks ?? []).map((subtask) => this.toSubtaskEntity(subtask)),
    });

    const savedEntity = await this.taskRepository.save(entity);
    const fullEntity = await this.taskRepository.findOne({
      where: {
        id: savedEntity.id,
      },
      relations: {
        subtasks: {
          assignee: true,
        },
      },
    });

    if (!fullEntity) {
      throw new Error('Failed to load created task.');
    }

    return this.toDomainModel(fullEntity);
  }

  async update(id: number, patch: UpdateTaskInput): Promise<Task | null> {
    const entity = await this.taskRepository.findOne({
      where: {
        id,
      },
      relations: {
        subtasks: true,
      },
    });

    if (!entity) {
      return null;
    }

    if (patch.title !== undefined) {
      entity.title = patch.title;
    }
    if (patch.description !== undefined) {
      entity.description = patch.description;
    }
    if (patch.status !== undefined) {
      entity.status = patch.status;
    }
    if (patch.priority !== undefined) {
      entity.priority = patch.priority;
    }
    if (patch.startDate !== undefined) {
      entity.startDate = patch.startDate;
    }
    if (patch.dueDate !== undefined) {
      entity.dueDate = patch.dueDate;
    }
    if (patch.employeeId !== undefined) {
      entity.employeeId = patch.employeeId;
      entity.employee = { id: patch.employeeId } as EmployeeOrmEntity;
    }
    if (patch.subtasks !== undefined) {
      entity.subtasks = patch.subtasks.map((subtask) => this.toSubtaskEntity(subtask));
    }

    await this.taskRepository.save(entity);
    const fullEntity = await this.taskRepository.findOne({
      where: {
        id: entity.id,
      },
      relations: {
        subtasks: {
          assignee: true,
        },
      },
    });

    if (!fullEntity) {
      return null;
    }

    return this.toDomainModel(fullEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async employeeExists(id: number): Promise<boolean> {
    return this.employeeRepository.existsBy({ id });
  }

  async employeesExist(ids: number[]): Promise<boolean> {
    if (ids.length === 0) {
      return true;
    }

    const count = await this.employeeRepository.count({
      where: {
        id: In(ids),
      },
    });
    return count === ids.length;
  }

  private toSubtaskEntity(subtask: UpsertSubtaskInput): SubtaskOrmEntity {
    const subtaskEntity = new SubtaskOrmEntity();
    if (subtask.id !== undefined) {
      subtaskEntity.id = subtask.id;
    }

    subtaskEntity.title = subtask.title;
    subtaskEntity.completed = subtask.completed ?? false;
    subtaskEntity.startDate = subtask.startDate;
    subtaskEntity.endDate = subtask.endDate ?? null;
    subtaskEntity.assigneeId = subtask.assigneeId ?? null;
    subtaskEntity.assignee =
      subtask.assigneeId !== undefined && subtask.assigneeId !== null
        ? ({ id: subtask.assigneeId } as EmployeeOrmEntity)
        : null;
    return subtaskEntity;
  }

  private toDomainModel(entity: TaskOrmEntity): Task {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      startDate: entity.startDate,
      dueDate: entity.dueDate,
      createdAt: entity.createdAt,
      employeeId: entity.employeeId,
      subtasks: entity.subtasks.map((subtask) => this.toSubtaskModel(subtask)),
    };
  }

  private toSubtaskModel(subtask: SubtaskOrmEntity): Subtask {
    const assignee = subtask.assignee
      ? {
          id: subtask.assignee.id,
          name: `${subtask.assignee.firstName} ${subtask.assignee.lastName}`.trim(),
        }
      : null;

    return {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      startDate: subtask.startDate,
      endDate: subtask.endDate,
      assignee,
    };
  }
}

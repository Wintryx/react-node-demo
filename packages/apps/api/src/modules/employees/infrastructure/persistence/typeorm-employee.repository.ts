import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeOrmEntity } from './employee.orm-entity';
import { CreateEmployeeInput, Employee, UpdateEmployeeInput } from '../../domain/employee.model';
import { EmployeeRepository } from '../../domain/employee.repository';

@Injectable()
export class TypeOrmEmployeeRepository implements EmployeeRepository {
  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly repository: Repository<EmployeeOrmEntity>,
  ) {}

  async findAll(): Promise<Employee[]> {
    const entities = await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map(this.toDomainModel);
  }

  async findById(id: number): Promise<Employee | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const entity = await this.repository.findOne({
      where: {
        email,
      },
    });

    return entity ? this.toDomainModel(entity) : null;
  }

  async hasAssignedTasks(employeeId: number): Promise<boolean> {
    const tasksTableResult = (await this.repository.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
      ['tasks'],
    )) as Array<{ name: string }>;

    if (tasksTableResult.length === 0) {
      return false;
    }

    const countResult = (await this.repository.query(
      'SELECT COUNT(1) as count FROM tasks WHERE employeeId = ?',
      [employeeId],
    )) as Array<{ count: number | string }>;

    const rawCount = countResult[0]?.count;
    const count = typeof rawCount === 'string' ? Number(rawCount) : rawCount ?? 0;
    return count > 0;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const entity = this.repository.create(input);
    const savedEntity = await this.repository.save(entity);
    return this.toDomainModel(savedEntity);
  }

  async update(id: number, patch: UpdateEmployeeInput): Promise<Employee | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    this.repository.merge(entity, patch);
    const savedEntity = await this.repository.save(entity);
    return this.toDomainModel(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toDomainModel(entity: EmployeeOrmEntity): Employee {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      role: entity.role,
      department: entity.department,
      createdAt: entity.createdAt,
    };
  }
}

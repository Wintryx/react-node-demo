import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SubtaskOrmEntity } from './subtask.orm-entity';
import { EmployeeOrmEntity } from '../../../employees/infrastructure/persistence/employee.orm-entity';
import { TaskPriority, TaskStatus } from '../../domain/task.enums';

@Entity({ name: 'tasks' })
export class TaskOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
  })
  status!: TaskStatus;

  @Column({
    type: 'simple-enum',
    enum: TaskPriority,
  })
  priority!: TaskPriority;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime', nullable: true })
  dueDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  employeeId!: number;

  @ManyToOne(() => EmployeeOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employeeId' })
  employee!: EmployeeOrmEntity;

  @OneToMany(() => SubtaskOrmEntity, (subtask) => subtask.task, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  subtasks!: SubtaskOrmEntity[];
}

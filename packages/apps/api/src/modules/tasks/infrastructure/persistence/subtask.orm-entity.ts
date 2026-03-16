import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TaskOrmEntity } from './task.orm-entity';
import { EmployeeOrmEntity } from '../../../employees/infrastructure/persistence/employee.orm-entity';

@Entity({ name: 'subtasks' })
export class SubtaskOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate!: Date | null;

  @Column()
  taskId!: number;

  @ManyToOne(() => TaskOrmEntity, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: TaskOrmEntity;

  @Column({ nullable: true })
  assigneeId!: number | null;

  @ManyToOne(() => EmployeeOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee!: EmployeeOrmEntity | null;
}

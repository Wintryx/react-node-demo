import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeDepartment, EmployeeRole } from '../../domain/employee.enums';

@Entity({ name: 'employees' })
export class EmployeeOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  firstName!: string;

  @Column({ length: 120 })
  lastName!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({
    type: 'simple-enum',
    enum: EmployeeRole,
  })
  role!: EmployeeRole;

  @Column({
    type: 'simple-enum',
    enum: EmployeeDepartment,
  })
  department!: EmployeeDepartment;

  @CreateDateColumn()
  createdAt!: Date;
}

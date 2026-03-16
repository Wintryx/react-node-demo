import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateEmployeeUseCase } from './application/create-employee.use-case';
import { DeleteEmployeeUseCase } from './application/delete-employee.use-case';
import { ListEmployeesUseCase } from './application/list-employees.use-case';
import { UpdateEmployeeUseCase } from './application/update-employee.use-case';
import { EMPLOYEE_REPOSITORY } from './domain/employee.repository';
import { EmployeeOrmEntity } from './infrastructure/persistence/employee.orm-entity';
import { TypeOrmEmployeeRepository } from './infrastructure/persistence/typeorm-employee.repository';
import { EmployeesController } from './presentation/employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeOrmEntity])],
  controllers: [EmployeesController],
  providers: [
    CreateEmployeeUseCase,
    DeleteEmployeeUseCase,
    ListEmployeesUseCase,
    UpdateEmployeeUseCase,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: TypeOrmEmployeeRepository,
    },
  ],
})
export class EmployeesModule {}

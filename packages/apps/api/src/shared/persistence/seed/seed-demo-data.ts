import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';

import { AuthUserOrmEntity } from '../../../modules/auth/infrastructure/persistence/auth-user.orm-entity';
import {
  EmployeeDepartment,
  EmployeeRole,
} from '../../../modules/employees/domain/employee.enums';
import { EmployeeOrmEntity } from '../../../modules/employees/infrastructure/persistence/employee.orm-entity';
import { TaskPriority, TaskStatus } from '../../../modules/tasks/domain/task.enums';
import { SubtaskOrmEntity, TaskOrmEntity } from '../../../modules/tasks/infrastructure/persistence';

const BCRYPT_ROUNDS = 12;

interface DemoAuthUserSeed {
  email: string;
  password: string;
}

interface DemoEmployeeSeed {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
}

interface DemoSubtaskSeed {
  title: string;
  completed: boolean;
  startDateIso: string;
  endDateIso: string | null;
  assigneeEmail: string | null;
}

interface DemoTaskSeed {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDateIso: string;
  dueDateIso: string | null;
  employeeEmail: string;
  subtasks: DemoSubtaskSeed[];
}

export interface DemoSeedResult {
  authUsersCreated: number;
  authUsersSkipped: number;
  employeesCreated: number;
  employeesSkipped: number;
  tasksCreated: number;
  tasksSkipped: number;
  subtasksCreated: number;
}

export const demoAuthUser: DemoAuthUserSeed = {
  email: 'demo.user@example.com',
  password: 'DemoPass!123',
};

const demoEmployees: DemoEmployeeSeed[] = [
  {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.com',
    role: EmployeeRole.TEAM_LEAD,
    department: EmployeeDepartment.ENGINEERING,
  },
  {
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace.hopper@example.com',
    role: EmployeeRole.DEVELOPER,
    department: EmployeeDepartment.ENGINEERING,
  },
  {
    firstName: 'Katherine',
    lastName: 'Johnson',
    email: 'katherine.johnson@example.com',
    role: EmployeeRole.PRODUCT_MANAGER,
    department: EmployeeDepartment.PRODUCT,
  },
];

const demoTasks: DemoTaskSeed[] = [
  {
    title: 'Implement refresh token rotation',
    description: 'Ship rotation and replay protection for refresh tokens.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    startDateIso: '2026-03-25T09:00:00.000Z',
    dueDateIso: '2026-04-03T17:00:00.000Z',
    employeeEmail: 'ada.lovelace@example.com',
    subtasks: [
      {
        title: 'Add rotation flow in refresh endpoint',
        completed: true,
        startDateIso: '2026-03-25T09:00:00.000Z',
        endDateIso: '2026-03-26T14:00:00.000Z',
        assigneeEmail: 'grace.hopper@example.com',
      },
      {
        title: 'Persist hashed refresh token state',
        completed: false,
        startDateIso: '2026-03-27T09:00:00.000Z',
        endDateIso: null,
        assigneeEmail: 'ada.lovelace@example.com',
      },
      {
        title: 'Extend auth E2E regression cases',
        completed: false,
        startDateIso: '2026-03-28T09:00:00.000Z',
        endDateIso: null,
        assigneeEmail: 'katherine.johnson@example.com',
      },
    ],
  },
  {
    title: 'Polish onboarding flow',
    description: 'Improve first-run UX and remove dead-end states.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    startDateIso: '2026-04-01T09:00:00.000Z',
    dueDateIso: '2026-04-10T17:00:00.000Z',
    employeeEmail: 'katherine.johnson@example.com',
    subtasks: [
      {
        title: 'Draft UX copy for empty states',
        completed: false,
        startDateIso: '2026-04-01T09:00:00.000Z',
        endDateIso: null,
        assigneeEmail: 'katherine.johnson@example.com',
      },
      {
        title: 'Validate flow with dashboard integration tests',
        completed: false,
        startDateIso: '2026-04-02T09:00:00.000Z',
        endDateIso: null,
        assigneeEmail: 'grace.hopper@example.com',
      },
    ],
  },
  {
    title: 'Stabilize CI pipeline',
    description: 'Reduce flaky tests and keep lint/test/build deterministic.',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    startDateIso: '2026-03-20T09:00:00.000Z',
    dueDateIso: '2026-03-28T17:00:00.000Z',
    employeeEmail: 'grace.hopper@example.com',
    subtasks: [
      {
        title: 'Align lint and import-order rules',
        completed: true,
        startDateIso: '2026-03-20T09:00:00.000Z',
        endDateIso: '2026-03-22T12:00:00.000Z',
        assigneeEmail: 'grace.hopper@example.com',
      },
      {
        title: 'Add auth/session regression suite',
        completed: true,
        startDateIso: '2026-03-23T09:00:00.000Z',
        endDateIso: '2026-03-28T12:00:00.000Z',
        assigneeEmail: 'ada.lovelace@example.com',
      },
    ],
  },
];

const toDate = (value: string): Date => new Date(value);

const resolveAssigneeId = (
  employeesByEmail: Map<string, EmployeeOrmEntity>,
  assigneeEmail: string | null,
): number | null => {
  if (!assigneeEmail) {
    return null;
  }

  const employee = employeesByEmail.get(assigneeEmail);
  if (!employee) {
    throw new Error(`Missing employee for subtask assignee "${assigneeEmail}".`);
  }

  return employee.id;
};

export const seedDemoData = async (
  dataSource: DataSource,
): Promise<DemoSeedResult> => {
  const authUserRepository = dataSource.getRepository(AuthUserOrmEntity);
  const employeeRepository = dataSource.getRepository(EmployeeOrmEntity);
  const taskRepository = dataSource.getRepository(TaskOrmEntity);
  const subtaskRepository = dataSource.getRepository(SubtaskOrmEntity);

  const result: DemoSeedResult = {
    authUsersCreated: 0,
    authUsersSkipped: 0,
    employeesCreated: 0,
    employeesSkipped: 0,
    tasksCreated: 0,
    tasksSkipped: 0,
    subtasksCreated: 0,
  };

  const existingAuthUser = await authUserRepository.findOneBy({
    email: demoAuthUser.email,
  });

  if (!existingAuthUser) {
    const passwordHash = await hash(demoAuthUser.password, BCRYPT_ROUNDS);
    await authUserRepository.save(
      authUserRepository.create({
        email: demoAuthUser.email,
        passwordHash,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      }),
    );
    result.authUsersCreated += 1;
  } else {
    result.authUsersSkipped += 1;
  }

  const employeesByEmail = new Map<string, EmployeeOrmEntity>();

  for (const employeeSeed of demoEmployees) {
    const existingEmployee = await employeeRepository.findOneBy({
      email: employeeSeed.email,
    });

    if (existingEmployee) {
      employeesByEmail.set(existingEmployee.email, existingEmployee);
      result.employeesSkipped += 1;
      continue;
    }

    const createdEmployee = await employeeRepository.save(
      employeeRepository.create(employeeSeed),
    );
    employeesByEmail.set(createdEmployee.email, createdEmployee);
    result.employeesCreated += 1;
  }

  for (const taskSeed of demoTasks) {
    const assignedEmployee = employeesByEmail.get(taskSeed.employeeEmail);
    if (!assignedEmployee) {
      throw new Error(`Missing employee for task "${taskSeed.title}".`);
    }

    const existingTask = await taskRepository.findOneBy({
      title: taskSeed.title,
      employeeId: assignedEmployee.id,
    });

    if (existingTask) {
      result.tasksSkipped += 1;
      continue;
    }

    const subtasks = taskSeed.subtasks.map((subtaskSeed) =>
      subtaskRepository.create({
        title: subtaskSeed.title,
        completed: subtaskSeed.completed,
        startDate: toDate(subtaskSeed.startDateIso),
        endDate: subtaskSeed.endDateIso ? toDate(subtaskSeed.endDateIso) : null,
        assigneeId: resolveAssigneeId(employeesByEmail, subtaskSeed.assigneeEmail),
      }),
    );

    await taskRepository.save(
      taskRepository.create({
        title: taskSeed.title,
        description: taskSeed.description,
        status: taskSeed.status,
        priority: taskSeed.priority,
        startDate: toDate(taskSeed.startDateIso),
        dueDate: taskSeed.dueDateIso ? toDate(taskSeed.dueDateIso) : null,
        employeeId: assignedEmployee.id,
        subtasks,
      }),
    );

    result.tasksCreated += 1;
    result.subtasksCreated += subtasks.length;
  }

  return result;
};

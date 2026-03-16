import { TaskPriority, TaskStatus } from './task.enums';

export interface SubtaskAssignee {
  id: number;
  name: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  startDate: Date;
  endDate: Date | null;
  assignee: SubtaskAssignee | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  dueDate: Date | null;
  createdAt: Date;
  employeeId: number;
  subtasks: Subtask[];
}

export interface UpsertSubtaskInput {
  id?: number;
  title: string;
  completed?: boolean;
  startDate: Date;
  endDate?: Date | null;
  assigneeId?: number | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate: Date;
  dueDate?: Date | null;
  employeeId: number;
  subtasks?: UpsertSubtaskInput[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date;
  dueDate?: Date | null;
  employeeId?: number;
  subtasks?: UpsertSubtaskInput[];
}

import { TaskPriority, TaskStatus } from '../../domain/task.enums';
import { CreateTaskInput, Task, UpdateTaskInput } from '../../domain/task.model';
import { TaskRepository } from '../../domain/task.repository';

interface InMemoryTaskRepositoryOptions {
  tasks?: Task[];
  employeeIds?: number[];
  deleteResultOverride?: boolean;
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks: Task[];
  private readonly employeeIds: Set<number>;
  private readonly deleteResultOverride?: boolean;
  private nextTaskId: number;
  private nextSubtaskId: number;

  constructor(options: InMemoryTaskRepositoryOptions = {}) {
    this.tasks = options.tasks ? [...options.tasks] : [];
    this.employeeIds = new Set(options.employeeIds ?? []);
    this.deleteResultOverride = options.deleteResultOverride;

    this.nextTaskId = this.tasks.length === 0 ? 1 : Math.max(...this.tasks.map((task) => task.id)) + 1;
    const allSubtaskIds = this.tasks.flatMap((task) => task.subtasks.map((subtask) => subtask.id));
    this.nextSubtaskId = allSubtaskIds.length === 0 ? 1 : Math.max(...allSubtaskIds) + 1;
  }

  async findAll(employeeId?: number): Promise<Task[]> {
    if (employeeId === undefined) {
      return [...this.tasks];
    }

    return this.tasks.filter((task) => task.employeeId === employeeId);
  }

  async findById(id: number): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: this.nextTaskId++,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      startDate: input.startDate,
      dueDate: input.dueDate ?? null,
      createdAt: new Date(),
      employeeId: input.employeeId,
      subtasks: (input.subtasks ?? []).map((subtask) => ({
        id: subtask.id ?? this.nextSubtaskId++,
        title: subtask.title,
        completed: subtask.completed ?? false,
        startDate: subtask.startDate,
        endDate: subtask.endDate ?? null,
        assignee: subtask.assigneeId ? { id: subtask.assigneeId, name: 'Assignee' } : null,
      })),
    };
    this.tasks.push(task);
    return task;
  }

  async update(id: number, patch: UpdateTaskInput): Promise<Task | null> {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      return null;
    }

    Object.assign(task, patch);
    return task;
  }

  async delete(id: number): Promise<boolean> {
    if (this.deleteResultOverride !== undefined) {
      return this.deleteResultOverride;
    }

    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);
    return true;
  }

  async employeeExists(id: number): Promise<boolean> {
    return this.employeeIds.has(id);
  }

  async employeesExist(ids: number[]): Promise<boolean> {
    return ids.every((id) => this.employeeIds.has(id));
  }
}

import { TASK_PRIORITIES, TASK_STATUSES, TaskFormState } from './task-form-state';
import { DatePickerField } from '../../../components/ui/date-picker-field';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Employee, TaskPriority, TaskStatus } from '../../../shared/api/types';
import { getEmployeeDisplayName, taskPriorityLabels, taskStatusLabels } from '../utils';

interface TaskFormCoreFieldsProps {
  formState: TaskFormState;
  employees: Employee[];
  isSubmitting: boolean;
  onChangeTitle(value: string): void;
  onChangeDescription(value: string): void;
  onChangeStatus(value: TaskStatus): void;
  onChangePriority(value: TaskPriority): void;
  onChangeEmployeeId(value: number): void;
  onChangeStartDate(value: string): void;
  onChangeDueDate(value: string | null): void;
}

export function TaskFormCoreFields({
  formState,
  employees,
  isSubmitting,
  onChangeTitle,
  onChangeDescription,
  onChangeStatus,
  onChangePriority,
  onChangeEmployeeId,
  onChangeStartDate,
  onChangeDueDate,
}: TaskFormCoreFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={formState.title}
          maxLength={200}
          disabled={isSubmitting}
          onChange={(event) => onChangeTitle(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Description</Label>
        <textarea
          id="task-description"
          value={formState.description}
          maxLength={2000}
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onChange={(event) => onChangeDescription(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select
            id="task-status"
            value={formState.status}
            disabled={isSubmitting}
            onChange={(event) => onChangeStatus(event.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((option) => (
              <option key={option} value={option}>
                {taskStatusLabels[option]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select
            id="task-priority"
            value={formState.priority}
            disabled={isSubmitting}
            onChange={(event) => onChangePriority(event.target.value as TaskPriority)}
          >
            {TASK_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {taskPriorityLabels[option]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-employee">Assignee</Label>
          <Select
            id="task-employee"
            value={formState.employeeId?.toString() ?? ''}
            disabled={isSubmitting}
            onChange={(event) => onChangeEmployeeId(Number(event.target.value))}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {getEmployeeDisplayName(employee)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Start date</Label>
          <DatePickerField
            value={formState.startDate}
            disabled={isSubmitting}
            onChange={(value) => onChangeStartDate(value ?? '')}
          />
        </div>
        <div className="space-y-2">
          <Label>Due date</Label>
          <DatePickerField
            value={formState.dueDate}
            disabled={isSubmitting}
            allowClear
            onChange={(value) => onChangeDueDate(value)}
          />
        </div>
      </div>
    </>
  );
}

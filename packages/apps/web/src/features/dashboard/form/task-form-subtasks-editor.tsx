import { EditableSubtask } from './task-form-state';
import { Button } from '../../../components/ui/button';
import { DatePickerField } from '../../../components/ui/date-picker-field';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Employee } from '../../../shared/api/types';
import { dashboardCopy } from '../dashboard-copy';
import { getEmployeeDisplayName } from '../utils';

interface TaskFormSubtasksEditorProps {
  subtasks: EditableSubtask[];
  employees: Employee[];
  isSubmitting: boolean;
  onAddSubtask(): void;
  onRemoveSubtask(index: number): void;
  onChangeSubtask(index: number, patch: Partial<EditableSubtask>): void;
}

export function TaskFormSubtasksEditor({
  subtasks,
  employees,
  isSubmitting,
  onAddSubtask,
  onRemoveSubtask,
  onChangeSubtask,
}: TaskFormSubtasksEditorProps) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{dashboardCopy.subtasks.title}</p>
        <Button type="button" size="sm" variant="secondary" disabled={isSubmitting} onClick={onAddSubtask}>
          {dashboardCopy.subtasks.addSubtask}
        </Button>
      </div>

      {subtasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dashboardCopy.subtasks.noSubtasksAdded}</p>
      ) : (
        <div className="space-y-3">
          {subtasks.map((subtask, index) => (
            <div key={subtask.id ?? `draft-${index}`} className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={subtask.title}
                  placeholder={dashboardCopy.subtasks.titlePlaceholder}
                  disabled={isSubmitting}
                  onChange={(event) => onChangeSubtask(index, { title: event.target.value })}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => onRemoveSubtask(index)}
                >
                  {dashboardCopy.subtasks.remove}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{dashboardCopy.subtasks.start}</Label>
                  <DatePickerField
                    value={subtask.startDate}
                    disabled={isSubmitting}
                    onChange={(value) => onChangeSubtask(index, { startDate: value ?? '' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dashboardCopy.subtasks.end}</Label>
                  <DatePickerField
                    value={subtask.endDate}
                    disabled={isSubmitting}
                    allowClear
                    onChange={(value) => onChangeSubtask(index, { endDate: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dashboardCopy.subtasks.assignedTo}</Label>
                  <Select
                    value={subtask.assigneeId?.toString() ?? ''}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      onChangeSubtask(index, {
                        assigneeId: event.target.value === '' ? null : Number(event.target.value),
                      })
                    }
                  >
                    <option value="">{dashboardCopy.subtasks.unassigned}</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {getEmployeeDisplayName(employee)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={subtask.completed}
                  disabled={isSubmitting}
                  onChange={(event) => onChangeSubtask(index, { completed: event.target.checked })}
                />
                {dashboardCopy.subtasks.completed}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

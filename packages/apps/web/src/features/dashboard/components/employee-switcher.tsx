import { Select } from '../../../components/ui';
import { Employee } from '../../../shared/api/types';
import { dashboardCopy } from '../dashboard-copy';
import { getEmployeeDisplayName } from '../utils';

interface EmployeeSwitcherProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onChange(employeeId: number | null): void;
}

const employeeRoleLabels: Record<Employee['role'], string> = {
  developer: 'Developer',
  'team-lead': 'Team lead',
  'engineering-manager': 'Engineering manager',
  'product-manager': 'Product manager',
  designer: 'Designer',
  'qa-engineer': 'QA engineer',
  'devops-engineer': 'DevOps engineer',
};

export function EmployeeSwitcher({
  employees,
  selectedEmployeeId,
  onChange,
}: EmployeeSwitcherProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {dashboardCopy.employees.employeeFilter}
      </p>
      <Select
        value={selectedEmployeeId?.toString() ?? ''}
        onChange={(event) =>
          onChange(event.target.value.trim() === '' ? null : Number(event.target.value))
        }
      >
        <option value="">{dashboardCopy.employees.allEmployees}</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {getEmployeeDisplayName(employee)} ({employeeRoleLabels[employee.role]})
          </option>
        ))}
      </Select>
    </div>
  );
}

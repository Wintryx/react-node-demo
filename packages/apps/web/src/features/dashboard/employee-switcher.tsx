import { getEmployeeDisplayName } from './employee-display-name';
import { Select } from '../../components/ui/select';
import { Employee } from '../../shared/api/types';

interface EmployeeSwitcherProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onChange(employeeId: number): void;
}

const employeeRoleLabels: Record<Employee['role'], string> = {
  developer: 'Entwickler/in',
  'team-lead': 'Teamleitung',
  'engineering-manager': 'Engineering-Management',
  'product-manager': 'Produktmanagement',
  designer: 'Design',
  'qa-engineer': 'QA',
  'devops-engineer': 'DevOps',
};

export function EmployeeSwitcher({
  employees,
  selectedEmployeeId,
  onChange,
}: EmployeeSwitcherProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Mitarbeitenden-Filter
      </p>
      <Select
        value={selectedEmployeeId?.toString() ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {getEmployeeDisplayName(employee)} ({employeeRoleLabels[employee.role]})
          </option>
        ))}
      </Select>
    </div>
  );
}

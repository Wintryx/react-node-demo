import { Select } from '../../components/ui/select';
import { Employee } from '../../shared/api/types';

interface EmployeeSwitcherProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onChange(employeeId: number): void;
}

export function EmployeeSwitcher({
  employees,
  selectedEmployeeId,
  onChange,
}: EmployeeSwitcherProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employee Filter</p>
      <Select
        value={selectedEmployeeId?.toString() ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.firstName} {employee.lastName} ({employee.role})
          </option>
        ))}
      </Select>
    </div>
  );
}

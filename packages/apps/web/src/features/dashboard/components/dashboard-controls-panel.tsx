import { RefreshCcw } from 'lucide-react';

import { EmployeeManagementPanel } from './employee-management-panel';
import { EmployeeSwitcher } from './employee-switcher';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../../../shared/api/types';
import { dashboardCopy } from '../dashboard-copy';

interface DashboardControlsPanelProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  employeeActionError: string | null;
  isEmployeeMutating: boolean;
  onEmployeeChange(employeeId: number | null): void;
  onClearEmployeeActionError(): void;
  onCreateEmployee(payload: CreateEmployeeRequest): Promise<Employee>;
  onUpdateEmployee(employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee>;
  onDeleteEmployee(employee: Employee): Promise<void>;
  onRefresh(): void;
}

export function DashboardControlsPanel({
  employees,
  selectedEmployeeId,
  employeeActionError,
  isEmployeeMutating,
  onEmployeeChange,
  onClearEmployeeActionError,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onRefresh,
}: DashboardControlsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dashboardCopy.employees.workspaceControls}</CardTitle>
        <CardDescription>{dashboardCopy.employees.filterDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.length > 0 ? (
          <EmployeeSwitcher
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onChange={onEmployeeChange}
          />
        ) : (
          <Alert>{dashboardCopy.employees.noEmployees}</Alert>
        )}
        <Button variant="secondary" className="w-full" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          {dashboardCopy.employees.refreshData}
        </Button>
        <EmployeeManagementPanel
          employees={employees}
          isMutating={isEmployeeMutating}
          actionError={employeeActionError}
          onClearActionError={onClearEmployeeActionError}
          onCreateEmployee={onCreateEmployee}
          onUpdateEmployee={onUpdateEmployee}
          onDeleteEmployee={onDeleteEmployee}
        />
      </CardContent>
    </Card>
  );
}

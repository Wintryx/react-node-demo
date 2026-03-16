import { RefreshCcw } from 'lucide-react';

import { EmployeeSwitcher } from './employee-switcher';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Employee } from '../../shared/api/types';

interface DashboardControlsPanelProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onEmployeeChange(employeeId: number): void;
  onRefresh(): void;
}

export function DashboardControlsPanel({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  onRefresh,
}: DashboardControlsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workspace Controls</CardTitle>
        <CardDescription>Filter the board by employee assignment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.length > 0 ? (
          <EmployeeSwitcher
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onChange={onEmployeeChange}
          />
        ) : (
          <Alert>No employees available. Please create one via API/Swagger.</Alert>
        )}
        <Button variant="secondary" className="w-full" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh data
        </Button>
      </CardContent>
    </Card>
  );
}

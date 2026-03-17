import { RefreshCcw } from 'lucide-react';

import { EmployeeSwitcher } from './employee-switcher';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Employee } from '../../shared/api/types';

interface DashboardControlsPanelProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onEmployeeChange(employeeId: number | null): void;
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
        <CardTitle className="text-base">Arbeitsbereich-Steuerung</CardTitle>
        <CardDescription>Filtere das Board nach zugewiesenen Mitarbeitenden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.length > 0 ? (
          <EmployeeSwitcher
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onChange={onEmployeeChange}
          />
        ) : (
          <Alert>Keine Mitarbeitenden verfügbar. Bitte zuerst über API/Swagger anlegen.</Alert>
        )}
        <Button variant="secondary" className="w-full" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Daten aktualisieren
        </Button>
      </CardContent>
    </Card>
  );
}

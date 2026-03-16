import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, LogOut, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import { EmployeeSwitcher } from './employee-switcher';
import { TaskList } from './task-list';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { employeesApi, tasksApi } from '../../shared/api/api-client';
import { useAuth } from '../auth/auth-context';

export function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  });

  const employees = employeesQuery.data ?? [];
  const selectedEmployeeExists = employees.some((employee) => employee.id === selectedEmployeeId);
  const effectiveSelectedEmployeeId = selectedEmployeeExists
    ? selectedEmployeeId
    : (employees[0]?.id ?? null);

  const tasksQuery = useQuery({
    queryKey: ['tasks', effectiveSelectedEmployeeId],
    queryFn: () => tasksApi.listByEmployee(effectiveSelectedEmployeeId as number),
    enabled: effectiveSelectedEmployeeId !== null,
  });

  if (employeesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (employeesQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert variant="danger">
          Failed to load employees. {(employeesQuery.error as Error).message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
        <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-bold">Task Console</p>
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{currentUser?.email}</span>
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workspace Controls</CardTitle>
                <CardDescription>Filter the board by employee assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.length > 0 ? (
                  <EmployeeSwitcher
                    employees={employees}
                    selectedEmployeeId={effectiveSelectedEmployeeId}
                    onChange={setSelectedEmployeeId}
                  />
                ) : (
                  <Alert>No employees available. Please create one via API/Swagger.</Alert>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    void employeesQuery.refetch();
                    void tasksQuery.refetch();
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh data
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Tasks</h2>
              {tasksQuery.isFetching ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  Updating...
                </span>
              ) : null}
            </div>

            {effectiveSelectedEmployeeId === null ? (
              <Card>
                <CardContent className="flex min-h-40 items-center justify-center text-muted-foreground">
                  Select an employee to load tasks.
                </CardContent>
              </Card>
            ) : tasksQuery.isLoading ? (
              <Card>
                <CardContent className="flex min-h-40 items-center justify-center">
                  <Spinner className="h-6 w-6 text-primary" />
                </CardContent>
              </Card>
            ) : tasksQuery.isError ? (
              <Alert variant="danger">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {(tasksQuery.error as Error).message}
                </span>
              </Alert>
            ) : (
              <TaskList tasks={tasksQuery.data ?? []} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

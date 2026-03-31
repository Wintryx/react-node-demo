import { FormEvent, useState } from 'react';

import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeDepartment,
  EmployeeRole,
  UpdateEmployeeRequest,
} from '../../../shared/api/types';
import { dashboardCopy } from '../dashboard-copy';
import { getEmployeeDisplayName } from '../utils';

interface EmployeeManagementPanelProps {
  employees: Employee[];
  isMutating: boolean;
  actionError: string | null;
  onClearActionError(): void;
  onCreateEmployee(payload: CreateEmployeeRequest): Promise<Employee>;
  onUpdateEmployee(employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee>;
  onDeleteEmployee(employee: Employee): Promise<void>;
}

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
}

const DEFAULT_FORM_STATE: EmployeeFormState = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'developer',
  department: 'engineering',
};

const employeeRoleOptions: Array<{ value: EmployeeRole; label: string }> = [
  { value: 'developer', label: 'Developer' },
  { value: 'team-lead', label: 'Team lead' },
  { value: 'engineering-manager', label: 'Engineering manager' },
  { value: 'product-manager', label: 'Product manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa-engineer', label: 'QA engineer' },
  { value: 'devops-engineer', label: 'DevOps engineer' },
];

const employeeDepartmentOptions: Array<{ value: EmployeeDepartment; label: string }> = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'qa', label: 'QA' },
  { value: 'operations', label: 'Operations' },
  { value: 'people', label: 'People' },
];

const toFormState = (employee: Employee): EmployeeFormState => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  role: employee.role,
  department: employee.department,
});

const validateFormState = (formState: EmployeeFormState): string | null => {
  if (!formState.firstName.trim()) {
    return dashboardCopy.employees.validations.firstNameRequired;
  }
  if (!formState.lastName.trim()) {
    return dashboardCopy.employees.validations.lastNameRequired;
  }
  if (!formState.email.trim()) {
    return dashboardCopy.employees.validations.emailRequired;
  }

  return null;
};

export function EmployeeManagementPanel({
  employees,
  isMutating,
  actionError,
  onClearActionError,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeManagementPanelProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formState, setFormState] = useState<EmployeeFormState>(DEFAULT_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isFormOpen = isCreateMode || editingEmployee !== null;

  const resetForm = (): void => {
    setIsCreateMode(false);
    setEditingEmployee(null);
    setFormState(DEFAULT_FORM_STATE);
    setValidationError(null);
  };

  const handleOpenCreate = (): void => {
    onClearActionError();
    setValidationError(null);
    setEditingEmployee(null);
    setFormState(DEFAULT_FORM_STATE);
    setIsCreateMode(true);
  };

  const handleOpenEdit = (employee: Employee): void => {
    onClearActionError();
    setValidationError(null);
    setIsCreateMode(false);
    setEditingEmployee(employee);
    setFormState(toFormState(employee));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setValidationError(null);

    const validationMessage = validateFormState(formState);
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    const payload: CreateEmployeeRequest = {
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      email: formState.email.trim(),
      role: formState.role,
      department: formState.department,
    };

    try {
      if (isCreateMode) {
        await onCreateEmployee(payload);
      } else if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, payload);
      }

      resetForm();
    } catch {
      // Error state is handled by the caller hook.
    }
  };

  const formError = validationError ?? actionError;

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {dashboardCopy.employees.managementTitle}
        </p>
        {!isFormOpen ? (
          <Button type="button" size="sm" onClick={handleOpenCreate} disabled={isMutating}>
            {dashboardCopy.employees.addEmployee}
          </Button>
        ) : null}
      </div>

      {formError ? <Alert variant="danger">{formError}</Alert> : null}

      {isFormOpen ? (
        <form className="space-y-3 rounded-md border border-border p-3" onSubmit={handleSubmit}>
          <p className="text-sm font-semibold">
            {isCreateMode ? dashboardCopy.employees.createEmployee : dashboardCopy.employees.editEmployee}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="employee-first-name">{dashboardCopy.employees.firstName}</Label>
              <Input
                id="employee-first-name"
                value={formState.firstName}
                onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee-last-name">{dashboardCopy.employees.lastName}</Label>
              <Input
                id="employee-last-name"
                value={formState.lastName}
                onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="employee-email">{dashboardCopy.employees.email}</Label>
              <Input
                id="employee-email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee-role">{dashboardCopy.employees.role}</Label>
              <Select
                id="employee-role"
                value={formState.role}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, role: event.target.value as EmployeeRole }))
                }
                disabled={isMutating}
              >
                {employeeRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee-department">{dashboardCopy.employees.department}</Label>
              <Select
                id="employee-department"
                value={formState.department}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    department: event.target.value as EmployeeDepartment,
                  }))
                }
                disabled={isMutating}
              >
                {employeeDepartmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={isMutating}>
              {dashboardCopy.common.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={isMutating}>
              {isCreateMode ? dashboardCopy.employees.createEmployee : dashboardCopy.common.saveChanges}
            </Button>
          </div>
        </form>
      ) : null}

      {employees.length === 0 ? (
        <Alert>{dashboardCopy.employees.noEmployeesYet}</Alert>
      ) : (
        <ul className="space-y-2">
          {employees.map((employee) => {
            const employeeName = getEmployeeDisplayName(employee);
            return (
              <li
                key={employee.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{employeeName}</p>
                  <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(employee)}
                    disabled={isMutating}
                    aria-label={dashboardCopy.employees.editAria(employeeName)}
                  >
                    {dashboardCopy.employees.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void onDeleteEmployee(employee)}
                    disabled={isMutating}
                    aria-label={dashboardCopy.employees.removeAria(employeeName)}
                  >
                    {dashboardCopy.employees.removeEmployee}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

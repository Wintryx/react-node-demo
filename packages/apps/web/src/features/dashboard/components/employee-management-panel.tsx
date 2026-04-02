import { FormEvent } from 'react';

import { Alert, Button, Input, Label, Select } from '../../../components/ui';
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeDepartment,
  EmployeeRole,
  UpdateEmployeeRequest,
} from '../../../shared/api/types';
import { dashboardTranslations } from '../dashboard-translations';
import { getEmployeeDisplayName } from '../utils';
import {
  useEmployeeManagementForm,
  validateEmployeeFormState,
} from './use-employee-management-form';

interface EmployeeManagementPanelProps {
  employees: Employee[];
  isMutating: boolean;
  actionError: string | null;
  onClearActionError(): void;
  onCreateEmployee(payload: CreateEmployeeRequest): Promise<Employee>;
  onUpdateEmployee(employeeId: number, payload: UpdateEmployeeRequest): Promise<Employee>;
  onDeleteEmployee(employee: Employee): Promise<void>;
}

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

export function EmployeeManagementPanel({
  employees,
  isMutating,
  actionError,
  onClearActionError,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeManagementPanelProps) {
  const {
    editingEmployee,
    isCreateMode,
    isFormOpen,
    formState,
    validationError,
    setValidationError,
    setFormField,
    openCreate,
    openEdit,
    resetForm,
  } = useEmployeeManagementForm({
    onClearActionError,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setValidationError(null);

    const validationMessage = validateEmployeeFormState(formState);
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
          {dashboardTranslations.employees.managementTitle}
        </p>
        {!isFormOpen ? (
          <Button type="button" size="sm" onClick={openCreate} disabled={isMutating}>
            {dashboardTranslations.employees.addEmployee}
          </Button>
        ) : null}
      </div>

      {formError ? <Alert variant="danger">{formError}</Alert> : null}

      {isFormOpen ? (
        <form className="space-y-3 rounded-md border border-border p-3" onSubmit={handleSubmit}>
          <p className="text-sm font-semibold">
            {isCreateMode ? dashboardTranslations.employees.createEmployee : dashboardTranslations.employees.editEmployee}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="employee-first-name">{dashboardTranslations.employees.firstName}</Label>
              <Input
                id="employee-first-name"
                value={formState.firstName}
                onChange={(event) => setFormField('firstName', event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee-last-name">{dashboardTranslations.employees.lastName}</Label>
              <Input
                id="employee-last-name"
                value={formState.lastName}
                onChange={(event) => setFormField('lastName', event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="employee-email">{dashboardTranslations.employees.email}</Label>
              <Input
                id="employee-email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormField('email', event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee-role">{dashboardTranslations.employees.role}</Label>
              <Select
                id="employee-role"
                value={formState.role}
                onChange={(event) => setFormField('role', event.target.value as EmployeeRole)}
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
              <Label htmlFor="employee-department">{dashboardTranslations.employees.department}</Label>
              <Select
                id="employee-department"
                value={formState.department}
                onChange={(event) =>
                  setFormField('department', event.target.value as EmployeeDepartment)
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
              {dashboardTranslations.common.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={isMutating}>
              {isCreateMode ? dashboardTranslations.employees.createEmployee : dashboardTranslations.common.saveChanges}
            </Button>
          </div>
        </form>
      ) : null}

      {employees.length === 0 ? (
        <Alert>{dashboardTranslations.employees.noEmployeesYet}</Alert>
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
                    onClick={() => openEdit(employee)}
                    disabled={isMutating}
                    aria-label={dashboardTranslations.employees.editAria(employeeName)}
                  >
                    {dashboardTranslations.employees.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void onDeleteEmployee(employee)}
                    disabled={isMutating}
                    aria-label={dashboardTranslations.employees.removeAria(employeeName)}
                  >
                    {dashboardTranslations.employees.removeEmployee}
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

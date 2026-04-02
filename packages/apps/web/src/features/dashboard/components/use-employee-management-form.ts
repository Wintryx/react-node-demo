import { useState } from 'react';

import { Employee, EmployeeDepartment, EmployeeRole } from '../../../shared/api/types';
import { dashboardTranslations } from '../dashboard-translations';

export interface EmployeeFormState {
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

const toFormState = (employee: Employee): EmployeeFormState => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  role: employee.role,
  department: employee.department,
});

export const validateEmployeeFormState = (
  formState: EmployeeFormState,
): string | null => {
  if (!formState.firstName.trim()) {
    return dashboardTranslations.employees.validations.firstNameRequired;
  }
  if (!formState.lastName.trim()) {
    return dashboardTranslations.employees.validations.lastNameRequired;
  }
  if (!formState.email.trim()) {
    return dashboardTranslations.employees.validations.emailRequired;
  }

  return null;
};

interface UseEmployeeManagementFormOptions {
  onClearActionError(): void;
}

interface UseEmployeeManagementFormResult {
  editingEmployee: Employee | null;
  isCreateMode: boolean;
  isFormOpen: boolean;
  formState: EmployeeFormState;
  validationError: string | null;
  setValidationError(value: string | null): void;
  setFormField<K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ): void;
  openCreate(): void;
  openEdit(employee: Employee): void;
  resetForm(): void;
}

export const useEmployeeManagementForm = ({
  onClearActionError,
}: UseEmployeeManagementFormOptions): UseEmployeeManagementFormResult => {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formState, setFormState] = useState<EmployeeFormState>(DEFAULT_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = (): void => {
    setIsCreateMode(false);
    setEditingEmployee(null);
    setFormState(DEFAULT_FORM_STATE);
    setValidationError(null);
  };

  const openCreate = (): void => {
    onClearActionError();
    setValidationError(null);
    setEditingEmployee(null);
    setFormState(DEFAULT_FORM_STATE);
    setIsCreateMode(true);
  };

  const openEdit = (employee: Employee): void => {
    onClearActionError();
    setValidationError(null);
    setIsCreateMode(false);
    setEditingEmployee(employee);
    setFormState(toFormState(employee));
  };

  const setFormField = <K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ): void => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  return {
    editingEmployee,
    isCreateMode,
    isFormOpen: isCreateMode || editingEmployee !== null,
    formState,
    validationError,
    setValidationError,
    setFormField,
    openCreate,
    openEdit,
    resetForm,
  };
};

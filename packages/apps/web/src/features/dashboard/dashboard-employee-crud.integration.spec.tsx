import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { dashboardCopy } from './dashboard-copy';
import {
  clickButtonByName,
  confirmActionDialog,
  getDashboardApiMocks,
  openCreateEmployeeModal,
  renderAuthenticatedApp,
  resetDashboardApiMocks,
  setInputValueByLabel,
} from './dashboard-integration-test-utils';

describe('Dashboard employee CRUD integration', () => {
  const { createEmployeeMock, updateEmployeeMock, deleteEmployeeMock } =
    getDashboardApiMocks();

  beforeEach(() => {
    resetDashboardApiMocks();
  });

  it('creates an employee from the management panel', async () => {
    await renderAuthenticatedApp();

    await openCreateEmployeeModal();
    setInputValueByLabel(dashboardCopy.employees.firstName, 'Grace');
    setInputValueByLabel(dashboardCopy.employees.lastName, 'Hopper');
    setInputValueByLabel(dashboardCopy.employees.email, 'grace@example.com');
    await clickButtonByName(dashboardCopy.employees.createEmployee);

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledTimes(1);
    });

    expect(createEmployeeMock).toHaveBeenCalledWith({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      role: 'developer',
      department: 'engineering',
    });
  });

  it('updates an employee from the management panel', async () => {
    await renderAuthenticatedApp();

    await clickButtonByName(dashboardCopy.employees.editAria('Ada Lovelace'));
    setInputValueByLabel(dashboardCopy.employees.firstName, 'Ada-Updated');
    await clickButtonByName(dashboardCopy.common.saveChanges);

    await waitFor(() => {
      expect(updateEmployeeMock).toHaveBeenCalledTimes(1);
    });

    const [employeeId, payload] = updateEmployeeMock.mock.calls[0] as [
      number,
      {
        firstName: string;
      },
    ];

    expect(employeeId).toBe(1);
    expect(payload.firstName).toBe('Ada-Updated');
  });

  it('deletes an employee from the management panel after confirmation', async () => {
    await renderAuthenticatedApp();

    await clickButtonByName(dashboardCopy.employees.removeAria('Ada Lovelace'));
    confirmActionDialog();

    await waitFor(() => {
      expect(deleteEmployeeMock).toHaveBeenCalledWith(1);
    });
  });
});

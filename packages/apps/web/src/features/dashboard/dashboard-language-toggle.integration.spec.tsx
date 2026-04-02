import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderAuthenticatedApp, resetDashboardApiMocks } from './dashboard-integration-test-utils';

describe('Dashboard language toggle integration', () => {
  beforeEach(() => {
    resetDashboardApiMocks();
  });

  it('switches dashboard labels immediately when changing language', async () => {
    await renderAuthenticatedApp();

    expect(await screen.findByText('Task Dashboard')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'DE' }));

    expect(await screen.findByText('Aufgaben-Dashboard')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abmelden' })).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText('Task Dashboard')).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(await screen.findByText('Task Dashboard')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
  });
});

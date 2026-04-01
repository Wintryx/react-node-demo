import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { dashboardCopy } from './dashboard-copy';
import { renderAuthenticatedApp, resetDashboardApiMocks } from './dashboard-integration-test-utils';

describe('Dashboard timeline integration', () => {
  beforeEach(() => {
    resetDashboardApiMocks();
  });

  it('opens the edit modal when clicking a task in timeline view', async () => {
    await renderAuthenticatedApp();

    fireEvent.click(screen.getByRole('button', { name: dashboardCopy.tasks.timelineView }));
    fireEvent.click(await screen.findByRole('button', { name: /Initial task/i }));

    const editModalHeading = await screen.findByRole('heading', {
      name: dashboardCopy.tasks.editHeading(11),
    });

    expect(editModalHeading).toBeTruthy();
  });
});

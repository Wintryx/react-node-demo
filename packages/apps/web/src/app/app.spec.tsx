import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('redirects unauthenticated users from /app to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('renders register page on /register', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: 'Create account' })).toBeTruthy();
  });
});

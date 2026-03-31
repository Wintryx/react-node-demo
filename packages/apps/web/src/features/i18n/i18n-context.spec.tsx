import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider, useI18n } from './i18n-context';

function I18nProbe() {
  const { language, setLanguage } = useI18n();

  return (
    <div>
      <span data-testid="language">{language}</span>
      <button type="button" onClick={() => setLanguage('de')}>
        set-de
      </button>
    </div>
  );
}

describe('I18nProvider', () => {
  it('uses english as default language', () => {
    window.localStorage.clear();

    render(
      <I18nProvider>
        <I18nProbe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('persists selected language in localStorage', () => {
    window.localStorage.clear();

    render(
      <I18nProvider>
        <I18nProbe />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-de' }));

    expect(screen.getByTestId('language').textContent).toBe('de');
    expect(window.localStorage.getItem('app.language')).toBe('de');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { notifyUnauthorized, setUnauthorizedHandler } from './unauthorized-handler';

describe('unauthorized-handler', () => {
  afterEach(() => {
    setUnauthorizedHandler(null);
  });

  it('calls the registered handler on notify', () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    notifyUnauthorized();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no handler is registered', () => {
    expect(() => notifyUnauthorized()).not.toThrow();
  });
});

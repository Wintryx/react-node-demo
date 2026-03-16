import { describe, expect, it } from 'vitest';

import { formatDateOnly, parseDateOnly, toApiDateTime, toDateOnly } from './date';

describe('date helpers', () => {
  it('formats date to YYYY-MM-DD with zero padding', () => {
    const result = formatDateOnly(new Date(2026, 2, 5, 7, 15, 0, 0));
    expect(result).toBe('2026-03-05');
  });

  it('parses YYYY-MM-DD to local noon date', () => {
    const parsed = parseDateOnly('2026-11-09');

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(9);
    expect(parsed.getHours()).toBe(12);
  });

  it('maps nullable values for date-only conversion', () => {
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly('2026-03-16T12:00:00.000Z')).toBe('2026-03-16');
  });

  it('converts date-only value to stable API datetime at 12:00 UTC', () => {
    const result = toApiDateTime('2026-03-16');
    expect(result).toBe('2026-03-16T12:00:00.000Z');
  });
});

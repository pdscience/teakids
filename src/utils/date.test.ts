import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './date';

describe('getLocalDateKey', () => {
  it('uses the local calendar date instead of the UTC date', () => {
    const lateNight = new Date(2026, 0, 5, 23, 30);

    expect(getLocalDateKey(lateNight)).toBe('2026-01-05');
  });

  it('pads month and day with leading zeros', () => {
    expect(getLocalDateKey(new Date(2026, 8, 9, 12, 0))).toBe('2026-09-09');
  });
});

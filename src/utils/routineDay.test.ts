import { describe, expect, it } from 'vitest';
import { getRoutineDayState, routineStorageKey } from './routineDay';

describe('getRoutineDayState', () => {
  it('detects that the stored day is over', () => {
    const state = getRoutineDayState('2026-01-05', new Date(2026, 0, 6, 8, 0));

    expect(state.isNewDay).toBe(true);
    expect(state.dateKey).toBe('2026-01-06');
  });

  it('keeps the current day', () => {
    const state = getRoutineDayState('2026-01-05', new Date(2026, 0, 5, 23, 0));

    expect(state.isNewDay).toBe(false);
    expect(state.dateKey).toBe('2026-01-05');
  });
});

describe('routineStorageKey', () => {
  it('scopes the key by date, period and item', () => {
    expect(routineStorageKey('2026-01-05', 'morning', 2)).toBe(
      'routine_2026-01-05_morning_2'
    );
  });
});

import { describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

import { createMemoryStorage } from '../test/memoryStorage';
import { getLocalDateKey } from '../utils/date';

describe('legacy routine progress migration', () => {
  it('copies legacy keys to today and removes them', async () => {
    const store = createMemoryStorage({
      routine_morning_0: 'true',
      routine_night_2: 'true',
    });
    vi.stubGlobal('localStorage', store);

    const { initDatabase } = await import('./database');
    await initDatabase();

    const today = getLocalDateKey();
    expect(store.getItem(`routine_${today}_morning_0`)).toBe('true');
    expect(store.getItem(`routine_${today}_night_2`)).toBe('true');
    expect(store.getItem('routine_morning_0')).toBeNull();
    expect(store.getItem('routine_night_2')).toBeNull();
    expect(store.getItem('teakids_routine_daily_migrated')).toBe('1');
  });
});

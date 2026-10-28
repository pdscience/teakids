import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock('../services/database', () => ({
  getDatabaseError: vi.fn(() => null),
  dbGetSetting: vi.fn(async () => null),
  dbSetSetting: vi.fn(async () => undefined),
  dbLoadAchievements: vi.fn(async () => ({})),
  dbSaveAchievement: vi.fn(async () => undefined),
  dbLoadCustomRoutineItems: vi.fn(async () => []),
  dbSaveCustomRoutineItem: vi.fn(async () => undefined),
  dbRemoveCustomRoutineItem: vi.fn(async () => undefined),
  dbLoadCustomRoutineProgress: vi.fn(async () => false),
  dbSaveCustomRoutineProgress: vi.fn(async () => undefined),
  dbClearCustomRoutineProgressForPeriod: vi.fn(async () => undefined),
  dbLoadCustomConversation: vi.fn(async () => []),
  dbSaveCustomConversation: vi.fn(async () => undefined),
  dbDeleteCustomConversation: vi.fn(async () => undefined),
}));

import { useAppStore } from './app';
import { useSettingsStore } from './settings';

describe('app store i18n', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses the active locale for routine items', async () => {
    const store = useAppStore();
    const settings = useSettingsStore();

    expect(store.getRoutineItemsForPeriod('morning')[0].text).toBe('Acordar');

    await settings.update({ language: 'en-US' });

    expect(store.getRoutineItemsForPeriod('morning')[0].text).toBe('Wake up');
  });

  it('keeps the warning empty until a failure occurs', () => {
    const store = useAppStore();

    expect(store.systemWarningKey).toBe('');
    expect(store.systemWarning).toBe('');
  });
});

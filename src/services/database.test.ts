import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

import {
  dbClearCustomRoutineProgressForPeriod,
  dbClearRoutineProgress,
  dbDeleteCustomConversation,
  dbGetSetting,
  dbLoadAllRoutineProgress,
  dbLoadCustomConversation,
  dbLoadCustomRoutineItems,
  dbLoadCustomRoutineProgress,
  dbLoadRoutineHistory,
  dbLoadRoutineProgress,
  dbRemoveCustomRoutineItem,
  dbResetAllData,
  dbSaveCustomConversation,
  dbSaveCustomRoutineItem,
  dbSaveCustomRoutineProgress,
  dbSaveRoutineProgress,
  dbSetSetting,
  initDatabase,
} from './database';
import { getLocalDateKey } from '../utils/date';
import { createMemoryStorage } from '../test/memoryStorage';
import type {
  CustomConversationCard,
  CustomRoutineItem,
} from '../types/models';

let store: Storage;

beforeEach(async () => {
  store = createMemoryStorage();
  vi.stubGlobal('localStorage', store);
  await initDatabase();
});

describe('routine progress storage', () => {
  it('scopes progress to the selected day', async () => {
    await dbSaveRoutineProgress('2026-01-05', 'morning', 0, true);

    expect(await dbLoadRoutineProgress('2026-01-05', 'morning', 0)).toBe(true);
    expect(await dbLoadRoutineProgress('2026-01-06', 'morning', 0)).toBe(false);
  });

  it('loads all items of a routine period', async () => {
    await dbSaveRoutineProgress('2026-01-05', 'night', 0, true);
    await dbSaveRoutineProgress('2026-01-05', 'night', 2, true);

    const result = await dbLoadAllRoutineProgress('2026-01-05', 'night');

    expect(result).toHaveLength(7);
    expect(result[0]).toBe(true);
    expect(result[1]).toBe(false);
    expect(result[2]).toBe(true);
  });

  it('clears only the selected day', async () => {
    await dbSaveRoutineProgress('2026-01-05', 'morning', 0, true);
    await dbSaveRoutineProgress('2026-01-06', 'morning', 0, true);

    await dbClearRoutineProgress('2026-01-05', 'morning');

    expect(await dbLoadRoutineProgress('2026-01-05', 'morning', 0)).toBe(false);
    expect(await dbLoadRoutineProgress('2026-01-06', 'morning', 0)).toBe(true);
  });

  it('builds history entries for days without data', async () => {
    const today = getLocalDateKey();
    await dbSaveRoutineProgress(today, 'morning', 0, true);

    const history = await dbLoadRoutineHistory(2);

    expect(history).toHaveLength(6);
    expect(history.find((entry) => entry.date === today && entry.period === 'morning')).toMatchObject({
      completedCount: 1,
      totalCount: 8,
    });
    expect(
      history.filter((entry) => entry.date !== today).every((entry) => entry.completedCount === 0)
    ).toBe(true);
    expect(store.length).toBeGreaterThan(0);
  });
});

describe('custom conversation storage', () => {
  const card: CustomConversationCard = {
    id: 'custom:1',
    category: 'needs',
    icon: '🍼',
    text: 'Quero leite',
    color: '#FF9800',
    createdAt: '2026-01-05T10:00:00.000Z',
  };

  it('saves, updates and deletes cards', async () => {
    await dbSaveCustomConversation(card);
    expect(await dbLoadCustomConversation()).toEqual([card]);

    await dbSaveCustomConversation({ ...card, text: 'Quero água' });
    expect(await dbLoadCustomConversation()).toEqual([
      { ...card, text: 'Quero água' },
    ]);

    await dbDeleteCustomConversation(card.id);
    expect(await dbLoadCustomConversation()).toEqual([]);
  });

  it('resets progress, settings and custom cards', async () => {
    const today = getLocalDateKey();
    await dbSaveRoutineProgress(today, 'morning', 0, true);
    await dbSetSetting('teakids_favorites', '["needs:quero-agua"]');
    await dbSaveCustomConversation(card);

    const routineItem: CustomRoutineItem = {
      id: 'routine:reset',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: '2026-01-05T12:00:00.000Z',
      removedAt: null,
    };
    await dbSaveCustomRoutineItem(routineItem);
    await dbSaveCustomRoutineProgress(today, routineItem.id, true);

    await dbResetAllData();

    expect(await dbLoadRoutineProgress(today, 'morning', 0)).toBe(false);
    expect(await dbGetSetting('teakids_favorites')).toBeNull();
    expect(await dbLoadCustomConversation()).toEqual([]);
    expect(await dbLoadCustomRoutineItems()).toEqual([]);
    expect(
      await dbLoadCustomRoutineProgress(today, routineItem.id)
    ).toBe(false);
  });
});

describe('custom routine storage', () => {
  const item: CustomRoutineItem = {
    id: 'routine:1',
    period: 'morning',
    icon: '💊',
    text: 'Tomar remédio',
    createdAt: '2026-10-05T12:00:00.000Z',
    removedAt: null,
  };

  it('saves, lists and soft deletes custom routine items', async () => {
    await dbSaveCustomRoutineItem(item);

    expect(await dbLoadCustomRoutineItems()).toEqual([item]);

    await dbRemoveCustomRoutineItem(item.id, '2026-10-06T12:00:00.000Z');

    expect(await dbLoadCustomRoutineItems()).toEqual([
      { ...item, removedAt: '2026-10-06T12:00:00.000Z' },
    ]);
  });

  it('saves, loads and clears custom progress by period', async () => {
    await dbSaveCustomRoutineItem(item);
    await dbSaveCustomRoutineProgress('2026-10-05', item.id, true);

    expect(await dbLoadCustomRoutineProgress('2026-10-05', item.id)).toBe(true);

    await dbClearCustomRoutineProgressForPeriod('2026-10-05', 'morning');

    expect(await dbLoadCustomRoutineProgress('2026-10-05', item.id)).toBe(false);
  });
});

describe('custom routine history', () => {
  it('adds active custom items to the day history', async () => {
    const today = getLocalDateKey();
    const item: CustomRoutineItem = {
      id: 'routine:history',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: new Date().toISOString(),
      removedAt: null,
    };

    await dbSaveCustomRoutineItem(item);
    await dbSaveCustomRoutineProgress(today, item.id, true);

    const history = await dbLoadRoutineHistory(1);
    const morning = history.find(
      (entry) => entry.date === today && entry.period === 'morning'
    );

    expect(morning).toMatchObject({ completedCount: 1, totalCount: 9 });
  });

  it('does not add items created after the history date', async () => {
    const today = getLocalDateKey();

    await dbSaveCustomRoutineItem({
      id: 'routine:future',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: new Date().toISOString(),
      removedAt: null,
    });

    const history = await dbLoadRoutineHistory(2);
    const yesterday = history.find(
      (entry) => entry.period === 'morning' && entry.date !== today
    );

    expect(yesterday?.totalCount).toBe(8);
  });
});

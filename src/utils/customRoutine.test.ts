import { describe, expect, it } from 'vitest';
import { getRoutineItems } from '../data/routines';
import type { CustomRoutineItem } from '../types/models';
import {
  getActiveCustomRoutineItems,
  mergeRoutineItems,
  wasCustomItemActiveOnDate,
} from './customRoutine';

const makeItem = (
  overrides: Partial<CustomRoutineItem> = {}
): CustomRoutineItem => ({
  id: 'routine:1',
  period: 'morning',
  icon: '💊',
  text: 'Tomar remédio',
  createdAt: '2026-10-05T12:00:00.000Z',
  removedAt: null,
  ...overrides,
});

describe('wasCustomItemActiveOnDate', () => {
  it('is active on and after the creation date', () => {
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-04')).toBe(false);
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-05')).toBe(true);
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-06')).toBe(true);
  });

  it('stays active on the removal date and stops afterwards', () => {
    const removed = makeItem({
      removedAt: '2026-10-07T12:00:00.000Z',
    });

    expect(wasCustomItemActiveOnDate(removed, '2026-10-06')).toBe(true);
    expect(wasCustomItemActiveOnDate(removed, '2026-10-07')).toBe(true);
    expect(wasCustomItemActiveOnDate(removed, '2026-10-08')).toBe(false);
  });
});

describe('getActiveCustomRoutineItems', () => {
  it('returns only active items of the requested period', () => {
    const items = [
      makeItem({ id: 'a' }),
      makeItem({ id: 'b', removedAt: '2026-10-07T12:00:00.000Z' }),
      makeItem({ id: 'c', period: 'night' }),
    ];

    const active = getActiveCustomRoutineItems(items, 'morning');

    expect(active.map((item) => item.id)).toEqual(['a']);
  });
});

describe('mergeRoutineItems', () => {
  it('appends custom items after defaults with stable ids', () => {
    const defaults = getRoutineItems('morning');
    const merged = mergeRoutineItems(defaults, [makeItem({ id: 'extra' })]);
    const appended = merged[defaults.length];

    expect(merged).toHaveLength(defaults.length + 1);
    expect(appended).toMatchObject({
      id: 'extra',
      custom: true,
      index: defaults.length,
      text: 'Tomar remédio',
    });
  });
});

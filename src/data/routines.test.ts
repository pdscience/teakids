import { describe, expect, it } from 'vitest';
import {
  createEmptyRoutineProgress,
  getRoutineItems,
  getRoutinePeriodLength,
  routineData,
} from './routines';

describe('getRoutinePeriodLength', () => {
  it('derives the length from the routine data', () => {
    expect(getRoutinePeriodLength('morning')).toBe(routineData.morning.length);
    expect(getRoutinePeriodLength('afternoon')).toBe(routineData.afternoon.length);
    expect(getRoutinePeriodLength('night')).toBe(routineData.night.length);
  });

  it('returns zero for an unknown period', () => {
    expect(getRoutinePeriodLength('unknown')).toBe(0);
  });
});

describe('getRoutineItems', () => {
  it('returns an empty list for an unknown period', () => {
    expect(getRoutineItems('unknown')).toEqual([]);
  });
});

describe('createEmptyRoutineProgress', () => {
  it('does not mark an empty routine as completed', () => {
    const progress = createEmptyRoutineProgress('unknown');

    expect(progress.totalCount).toBe(0);
    expect(progress.progress).toBe(0);
    expect(progress.isCompleted).toBe(false);
  });
});

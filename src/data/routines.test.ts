import { describe, expect, it } from 'vitest';
import {
  createEmptyRoutineProgress,
  getAllRoutineItems,
  getPeriodName,
  getRoutineItems,
  getRoutinePeriodLength,
} from './routines';

describe('getRoutinePeriodLength', () => {
  it('derives the length from the routine data', () => {
    expect(getRoutinePeriodLength('morning')).toBe(8);
    expect(getRoutinePeriodLength('afternoon')).toBe(8);
    expect(getRoutinePeriodLength('night')).toBe(7);
  });

  it('returns zero for an unknown period', () => {
    expect(getRoutinePeriodLength('unknown')).toBe(0);
  });
});

describe('getRoutineItems', () => {
  it('returns an empty list for an unknown period', () => {
    expect(getRoutineItems('unknown')).toEqual([]);
  });

  it('keeps ids stable while translating text', () => {
    const pt = getRoutineItems('morning', 'pt-BR')[0];
    const en = getRoutineItems('morning', 'en-US')[0];
    const es = getRoutineItems('morning', 'es-ES')[0];

    expect(pt.id).toBe('routine:morning:0');
    expect(pt.text).toBe('Acordar');
    expect(en.text).toBe('Wake up');
    expect(es.text).toBe('Despertar');
  });
});

describe('getAllRoutineItems', () => {
  it('returns every localized item', () => {
    expect(getAllRoutineItems('en-US')).toHaveLength(23);
  });
});

describe('getPeriodName', () => {
  it('localizes known periods and preserves unknown values', () => {
    expect(getPeriodName('morning', 'en-US')).toBe('Morning');
    expect(getPeriodName('night', 'es-ES')).toBe('Noche');
    expect(getPeriodName('unknown', 'en-US')).toBe('unknown');
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

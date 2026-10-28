import { getLocalDateKey } from './date';

export interface RoutineDayState {
  dateKey: string;
  isNewDay: boolean;
}

export function getRoutineDayState(
  storedDate: string,
  now: Date = new Date()
): RoutineDayState {
  const dateKey = getLocalDateKey(now);
  return {
    dateKey,
    isNewDay: storedDate !== dateKey,
  };
}

export function routineStorageKey(
  dateKey: string,
  period: string,
  index: number
): string {
  return `routine_${dateKey}_${period}_${index}`;
}

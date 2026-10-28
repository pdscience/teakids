import { getLocalDateKey } from './date';
import type {
  CustomRoutineItem,
  RoutineItem,
  RoutinePeriod,
} from '../types/models';

export function wasCustomItemActiveOnDate(
  item: CustomRoutineItem,
  date: string
): boolean {
  const createdDate = getLocalDateKey(new Date(item.createdAt));
  if (createdDate > date) return false;
  if (!item.removedAt) return true;

  const removedDate = getLocalDateKey(new Date(item.removedAt));
  return removedDate >= date;
}

export function getActiveCustomRoutineItems(
  items: CustomRoutineItem[],
  period: RoutinePeriod
): CustomRoutineItem[] {
  return items.filter((item) => item.period === period && !item.removedAt);
}

export function mergeRoutineItems(
  defaultItems: RoutineItem[],
  customItems: CustomRoutineItem[]
): RoutineItem[] {
  return [
    ...defaultItems,
    ...customItems.map((item, customIndex) => ({
      icon: item.icon,
      text: item.text,
      period: item.period,
      index: defaultItems.length + customIndex,
      id: item.id,
      custom: true,
    })),
  ];
}

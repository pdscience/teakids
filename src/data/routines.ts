import type { RoutineItem, RoutineProgress } from '../types/models';

export const routineData: Record<'morning' | 'afternoon' | 'night', RoutineItem[]> = {
  morning: [
    { icon: '⏰', text: 'Acordar', period: 'morning', index: 0 },
    { icon: '🛏️', text: 'Fazer cama', period: 'morning', index: 1 },
    { icon: '🪥', text: 'Escovar os dentes', period: 'morning', index: 2 },
    { icon: '💧', text: 'Lavar rosto', period: 'morning', index: 3 },
    { icon: '☕', text: 'Tomar café', period: 'morning', index: 4 },
    { icon: '👕', text: 'Vestir', period: 'morning', index: 5 },
    { icon: '🎒', text: 'Arrumar mochila', period: 'morning', index: 6 },
    { icon: '🏫', text: 'Escola', period: 'morning', index: 7 },
  ],
  afternoon: [
    { icon: '🍲', text: 'Almoço', period: 'afternoon', index: 0 },
    { icon: '😴', text: 'Descanso', period: 'afternoon', index: 1 },
    { icon: '⚽', text: 'Brincar', period: 'afternoon', index: 2 },
    { icon: '🍎', text: 'Lanche', period: 'afternoon', index: 3 },
    { icon: '📝', text: 'Tarefa', period: 'afternoon', index: 4 },
    { icon: '📚', text: 'Estudar', period: 'afternoon', index: 5 },
    { icon: '🎨', text: 'Atividades extra', period: 'afternoon', index: 6 },
    { icon: '🏞️', text: 'Passear', period: 'afternoon', index: 7 },
  ],
  night: [
    { icon: '🍽️', text: 'Jantar', period: 'night', index: 0 },
    { icon: '🧸', text: 'Arrumar brinquedos', period: 'night', index: 1 },
    { icon: '🚿', text: 'Banho', period: 'night', index: 2 },
    { icon: '👚', text: 'Pijama', period: 'night', index: 3 },
    { icon: '🪥', text: 'Escovar os dentes', period: 'night', index: 4 },
    { icon: '📖', text: 'Ler história', period: 'night', index: 5 },
    { icon: '🌙', text: 'Dormir', period: 'night', index: 6 },
  ],
};

export function getRoutineItems(period: string): RoutineItem[] {
  return routineData[period as 'morning' | 'afternoon' | 'night'] ?? [];
}

export function getRoutinePeriodLength(period: string): number {
  return getRoutineItems(period).length;
}

export function getAllRoutineItems(): RoutineItem[] {
  return [...routineData.morning, ...routineData.afternoon, ...routineData.night];
}

export function createEmptyRoutineProgress(period: string): RoutineProgress {
  const items = getRoutineItems(period as 'morning' | 'afternoon' | 'night');
  const completedItems = Array(items.length).fill(false);
  return createRoutineProgressFromStorage(period, completedItems);
}

export function createRoutineProgressFromStorage(period: string, completedItems: boolean[]): RoutineProgress {
  const completedCount = completedItems.filter(item => item).length;
  const totalCount = completedItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    period,
    completedCount,
    totalCount,
    completedItems,
    progress,
    progressText: `${Math.round(progress)}%`,
    isCompleted: totalCount > 0 && completedCount === totalCount,
  };
}

export function getPeriodName(period: string): string {
  switch (period) {
    case 'morning': return 'Manhã';
    case 'afternoon': return 'Tarde';
    case 'night': return 'Noite';
    default: return period;
  }
}

export { createRoutineProgressFromStorage as getRoutineProgressData };

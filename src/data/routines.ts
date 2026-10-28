import type { RoutineItem, RoutineProgress, RoutinePeriod } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

interface LocalizedRoutineItem {
  icon: string;
  text: LocalizedText;
  period: RoutinePeriod;
  index: number;
}

const routineBase: Record<RoutinePeriod, LocalizedRoutineItem[]> = {
  morning: [
    { icon: '⏰', text: localized('Acordar', 'Wake up', 'Despertar'), period: 'morning', index: 0 },
    { icon: '🛏️', text: localized('Fazer cama', 'Make the bed', 'Hacer la cama'), period: 'morning', index: 1 },
    { icon: '🪥', text: localized('Escovar os dentes', 'Brush your teeth', 'Cepillarse los dientes'), period: 'morning', index: 2 },
    { icon: '💧', text: localized('Lavar rosto', 'Wash your face', 'Lavarse la cara'), period: 'morning', index: 3 },
    { icon: '☕', text: localized('Tomar café', 'Have breakfast', 'Desayunar'), period: 'morning', index: 4 },
    { icon: '👕', text: localized('Vestir', 'Get dressed', 'Vestirse'), period: 'morning', index: 5 },
    { icon: '🎒', text: localized('Arrumar mochila', 'Pack your backpack', 'Preparar la mochila'), period: 'morning', index: 6 },
    { icon: '🏫', text: localized('Escola', 'School', 'Escuela'), period: 'morning', index: 7 },
  ],
  afternoon: [
    { icon: '🍲', text: localized('Almoço', 'Lunch', 'Almuerzo'), period: 'afternoon', index: 0 },
    { icon: '😴', text: localized('Descanso', 'Rest', 'Descanso'), period: 'afternoon', index: 1 },
    { icon: '⚽', text: localized('Brincar', 'Play', 'Jugar'), period: 'afternoon', index: 2 },
    { icon: '🍎', text: localized('Lanche', 'Snack', 'Merienda'), period: 'afternoon', index: 3 },
    { icon: '📝', text: localized('Tarefa', 'Homework', 'Tarea'), period: 'afternoon', index: 4 },
    { icon: '📚', text: localized('Estudar', 'Study', 'Estudiar'), period: 'afternoon', index: 5 },
    { icon: '🎨', text: localized('Atividades extra', 'Extracurricular activities', 'Actividades extra'), period: 'afternoon', index: 6 },
    { icon: '🏞️', text: localized('Passear', 'Go for a walk', 'Pasear'), period: 'afternoon', index: 7 },
  ],
  night: [
    { icon: '🍽️', text: localized('Jantar', 'Dinner', 'Cena'), period: 'night', index: 0 },
    { icon: '🧸', text: localized('Arrumar brinquedos', 'Tidy up toys', 'Ordenar los juguetes'), period: 'night', index: 1 },
    { icon: '🚿', text: localized('Banho', 'Bath', 'Baño'), period: 'night', index: 2 },
    { icon: '👚', text: localized('Pijama', 'Pajamas', 'Pijama'), period: 'night', index: 3 },
    { icon: '🪥', text: localized('Escovar os dentes', 'Brush your teeth', 'Cepillarse los dientes'), period: 'night', index: 4 },
    { icon: '📖', text: localized('Ler história', 'Read a story', 'Leer un cuento'), period: 'night', index: 5 },
    { icon: '🌙', text: localized('Dormir', 'Sleep', 'Dormir'), period: 'night', index: 6 },
  ],
};

const periodNames: Record<RoutinePeriod, LocalizedText> = {
  morning: localized('Manhã', 'Morning', 'Mañana'),
  afternoon: localized('Tarde', 'Afternoon', 'Tarde'),
  night: localized('Noite', 'Night', 'Noche'),
};

export function getRoutineItems(
  period: string,
  locale: Locale = DEFAULT_LOCALE
): RoutineItem[] {
  const items = routineBase[period as RoutinePeriod] ?? [];

  return items.map((item) => ({
    id: `routine:${item.period}:${item.index}`,
    icon: item.icon,
    text: localize(item.text, locale),
    period: item.period,
    index: item.index,
  }));
}

export function getRoutinePeriodLength(period: string): number {
  return (routineBase[period as RoutinePeriod] ?? []).length;
}

export function getAllRoutineItems(locale: Locale = DEFAULT_LOCALE): RoutineItem[] {
  return (['morning', 'afternoon', 'night'] as RoutinePeriod[]).flatMap((period) =>
    getRoutineItems(period, locale)
  );
}

export function createEmptyRoutineProgress(period: string): RoutineProgress {
  const completedItems = Array(getRoutinePeriodLength(period)).fill(false);
  return createRoutineProgressFromStorage(period, completedItems);
}

export function createRoutineProgressFromStorage(
  period: string,
  completedItems: boolean[]
): RoutineProgress {
  const completedCount = completedItems.filter((item) => item).length;
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

export function getPeriodName(
  period: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const label = periodNames[period as RoutinePeriod];
  return label ? localize(label, locale) : period;
}

export { createRoutineProgressFromStorage as getRoutineProgressData };

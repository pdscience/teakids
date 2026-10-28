import { describe, expect, it } from 'vitest';
import { getAllInteractiveCategories, getInteractiveItems } from './interactive';

describe('localized interactive content', () => {
  it('keeps ids stable across locales', () => {
    const pt = getInteractiveItems('shapes', 'pt-BR').find((item) => item.name === 'Círculo');
    const en = getInteractiveItems('shapes', 'en-US').find((item) => item.id === pt?.id);
    const es = getInteractiveItems('shapes', 'es-ES').find((item) => item.id === pt?.id);

    expect(pt?.id).toBe('interactive:shapes:circulo');
    expect(en?.name).toBe('Circle');
    expect(es?.name).toBe('Círculo');
  });

  it('localizes item types and category names', () => {
    const dog = getInteractiveItems('animals', 'en-US').find((item) => item.id === 'interactive:animals:cachorro');
    const foods = getAllInteractiveCategories('es-ES');

    expect(dog?.type).toBe('Domestic');
    expect(foods.find((category) => category.id === 'foods')?.name).toBe('Alimentos');
  });

  it('returns an empty list for an unknown category', () => {
    expect(getInteractiveItems('unknown' as never)).toEqual([]);
  });
});

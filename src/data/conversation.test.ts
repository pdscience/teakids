import { describe, expect, it } from 'vitest';
import {
  CONVERSATION_CATEGORIES,
  getAllConversationCategories,
  getColor,
  getConversationItems,
  withAlpha,
} from './conversation';
import { slugify } from '../utils/slug';

describe('getColor', () => {
  it('maps named colors to valid hex values', () => {
    expect(getColor('yellow')).toBe('#FFEB3B');
    expect(getColor('black')).toBe('#000000');
  });

  it('keeps an explicit hex color', () => {
    expect(getColor('#0D47A1')).toBe('#0D47A1');
  });

  it('falls back to the default color for unknown values', () => {
    expect(getColor('not-a-color')).toBe('#2196F3');
  });
});

describe('withAlpha', () => {
  it('appends the alpha suffix to a valid hex color', () => {
    expect(withAlpha('#4D94FF', '99')).toBe('#4D94FF99');
  });

  it('resolves named colors before appending the alpha suffix', () => {
    expect(withAlpha('yellow', '99')).toBe('#FFEB3B99');
  });
});

describe('localized conversation items', () => {
  it('keeps the same id across locales', () => {
    const pt = getConversationItems('greetings', 'pt-BR').find((item) => item.text === 'Olá');
    const en = getConversationItems('greetings', 'en-US').find((item) => item.id === pt?.id);
    const es = getConversationItems('greetings', 'es-ES').find((item) => item.id === pt?.id);

    expect(pt?.id).toBe('greetings:ola');
    expect(en?.text).toBe('Hello');
    expect(es?.text).toBe('Hola');
  });

  it('localizes every category name', () => {
    const categories = getAllConversationCategories('en-US');
    expect(categories.find((category) => category.id === 'needs')?.name).toBe('Needs');
  });

  it('preserves every legacy conversation id', () => {
    for (const category of CONVERSATION_CATEGORIES) {
      for (const item of getConversationItems(category, 'pt-BR')) {
        expect(item.id).toBe(`${category}:${slugify(item.text)}`);
      }
    }
  });
});

import { describe, expect, it } from 'vitest';
import { getQuickPhrases } from './quickPhrases';

describe('localized quick phrases', () => {
  it('keeps ids stable and translates text', () => {
    const help = getQuickPhrases('pt-BR').find((phrase) => phrase.id === 'quick:help');
    const english = getQuickPhrases('en-US').find((phrase) => phrase.id === 'quick:help');
    const spanish = getQuickPhrases('es-ES').find((phrase) => phrase.id === 'quick:help');

    expect(help?.text).toBe('Preciso de ajuda');
    expect(english?.text).toBe('I need help');
    expect(spanish?.text).toBe('Necesito ayuda');
  });
});

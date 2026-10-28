import { describe, expect, it } from 'vitest';
import { getCoreVocabulary } from './coreVocabulary';

describe('localized core vocabulary', () => {
  it('translates labels while keeping ids', () => {
    const water = getCoreVocabulary('en-US').find((word) => word.id === 'agua');
    const agua = getCoreVocabulary('es-ES').find((word) => word.id === 'agua');

    expect(water?.label).toBe('water');
    expect(agua?.label).toBe('agua');
    expect(getCoreVocabulary('pt-BR')).toHaveLength(26);
  });
});

import { describe, expect, it } from 'vitest';
import { getAlphabetByLetter, getAlphabetItems } from './alphabet';

describe('localized alphabet', () => {
  it('translates words and keeps letters', () => {
    const airplane = getAlphabetByLetter('a', 'en-US');

    expect(airplane?.letter).toBe('A');
    expect(airplane?.word).toBe('Airplane');
    expect(getAlphabetItems('es-ES')).toHaveLength(26);
  });
});

import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('normalizes accents and spaces', () => {
    expect(slugify('Não sei')).toBe('nao-sei');
    expect(slugify('Trapézio')).toBe('trapezio');
  });

  it('removes punctuation and edge separators', () => {
    expect(slugify('  Olá, mundo!  ')).toBe('ola-mundo');
    expect(slugify('---')).toBe('');
  });
});

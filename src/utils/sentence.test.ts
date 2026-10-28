import { describe, expect, it } from 'vitest';
import { buildSentence } from './sentence';

describe('buildSentence', () => {
  it('joins the selected words into a sentence', () => {
    expect(buildSentence(['Eu', 'quero', 'água'])).toBe('Eu quero água');
  });

  it('ignores blank selections and trims each word', () => {
    expect(buildSentence([' Eu ', '', '  quero  ', ' '])).toBe('Eu quero');
  });

  it('returns an empty string when nothing is selected', () => {
    expect(buildSentence([])).toBe('');
  });
});

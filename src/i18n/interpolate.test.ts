import { describe, expect, it } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('replaces named parameters', () => {
    expect(interpolate('Falar: {text}', { text: 'Olá' })).toBe('Falar: Olá');
  });

  it('keeps unknown placeholders', () => {
    expect(interpolate('Olá, {name}', {})).toBe('Olá, {name}');
  });

  it('returns the template without params', () => {
    expect(interpolate('Olá')).toBe('Olá');
  });
});

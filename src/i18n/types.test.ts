import { describe, expect, it } from 'vitest';
import { localize, localized } from './content';
import { DEFAULT_LOCALE, isLocale, LOCALES } from './types';

describe('i18n types', () => {
  it('accepts only supported locales', () => {
    expect(LOCALES.every(isLocale)).toBe(true);
    expect(isLocale('fr-FR')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it('returns the requested locale text', () => {
    const text = localized('Olá', 'Hello', 'Hola');

    expect(localize(text, 'en-US')).toBe('Hello');
    expect(localize(text, 'es-ES')).toBe('Hola');
    expect(localize(text, 'pt-BR')).toBe('Olá');
  });

  it('falls back to the default locale', () => {
    const text = localized('Olá', 'Hello', 'Hola');

    expect(localize({ ...text, 'en-US': '' }, 'en-US')).toBe('Olá');
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });
});

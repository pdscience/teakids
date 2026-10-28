import { describe, expect, it } from 'vitest';
import { LOCALES } from '../types';
import { messagesByLocale } from './index';
import { ptBR } from './pt-BR';

describe('ui messages', () => {
  it('has every key in every locale', () => {
    const keys = Object.keys(ptBR).sort();

    for (const locale of LOCALES) {
      expect(Object.keys(messagesByLocale[locale]).sort()).toEqual(keys);
    }
  });

  it('has no empty messages', () => {
    for (const locale of LOCALES) {
      for (const value of Object.values(messagesByLocale[locale])) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

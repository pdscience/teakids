import { afterEach, describe, expect, it } from 'vitest';
import {
  getAllCommunicationEntries,
  getCommunicationEntry,
  getConversationEntryId,
  setCustomCommunicationEntries,
} from './communication';
import { getConversationItems } from './conversation';
import type { CustomConversationCard } from '../types/models';

afterEach(() => {
  setCustomCommunicationEntries([]);
});

describe('communication entries', () => {
  it('resolves a conversation item by its stable id', () => {
    const hello = getConversationItems('greetings', 'en-US').find(
      (item) => item.id === 'greetings:ola'
    );

    expect(hello).toBeDefined();
    const entry = getCommunicationEntry(getConversationEntryId(hello!), 'en-US');
    expect(entry?.text).toBe('Hello');
  });

  it('resolves a quick phrase by its id', () => {
    expect(getCommunicationEntry('quick:help')?.text).toBe('Preciso de ajuda');
    expect(getCommunicationEntry('quick:help', 'en-US')?.text).toBe('I need help');
    expect(getCommunicationEntry('quick:help', 'es-ES')?.text).toBe('Necesito ayuda');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCommunicationEntry('missing:id')).toBeUndefined();
  });

  it('generates unique ids for every locale', () => {
    for (const locale of ['pt-BR', 'en-US', 'es-ES'] as const) {
      const ids = getAllCommunicationEntries(locale).map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('includes registered custom cards in every locale without translating them', () => {
    const card: CustomConversationCard = {
      id: 'custom:1',
      category: 'needs',
      icon: '🍼',
      text: 'Quero leite',
      color: '#FF9800',
      createdAt: '2026-01-05T10:00:00.000Z',
    };

    setCustomCommunicationEntries([card]);

    expect(getCommunicationEntry('custom:1', 'pt-BR')?.text).toBe('Quero leite');
    expect(getCommunicationEntry('custom:1', 'en-US')?.text).toBe('Quero leite');
    expect(
      getAllCommunicationEntries('es-ES').some((entry) => entry.id === 'custom:1')
    ).toBe(true);
  });
});

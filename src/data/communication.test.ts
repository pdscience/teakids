import { afterEach, describe, expect, it } from 'vitest';
import {
  getAllCommunicationEntries,
  getCommunicationEntry,
  getConversationEntryId,
  setCustomCommunicationEntries,
} from './communication';
import { conversationData } from './conversation';
import type { CustomConversationCard } from '../types/models';

afterEach(() => {
  setCustomCommunicationEntries([]);
});

describe('communication entries', () => {
  it('resolves a conversation item by its stable id', () => {
    const hello = conversationData.greetings.find((item) => item.text === 'Olá');

    expect(hello).toBeDefined();
    const entry = getCommunicationEntry(getConversationEntryId(hello!));
    expect(entry?.text).toBe('Olá');
  });

  it('resolves a quick phrase by its id', () => {
    expect(getCommunicationEntry('quick:help')?.text).toBe('Preciso de ajuda');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCommunicationEntry('missing:id')).toBeUndefined();
  });

  it('generates unique ids for every entry', () => {
    const ids = getAllCommunicationEntries().map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes registered custom cards', () => {
    const card: CustomConversationCard = {
      id: 'custom:1',
      category: 'needs',
      icon: '🍼',
      text: 'Quero leite',
      color: '#FF9800',
      createdAt: '2026-01-05T10:00:00.000Z',
    };

    setCustomCommunicationEntries([card]);

    expect(getCommunicationEntry('custom:1')?.text).toBe('Quero leite');
    expect(
      getAllCommunicationEntries().some((entry) => entry.id === 'custom:1')
    ).toBe(true);
  });
});

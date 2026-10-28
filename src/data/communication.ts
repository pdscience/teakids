import type { ConversationItem, CustomConversationCard } from '../types/models';
import { CONVERSATION_CATEGORIES, getConversationItems } from './conversation';
import { getQuickPhrases } from './quickPhrases';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/types';
import { slugify } from '../utils/slug';

export interface CommunicationEntry {
  id: string;
  icon: string;
  text: string;
  color: string;
  category: string;
}

export function getConversationEntryId(item: ConversationItem): string {
  return item.id || `${item.category}:${slugify(item.text)}`;
}

const baseEntriesByLocale = new Map<Locale, CommunicationEntry[]>();
const allEntriesByLocale = new Map<Locale, CommunicationEntry[]>();
const entriesByIdByLocale = new Map<Locale, Map<string, CommunicationEntry>>();

let customEntries: CommunicationEntry[] = [];

function buildBaseEntries(locale: Locale): CommunicationEntry[] {
  const quickEntries: CommunicationEntry[] = getQuickPhrases(locale).map((phrase) => ({
    ...phrase,
    category: 'quick',
  }));

  const conversationEntries: CommunicationEntry[] = CONVERSATION_CATEGORIES.flatMap(
    (category) =>
      getConversationItems(category, locale).map((item) => ({
        id: item.id,
        icon: item.icon,
        text: item.text,
        color: item.color || '#4D94FF',
        category: item.category,
      }))
  );

  return [...quickEntries, ...conversationEntries];
}

function rebuildLocale(locale: Locale): void {
  const baseEntries = baseEntriesByLocale.get(locale) ?? buildBaseEntries(locale);
  baseEntriesByLocale.set(locale, baseEntries);

  const allEntries = [...baseEntries, ...customEntries];
  allEntriesByLocale.set(locale, allEntries);
  entriesByIdByLocale.set(
    locale,
    new Map(allEntries.map((entry) => [entry.id, entry]))
  );
}

function rebuildAllLocales(): void {
  for (const locale of LOCALES) {
    rebuildLocale(locale);
  }
}

function getEntries(locale: Locale): CommunicationEntry[] {
  if (!allEntriesByLocale.has(locale)) {
    rebuildLocale(locale);
  }
  return allEntriesByLocale.get(locale)!;
}

export function setCustomCommunicationEntries(
  cards: CustomConversationCard[]
): void {
  customEntries = cards.map((card) => ({
    id: card.id,
    icon: card.icon,
    text: card.text,
    color: card.color,
    category: card.category,
  }));
  rebuildAllLocales();
}

export function getCustomCommunicationEntries(
  category?: string
): CommunicationEntry[] {
  return category
    ? customEntries.filter((entry) => entry.category === category)
    : customEntries;
}

export function getCommunicationEntry(
  id: string,
  locale: Locale = DEFAULT_LOCALE
): CommunicationEntry | undefined {
  getEntries(locale);
  return entriesByIdByLocale.get(locale)?.get(id);
}

export function getAllCommunicationEntries(
  locale: Locale = DEFAULT_LOCALE
): CommunicationEntry[] {
  return getEntries(locale);
}

export { slugify } from '../utils/slug';

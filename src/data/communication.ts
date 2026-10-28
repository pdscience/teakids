import type { ConversationItem, CustomConversationCard } from '../types/models';
import { conversationData } from './conversation';
import { quickPhrases } from './quickPhrases';
import { slugify } from '../utils/slug';

export interface CommunicationEntry {
  id: string;
  icon: string;
  text: string;
  color: string;
  category: string;
}

export function getConversationEntryId(item: ConversationItem): string {
  return `${item.category}:${slugify(item.text)}`;
}

const conversationEntries: CommunicationEntry[] = Object.values(conversationData)
  .flat()
  .map((item) => ({
    id: getConversationEntryId(item),
    icon: item.icon,
    text: item.text,
    color: item.color || '#4D94FF',
    category: item.category,
  }));

const quickEntries: CommunicationEntry[] = quickPhrases.map((phrase) => ({
  ...phrase,
  category: 'quick',
}));

const baseEntries: CommunicationEntry[] = [...quickEntries, ...conversationEntries];

let customEntries: CommunicationEntry[] = [];
let allEntries: CommunicationEntry[] = [...baseEntries];
let entriesById = new Map(allEntries.map((entry) => [entry.id, entry]));

function rebuildEntries(): void {
  allEntries = [...baseEntries, ...customEntries];
  entriesById = new Map(allEntries.map((entry) => [entry.id, entry]));
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
  rebuildEntries();
}

export function getCustomCommunicationEntries(
  category?: string
): CommunicationEntry[] {
  return category
    ? customEntries.filter((entry) => entry.category === category)
    : customEntries;
}

export function getCommunicationEntry(id: string): CommunicationEntry | undefined {
  return entriesById.get(id);
}

export function getAllCommunicationEntries(): CommunicationEntry[] {
  return allEntries;
}

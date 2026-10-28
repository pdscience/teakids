import { describe, expect, it } from 'vitest';
import { LOCALES } from './types';
import {
  CONVERSATION_CATEGORIES,
  getConversationItems,
} from '../data/conversation';
import { getQuickPhrases } from '../data/quickPhrases';
import { getCoreVocabulary } from '../data/coreVocabulary';
import { getAlphabetItems } from '../data/alphabet';
import { getAllRoutineItems } from '../data/routines';
import {
  getAllInteractiveCategories,
  getInteractiveItems,
} from '../data/interactive';

const expectFilled = (values: string[]) => {
  for (const value of values) {
    expect(value.trim().length).toBeGreaterThan(0);
  }
};

const interactiveCategories = [
  'shapes',
  'colors',
  'animals',
  'fruits',
  'foods',
  'numbers',
  'vegetables',
  'household',
] as const;

for (const locale of LOCALES) {
  describe(`native content in ${locale}`, () => {
    it('has no empty translated texts', () => {
      for (const category of CONVERSATION_CATEGORIES) {
        expectFilled(
          getConversationItems(category, locale).map((item) => item.text)
        );
      }

      expectFilled(getQuickPhrases(locale).map((item) => item.text));
      expectFilled(getCoreVocabulary(locale).map((item) => item.label));
      expectFilled(getAlphabetItems(locale).map((item) => item.word));
      expectFilled(getAllRoutineItems(locale).map((item) => item.text));
      expectFilled(
        getAllInteractiveCategories(locale).map((item) => item.name)
      );

      for (const category of interactiveCategories) {
        expectFilled(
          getInteractiveItems(category, locale).map((item) => item.name)
        );
      }
    });
  });
}

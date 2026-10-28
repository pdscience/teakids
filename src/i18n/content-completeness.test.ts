import { describe, expect, it } from 'vitest';
import { LOCALES, type LocalizedText } from './types';
import {
  CONVERSATION_CATEGORIES,
  conversationBase,
  conversationCategoryNames,
  getConversationItems,
} from '../data/conversation';
import { getQuickPhrases, quickPhraseBase } from '../data/quickPhrases';
import { coreVocabularyBase, getCoreVocabulary } from '../data/coreVocabulary';
import { alphabetBase, getAlphabetItems } from '../data/alphabet';
import { getAllRoutineItems, periodNames, routineBase } from '../data/routines';
import {
  categoryNames as interactiveCategoryNames,
  getAllInteractiveCategories,
  getInteractiveItems,
  interactiveBase,
} from '../data/interactive';
import type { RoutinePeriod } from '../types/models';

const MIN_CONVERSATION_CATEGORIES = 6;
const MIN_CONVERSATION_ITEMS_PER_CATEGORY = 10;
const MIN_QUICK_PHRASES = 8;
const MIN_VOCABULARY = 20;
const MIN_ALPHABET = 20;
const MIN_ROUTINE_ITEMS = 20;
const MIN_INTERACTIVE_CATEGORIES = 8;
const MIN_INTERACTIVE_ITEMS_PER_CATEGORY = 10;

const interactiveCategoryIds = getAllInteractiveCategories().map(
  (category) => category.id
);

const routinePeriods = Object.keys(routineBase) as RoutinePeriod[];

const expectFilled = (values: string[]) => {
  for (const value of values) {
    expect(value.trim().length).toBeGreaterThan(0);
  }
};

const expectLocalizedFilled = (text: LocalizedText, label: string) => {
  for (const locale of LOCALES) {
    expect(text[locale]?.trim() ?? '', `${label} [${locale}]`).not.toBe('');
  }
};

describe('raw native content', () => {
  it('keeps every conversation category name translated', () => {
    expect(CONVERSATION_CATEGORIES.length).toBeGreaterThanOrEqual(
      MIN_CONVERSATION_CATEGORIES
    );

    for (const category of CONVERSATION_CATEGORIES) {
      expectLocalizedFilled(
        conversationCategoryNames[category],
        `conversation category "${category}"`
      );
    }
  });

  it('keeps every conversation item translated', () => {
    for (const category of CONVERSATION_CATEGORIES) {
      const items = conversationBase[category] ?? [];
      expect(
        items.length,
        `conversation items of "${category}"`
      ).toBeGreaterThanOrEqual(MIN_CONVERSATION_ITEMS_PER_CATEGORY);

      items.forEach((item, index) => {
        expectLocalizedFilled(
          item.text,
          `conversation item "${category}[${index}]"`
        );
      });
    }
  });

  it('keeps every quick phrase translated', () => {
    expect(quickPhraseBase.length).toBeGreaterThanOrEqual(MIN_QUICK_PHRASES);

    quickPhraseBase.forEach((phrase) => {
      expectLocalizedFilled(phrase.text, `quick phrase "${phrase.id}"`);
    });
  });

  it('keeps every core vocabulary word translated', () => {
    expect(coreVocabularyBase.length).toBeGreaterThanOrEqual(MIN_VOCABULARY);

    coreVocabularyBase.forEach((word) => {
      expectLocalizedFilled(word.label, `core vocabulary "${word.id}"`);
    });
  });

  it('keeps every alphabet word translated', () => {
    expect(alphabetBase.length).toBeGreaterThanOrEqual(MIN_ALPHABET);

    alphabetBase.forEach((item) => {
      expectLocalizedFilled(item.word, `alphabet "${item.letter}"`);
    });
  });

  it('keeps every routine item and period name translated', () => {
    expect(routinePeriods.length).toBeGreaterThan(0);

    let totalItems = 0;
    for (const period of routinePeriods) {
      expectLocalizedFilled(
        periodNames[period],
        `routine period "${period}"`
      );

      const items = routineBase[period] ?? [];
      totalItems += items.length;
      items.forEach((item, index) => {
        expectLocalizedFilled(item.text, `routine item "${period}[${index}]"`);
      });
    }

    expect(totalItems).toBeGreaterThanOrEqual(MIN_ROUTINE_ITEMS);
  });

  it('keeps every interactive category name and item translated', () => {
    expect(interactiveCategoryIds.length).toBeGreaterThanOrEqual(
      MIN_INTERACTIVE_CATEGORIES
    );

    for (const category of interactiveCategoryIds) {
      expectLocalizedFilled(
        interactiveCategoryNames[category],
        `interactive category "${category}"`
      );

      const items = interactiveBase[category] ?? [];
      expect(
        items.length,
        `interactive items of "${category}"`
      ).toBeGreaterThanOrEqual(MIN_INTERACTIVE_ITEMS_PER_CATEGORY);

      items.forEach((item, index) => {
        expectLocalizedFilled(item.name, `interactive item "${category}[${index}]"`);

        if (item.type) {
          expectLocalizedFilled(
            item.type,
            `interactive item type "${category}[${index}]"`
          );
        }
      });
    }
  });
});

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

      for (const category of interactiveCategoryIds) {
        expectFilled(
          getInteractiveItems(category, locale).map((item) => item.name)
        );
      }
    });
  });
}

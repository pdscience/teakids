import type { AlphabetItem } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

interface LocalizedAlphabetItem {
  letter: string;
  word: LocalizedText;
  icon: string;
}

const alphabetBase: LocalizedAlphabetItem[] = [
  { letter: 'A', word: localized('Avião', 'Airplane', 'Avión'), icon: '✈️' },
  { letter: 'B', word: localized('Bola', 'Ball', 'Pelota'), icon: '⚽' },
  { letter: 'C', word: localized('Casa', 'House', 'Casa'), icon: '🏠' },
  { letter: 'D', word: localized('Dado', 'Dice', 'Dado'), icon: '🎲' },
  { letter: 'E', word: localized('Estrela', 'Star', 'Estrella'), icon: '⭐' },
  { letter: 'F', word: localized('Flor', 'Flower', 'Flor'), icon: '🌸' },
  { letter: 'G', word: localized('Gato', 'Cat', 'Gato'), icon: '🐱' },
  { letter: 'H', word: localized('Helicóptero', 'Helicopter', 'Helicóptero'), icon: '🚁' },
  { letter: 'I', word: localized('Igreja', 'Church', 'Iglesia'), icon: '⛪' },
  { letter: 'J', word: localized('Janela', 'Window', 'Ventana'), icon: '🪟' },
  { letter: 'K', word: localized('Kiwi', 'Kiwi', 'Kiwi'), icon: '🥝' },
  { letter: 'L', word: localized('Leão', 'Lion', 'León'), icon: '🦁' },
  { letter: 'M', word: localized('Maçã', 'Apple', 'Manzana'), icon: '🍎' },
  { letter: 'N', word: localized('Navio', 'Ship', 'Barco'), icon: '🚢' },
  { letter: 'O', word: localized('Ovo', 'Egg', 'Huevo'), icon: '🥚' },
  { letter: 'P', word: localized('Pato', 'Duck', 'Pato'), icon: '🦆' },
  { letter: 'Q', word: localized('Queijo', 'Cheese', 'Queso'), icon: '🧀' },
  { letter: 'R', word: localized('Rato', 'Mouse', 'Ratón'), icon: '🐭' },
  { letter: 'S', word: localized('Sol', 'Sun', 'Sol'), icon: '☀️' },
  { letter: 'T', word: localized('Trem', 'Train', 'Tren'), icon: '🚂' },
  { letter: 'U', word: localized('Uva', 'Grape', 'Uva'), icon: '🍇' },
  { letter: 'V', word: localized('Vaca', 'Cow', 'Vaca'), icon: '🐮' },
  { letter: 'W', word: localized('Waffle', 'Waffle', 'Waffle'), icon: '🧇' },
  { letter: 'X', word: localized('Xícara', 'Cup', 'Taza'), icon: '☕' },
  { letter: 'Y', word: localized('Yoga', 'Yoga', 'Yoga'), icon: '🧘' },
  { letter: 'Z', word: localized('Zebra', 'Zebra', 'Cebra'), icon: '🦓' },
];

export function getAlphabetItems(locale: Locale = DEFAULT_LOCALE): AlphabetItem[] {
  return alphabetBase.map((item) => ({
    letter: item.letter,
    word: localize(item.word, locale),
    icon: item.icon,
  }));
}

export function getAlphabetByLetter(
  letter: string,
  locale: Locale = DEFAULT_LOCALE
): AlphabetItem | undefined {
  return getAlphabetItems(locale).find(
    (item) => item.letter === letter.toUpperCase()
  );
}

// Compatibilidade temporária até a Task 12.
export const alphabetData = getAlphabetItems();

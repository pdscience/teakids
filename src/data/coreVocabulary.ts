import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

export interface CoreWord {
  id: string;
  label: string;
  icon: string;
}

interface LocalizedCoreWord {
  id: string;
  label: LocalizedText;
  icon: string;
}

const coreVocabularyBase: LocalizedCoreWord[] = [
  { id: 'eu', label: localized('Eu', 'I', 'Yo'), icon: '🙋' },
  { id: 'quero', label: localized('quero', 'want', 'quiero'), icon: '✋' },
  { id: 'nao-quero', label: localized('não quero', "don't want", 'no quiero'), icon: '🙅' },
  { id: 'preciso', label: localized('preciso', 'need', 'necesito'), icon: '❗' },
  { id: 'ir', label: localized('ir', 'go', 'ir'), icon: '🚶' },
  { id: 'comer', label: localized('comer', 'eat', 'comer'), icon: '🍽️' },
  { id: 'beber', label: localized('beber', 'drink', 'beber'), icon: '🥤' },
  { id: 'brincar', label: localized('brincar', 'play', 'jugar'), icon: '🧸' },
  { id: 'ajuda', label: localized('ajuda', 'help', 'ayuda'), icon: '🆘' },
  { id: 'mais', label: localized('mais', 'more', 'más'), icon: '➕' },
  { id: 'parar', label: localized('parar', 'stop', 'parar'), icon: '✋' },
  { id: 'gosto', label: localized('gosto', 'like', 'me gusta'), icon: '👍' },
  { id: 'nao-gosto', label: localized('não gosto', "don't like", 'no me gusta'), icon: '👎' },
  { id: 'banheiro', label: localized('banheiro', 'bathroom', 'baño'), icon: '🚽' },
  { id: 'agua', label: localized('água', 'water', 'agua'), icon: '💧' },
  { id: 'comida', label: localized('comida', 'food', 'comida'), icon: '🍎' },
  { id: 'casa', label: localized('casa', 'home', 'casa'), icon: '🏠' },
  { id: 'escola', label: localized('escola', 'school', 'escuela'), icon: '🏫' },
  { id: 'mamae', label: localized('mamãe', 'mommy', 'mamá'), icon: '👩' },
  { id: 'papai', label: localized('papai', 'daddy', 'papá'), icon: '👨' },
  { id: 'por-favor', label: localized('por favor', 'please', 'por favor'), icon: '🙏' },
  { id: 'obrigado', label: localized('obrigado', 'thank you', 'gracias'), icon: '🤝' },
  { id: 'agora', label: localized('agora', 'now', 'ahora'), icon: '⏰' },
  { id: 'depois', label: localized('depois', 'later', 'después'), icon: '⏳' },
  { id: 'muito', label: localized('muito', 'very', 'mucho'), icon: '⭐' },
  { id: 'pouco', label: localized('pouco', 'little', 'poco'), icon: '🔹' },
];

export function getCoreVocabulary(locale: Locale = DEFAULT_LOCALE): CoreWord[] {
  return coreVocabularyBase.map((word) => ({
    ...word,
    label: localize(word.label, locale),
  }));
}

// Compatibilidade temporária até a Task 12.
export const coreVocabulary = getCoreVocabulary();

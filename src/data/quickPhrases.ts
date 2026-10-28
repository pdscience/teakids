import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

export interface QuickPhrase {
  id: string;
  icon: string;
  text: string;
  color: string;
}

interface LocalizedQuickPhrase {
  id: string;
  icon: string;
  text: LocalizedText;
  color: string;
}

const quickPhraseBase: LocalizedQuickPhrase[] = [
  { id: 'quick:help', icon: '🆘', text: localized('Preciso de ajuda', 'I need help', 'Necesito ayuda'), color: '#FF1744' },
  { id: 'quick:stop', icon: '✋', text: localized('Quero parar', 'I want to stop', 'Quiero parar'), color: '#FF6B35' },
  { id: 'quick:pain', icon: '🤕', text: localized('Estou com dor', "I'm in pain", 'Tengo dolor'), color: '#E91E63' },
  { id: 'quick:hug', icon: '🤗', text: localized('Preciso de um abraço', 'I need a hug', 'Necesito un abrazo'), color: '#B24BF3' },
  { id: 'quick:overwhelmed', icon: '😖', text: localized('Estou sobrecarregado', "I'm overwhelmed", 'Estoy sobrecargado'), color: '#FF9100' },
  { id: 'quick:quiet', icon: '😌', text: localized('Preciso de um tempo sozinho', 'I need some time alone', 'Necesito un tiempo a solas'), color: '#00BCD4' },
  { id: 'quick:mother', icon: '👩', text: localized('Chama minha mãe', 'Call my mom', 'Llama a mi mamá'), color: '#4D94FF' },
  { id: 'quick:father', icon: '👨', text: localized('Chama meu pai', 'Call my dad', 'Llama a mi papá'), color: '#00C853' },
];

export function getQuickPhrases(locale: Locale = DEFAULT_LOCALE): QuickPhrase[] {
  return quickPhraseBase.map((phrase) => ({
    ...phrase,
    text: localize(phrase.text, locale),
  }));
}

// Compatibilidade temporária até a Task 12.
export const quickPhrases = getQuickPhrases();

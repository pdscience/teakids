import { DEFAULT_LOCALE, type Locale, type LocalizedText } from './types';

export function localized(pt: string, en: string, es: string): LocalizedText {
  return { 'pt-BR': pt, 'en-US': en, 'es-ES': es };
}

export function localize(
  text: LocalizedText,
  locale: Locale = DEFAULT_LOCALE
): string {
  return text[locale] || text[DEFAULT_LOCALE];
}

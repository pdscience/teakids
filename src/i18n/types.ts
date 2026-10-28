export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;

export type Locale = (typeof LOCALES)[number];

export type LocalizedText = Record<Locale, string>;

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'es-ES': 'Español',
};

export const SPEECH_LANG: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'es-ES': 'es-ES',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

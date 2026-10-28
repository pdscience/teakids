import type { Locale } from '../types';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { ptBR, type MessageKey } from './pt-BR';

export type { MessageKey } from './pt-BR';

export const messagesByLocale: Record<Locale, Record<MessageKey, string>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

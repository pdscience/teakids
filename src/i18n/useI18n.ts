import { computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { interpolate, type InterpolationParams } from './interpolate';
import { messagesByLocale, type MessageKey } from './messages';
import {
  DEFAULT_LOCALE,
  SPEECH_LANG,
  type Locale,
} from './types';

export function useI18n() {
  const settings = useSettingsStore();
  const locale = computed<Locale>(() => settings.settings.language);

  const t = (key: MessageKey, params?: InterpolationParams): string => {
    const message =
      messagesByLocale[locale.value][key] ??
      messagesByLocale[DEFAULT_LOCALE][key];
    return interpolate(message, params);
  };

  const formatDate = (
    date: Date,
    options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ): string => new Intl.DateTimeFormat(locale.value, options).format(date);

  const speechLocale = computed(() => SPEECH_LANG[locale.value]);

  return { locale, t, formatDate, speechLocale };
}

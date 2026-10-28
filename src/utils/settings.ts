import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/types';

export interface AppSettings {
  language: Locale;
  speechRate: number;
  speechPitch: number;
  soundEnabled: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: DEFAULT_LOCALE,
  speechRate: 0.9,
  speechPitch: 1,
  soundEnabled: true,
  reduceMotion: false,
  largeText: false,
  highContrast: false,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOrDefault = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(value, min, max);
};

const booleanOrDefault = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export function parseSettings(raw: string | null): AppSettings {
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ...DEFAULT_SETTINGS };
  }

  const data = parsed as Record<string, unknown>;

  return {
    language: isLocale(data.language) ? data.language : DEFAULT_SETTINGS.language,
    speechRate: numberOrDefault(
      data.speechRate,
      DEFAULT_SETTINGS.speechRate,
      0.5,
      1.5
    ),
    speechPitch: numberOrDefault(
      data.speechPitch,
      DEFAULT_SETTINGS.speechPitch,
      0.5,
      2
    ),
    soundEnabled: booleanOrDefault(
      data.soundEnabled,
      DEFAULT_SETTINGS.soundEnabled
    ),
    reduceMotion: booleanOrDefault(
      data.reduceMotion,
      DEFAULT_SETTINGS.reduceMotion
    ),
    largeText: booleanOrDefault(data.largeText, DEFAULT_SETTINGS.largeText),
    highContrast: booleanOrDefault(
      data.highContrast,
      DEFAULT_SETTINGS.highContrast
    ),
  };
}

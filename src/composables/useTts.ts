import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { DEFAULT_LOCALE, SPEECH_LANG, type Locale } from '../i18n/types';

type TtsState = 'playing' | 'stopped' | 'paused';

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const DEFAULT_LANGUAGE = SPEECH_LANG[DEFAULT_LOCALE];

const DEFAULT_OPTIONS: Required<SpeakOptions> = {
  lang: DEFAULT_LANGUAGE,
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
};

const isInitialized = ref(false);
const activeLanguage = ref(DEFAULT_LANGUAGE);
const ttsState = ref<TtsState>('stopped');

let cancelCurrentWebSpeech: (() => void) | null = null;

interface ResolvedLanguage {
  language: string;
  exact: boolean;
}

function getLanguageCandidates(language: string): string[] {
  const base = language.split('-')[0];
  return [...new Set([language, base, DEFAULT_LANGUAGE])];
}

async function supportsLanguage(language: string): Promise<boolean> {
  try {
    const result = await TextToSpeech.isLanguageSupported({ lang: language });
    if (typeof result === 'boolean') return result;
    return result.supported;
  } catch {
    return false;
  }
}

export function useTts() {
  const isNative = Capacitor.isNativePlatform();
  const resolvedLanguages = new Map<string, ResolvedLanguage>();

  const resolveLanguage = async (language: string): Promise<ResolvedLanguage> => {
    const cached = resolvedLanguages.get(language);
    if (cached) return cached;

    const candidates = getLanguageCandidates(language);

    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index];
      if (await supportsLanguage(candidate)) {
        const resolved = { language: candidate, exact: index === 0 };
        resolvedLanguages.set(language, resolved);
        return resolved;
      }
    }

    const fallback = { language: DEFAULT_LANGUAGE, exact: false };
    resolvedLanguages.set(language, fallback);
    return fallback;
  };

  const initialize = async (
    locale: Locale = DEFAULT_LOCALE
  ): Promise<boolean> => {
    const requestedLanguage = SPEECH_LANG[locale];

    if (!isNative) {
      activeLanguage.value = requestedLanguage;
      isInitialized.value =
        typeof globalThis.speechSynthesis !== 'undefined' &&
        'SpeechSynthesisUtterance' in globalThis;
      return isInitialized.value;
    }

    const resolved = await resolveLanguage(requestedLanguage);
    activeLanguage.value = resolved.language;
    isInitialized.value = true;
    return resolved.exact;
  };

  const speakWeb = async (text: string, options: Required<SpeakOptions>): Promise<void> => {
    const synth = globalThis.speechSynthesis;
    if (!synth) return;

    cancelCurrentWebSpeech?.();
    synth.cancel();

    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      let settled = false;
      let safetyTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (safetyTimer !== null) clearTimeout(safetyTimer);
        if (cancelCurrentWebSpeech === finish) cancelCurrentWebSpeech = null;
        resolve();
      };

      cancelCurrentWebSpeech = finish;
      utterance.onend = finish;
      utterance.onerror = finish;
      safetyTimer = setTimeout(finish, Math.max(3000, text.length * 150));

      synth.speak(utterance);
    });
  };

  const speak = async (text: string, options: SpeakOptions = {}): Promise<void> => {
    if (!text.trim()) return;

    if (isNative && !isInitialized.value) {
      await initialize(DEFAULT_LOCALE);
    }

    const requestedLanguage = options.lang ?? activeLanguage.value;
    const resolved = isNative
      ? await resolveLanguage(requestedLanguage)
      : { language: requestedLanguage, exact: true };

    if (isNative) {
      activeLanguage.value = resolved.language;
    }

    const merged = { ...DEFAULT_OPTIONS, ...options, lang: resolved.language };

    if (!isNative) {
      ttsState.value = 'playing';
      await speakWeb(text, merged);
      ttsState.value = 'stopped';
      return;
    }

    try {
      if (ttsState.value === 'playing') {
        await stop();
      }

      ttsState.value = 'playing';

      await TextToSpeech.speak({
        text,
        lang: merged.lang,
        rate: merged.rate,
        pitch: merged.pitch,
        volume: merged.volume,
      });

      ttsState.value = 'stopped';
    } catch {
      ttsState.value = 'stopped';
    }
  };

  const stop = async (): Promise<void> => {
    if (!isNative) {
      cancelCurrentWebSpeech?.();
      globalThis.speechSynthesis?.cancel();
      ttsState.value = 'stopped';
      return;
    }

    try {
      await TextToSpeech.stop();
      ttsState.value = 'stopped';
    } catch {
      // TTS stop failed silently
    }
  };

  const pause = async (): Promise<void> => {
    await stop();
  };

  const isSupported = (): boolean => {
    return isNative || typeof globalThis.speechSynthesis !== 'undefined';
  };

  return {
    isInitialized,
    activeLanguage,
    ttsState,
    initialize,
    speak,
    stop,
    pause,
    isSupported,
  };
}

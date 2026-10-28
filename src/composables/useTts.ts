import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

type TtsState = 'playing' | 'stopped' | 'paused';

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const DEFAULT_OPTIONS: Required<SpeakOptions> = {
  lang: 'pt-BR',
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
};

const isInitialized = ref(false);
const ttsState = ref<TtsState>('stopped');

let cancelCurrentWebSpeech: (() => void) | null = null;

export function useTts() {
  const isNative = Capacitor.isNativePlatform();

  const initialize = async (): Promise<void> => {
    if (!isNative) {
      isInitialized.value = true;
      return;
    }

    try {
      await TextToSpeech.isLanguageSupported({ lang: 'pt-BR' });
      isInitialized.value = true;
    } catch {
      isInitialized.value = false;
    }
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

    const merged = { ...DEFAULT_OPTIONS, ...options };

    if (!isNative) {
      ttsState.value = 'playing';
      await speakWeb(text, merged);
      ttsState.value = 'stopped';
      return;
    }

    if (!isInitialized.value) {
      await initialize();
    }

    if (!isInitialized.value) {
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
    ttsState,
    initialize,
    speak,
    stop,
    pause,
    isSupported,
  };
}

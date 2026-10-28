import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
}));

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: {
    isLanguageSupported: vi.fn(),
    speak: vi.fn(),
    stop: vi.fn(),
  },
}));

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

import { useTts } from './useTts';

const isNativePlatform = vi.mocked(Capacitor.isNativePlatform);
const isLanguageSupported = TextToSpeech.isLanguageSupported as unknown as ReturnType<
  typeof vi.fn<(options: { lang: string }) => Promise<boolean>>
>;
const nativeSpeak = vi.mocked(TextToSpeech.speak);

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('useTts on the web', () => {
  let cancel: ReturnType<typeof vi.fn>;
  let speakSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cancel = vi.fn();
    speakSpy = vi.fn((utterance: FakeUtterance) => {
      queueMicrotask(() => utterance.onend?.());
    });

    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    vi.stubGlobal('speechSynthesis', { cancel, speak: speakSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('cancels the previous speech before speaking', async () => {
    const { speak } = useTts();

    await speak('Olá');

    expect(cancel).toHaveBeenCalled();
    expect(speakSpy).toHaveBeenCalledOnce();
  });

  it('applies the requested rate and pitch', async () => {
    const { speak } = useTts();

    await speak('Olá', { rate: 0.7, pitch: 1.3 });

    const utterance = speakSpy.mock.calls[0][0] as FakeUtterance;
    expect(utterance.lang).toBe('pt-BR');
    expect(utterance.rate).toBe(0.7);
    expect(utterance.pitch).toBe(1.3);
  });

  it('uses the requested locale on the web', async () => {
    const { speak } = useTts();

    await speak('Hello', { lang: 'en-US' });

    const utterance = speakSpy.mock.calls[0][0] as FakeUtterance;
    expect(utterance.lang).toBe('en-US');
  });

  it('resolves only after the utterance ends', async () => {
    let ended = false;
    speakSpy.mockImplementationOnce((utterance: FakeUtterance) => {
      setTimeout(() => {
        ended = true;
        utterance.onend?.();
      }, 5);
    });

    const { speak } = useTts();
    await speak('Olá');

    expect(ended).toBe(true);
  });
});

describe('useTts on native', () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(true);
    isLanguageSupported.mockReset();
    nativeSpeak.mockReset();
    nativeSpeak.mockResolvedValue(undefined);
  });

  afterEach(() => {
    isNativePlatform.mockReturnValue(false);
  });

  it('accepts an exact language match', async () => {
    isLanguageSupported.mockResolvedValue(true);
    const { initialize } = useTts();

    await expect(initialize('es-ES')).resolves.toBe(true);
    expect(isLanguageSupported).toHaveBeenCalledWith({ lang: 'es-ES' });
  });

  it('falls back from locale to base language', async () => {
    isLanguageSupported.mockImplementation(async ({ lang }) => lang === 'en');
    const { initialize, speak } = useTts();

    await expect(initialize('en-US')).resolves.toBe(false);
    await speak('Hello', { lang: 'en-US' });

    expect(nativeSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' })
    );
  });

  it('falls back to pt-BR when no candidate is supported', async () => {
    isLanguageSupported.mockResolvedValue(false);
    const { initialize, speak } = useTts();

    await expect(initialize('en-US')).resolves.toBe(false);
    await speak('Hello', { lang: 'en-US' });

    expect(nativeSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'pt-BR' })
    );
  });
});

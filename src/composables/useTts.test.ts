import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: {
    isLanguageSupported: vi.fn(),
    speak: vi.fn(),
    stop: vi.fn(),
  },
}));

import { useTts } from './useTts';

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

import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, parseSettings } from './settings';

describe('parseSettings', () => {
  it('returns defaults when there is no saved value', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults for invalid JSON', () => {
    expect(parseSettings('{not json')).toEqual(DEFAULT_SETTINGS);
  });

  it('merges a partial saved value with defaults', () => {
    const settings = parseSettings(JSON.stringify({ soundEnabled: false }));

    expect(settings.soundEnabled).toBe(false);
    expect(settings.speechRate).toBe(DEFAULT_SETTINGS.speechRate);
  });

  it('clamps speech rate and pitch to safe ranges', () => {
    const settings = parseSettings(
      JSON.stringify({ speechRate: 5, speechPitch: 0.1 })
    );

    expect(settings.speechRate).toBe(1.5);
    expect(settings.speechPitch).toBe(0.5);
  });

  it('ignores values of the wrong type', () => {
    const settings = parseSettings(
      JSON.stringify({
        speechRate: 'fast',
        soundEnabled: 'yes',
        reduceMotion: 1,
        largeText: null,
        highContrast: 'true',
      })
    );

    expect(settings.speechRate).toBe(DEFAULT_SETTINGS.speechRate);
    expect(settings.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
    expect(settings.reduceMotion).toBe(DEFAULT_SETTINGS.reduceMotion);
    expect(settings.largeText).toBe(DEFAULT_SETTINGS.largeText);
    expect(settings.highContrast).toBe(DEFAULT_SETTINGS.highContrast);
  });

  it('keeps a saved high contrast preference', () => {
    expect(parseSettings(JSON.stringify({ highContrast: true })).highContrast).toBe(
      true
    );
  });

  it('keeps a supported language', () => {
    expect(parseSettings(JSON.stringify({ language: 'en-US' })).language).toBe('en-US');
  });

  it('defaults an invalid or missing language to pt-BR', () => {
    expect(parseSettings(JSON.stringify({ language: 'fr-FR' })).language).toBe('pt-BR');
    expect(parseSettings(JSON.stringify({})).language).toBe('pt-BR');
  });
});

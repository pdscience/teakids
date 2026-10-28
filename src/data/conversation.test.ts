import { describe, expect, it } from 'vitest';
import { getColor, withAlpha } from './conversation';

describe('getColor', () => {
  it('maps named colors to valid hex values', () => {
    expect(getColor('yellow')).toBe('#FFEB3B');
    expect(getColor('black')).toBe('#000000');
  });

  it('keeps an explicit hex color', () => {
    expect(getColor('#0D47A1')).toBe('#0D47A1');
  });

  it('falls back to the default color for unknown values', () => {
    expect(getColor('not-a-color')).toBe('#2196F3');
  });
});

describe('withAlpha', () => {
  it('appends the alpha suffix to a valid hex color', () => {
    expect(withAlpha('#4D94FF', '99')).toBe('#4D94FF99');
  });

  it('resolves named colors before appending the alpha suffix', () => {
    expect(withAlpha('yellow', '99')).toBe('#FFEB3B99');
  });
});

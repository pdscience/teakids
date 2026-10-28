import { describe, expect, it } from 'vitest';
import { addRecent, toggleFavorite } from './favorites';

describe('toggleFavorite', () => {
  it('adds an item that is not a favorite', () => {
    expect(toggleFavorite(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an item that is already a favorite', () => {
    expect(toggleFavorite(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('does not mutate the original list', () => {
    const original = ['a'];
    toggleFavorite(original, 'b');
    expect(original).toEqual(['a']);
  });
});

describe('addRecent', () => {
  it('puts the most recent item first', () => {
    expect(addRecent(['a', 'b'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it('moves an existing item to the front without duplicating it', () => {
    expect(addRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('keeps the list within the limit', () => {
    expect(addRecent(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b']);
  });
});

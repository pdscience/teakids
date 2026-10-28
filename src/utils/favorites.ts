export function toggleFavorite(ids: string[], id: string): string[] {
  if (ids.includes(id)) {
    return ids.filter((item) => item !== id);
  }
  return [...ids, id];
}

export function addRecent(ids: string[], id: string, limit = 20): string[] {
  return [id, ...ids.filter((item) => item !== id)].slice(0, limit);
}

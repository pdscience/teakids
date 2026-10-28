export function buildSentence(labels: string[]): string {
  return labels
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .join(' ');
}

export const trimSummary = (text: string, wordCount = 50): string => {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '\u2026';
};

export const cleanTitle = (title: string): string => {
  return title.trim().replace(/\s+/g, ' ');
};

import { searchByKeyword } from '../utils/newsApi';
import { KeywordDigest } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Fetch articles for each keyword and build KeywordDigest objects.
 * Keywords that return 0 results are omitted from the output.
 * All fetches run in parallel to minimise API round-trip time.
 */
export async function fetchKeywordDigests(
  keywords: string[],
  language: string,
): Promise<KeywordDigest[]> {
  const today = new Date().toISOString().slice(0, 10);

  const results = await Promise.all(
    keywords.map(async (keyword) => {
      const articles = await searchByKeyword(keyword, language);
      if (articles.length === 0) return null;
      const digest: KeywordDigest = {
        id: generateId(),
        date: today,
        keyword,
        articles,
        isRead: false,
        notifiedAt: Date.now(),
      };
      return digest;
    }),
  );

  return results.filter((d): d is KeywordDigest => d !== null);
}

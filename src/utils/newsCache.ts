import { Article } from '../types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  articles: Article[];
  nextPage: string | undefined;
  fetchedAt: number;
}

// Module-level singleton — persists across hook re-mounts (tab switches), resets on app restart
const store = new Map<string, CacheEntry>();

export function getCacheEntry(key: string): CacheEntry | undefined {
  return store.get(key);
}

export function isStale(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS;
}

export function setCacheEntry(
  key: string,
  articles: Article[],
  nextPage: string | undefined,
): void {
  store.set(key, { articles, nextPage, fetchedAt: Date.now() });
}

export function invalidateCacheEntry(key: string): void {
  store.delete(key);
}

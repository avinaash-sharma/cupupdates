import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Article } from '../types';
import { fetchNews } from '../utils/newsApi';
import {
  getCacheEntry,
  isStale,
  setCacheEntry,
  invalidateCacheEntry,
} from '../utils/newsCache';
import { scoreArticle, logScores } from '../utils/scoreArticle';

export interface UseNewsResult {
  articles: Article[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export const useNews = (
  selectedCategories: string[],
  language = 'en',
  scoringCategories: string[] = [],
): UseNewsResult => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextPage, setNextPage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Ref guard prevents concurrent loadMore calls regardless of render-cycle lag
  const isLoadingMoreRef = useRef(false);

  const catsKey = useMemo(
    () => selectedCategories.slice().sort().join(',') + ':' + language,
    [selectedCategories, language],
  );

  const load = useCallback(async () => {
    if (selectedCategories.length === 0) return;

    const cached = getCacheEntry(catsKey);

    if (cached) {
      // Serve cached data immediately — no spinner, instant display
      const cachedRanked = scoringCategories.length > 0
        ? [...cached.articles].sort((a, b) => scoreArticle(b, scoringCategories) - scoreArticle(a, scoringCategories))
        : cached.articles;
      setArticles(cachedRanked);
      setNextPage(cached.nextPage);
      setIsLoading(false);
      setIsError(false);
      // Fresh cache — nothing more to do
      if (!isStale(cached)) return;
      // Stale cache — fall through to background re-fetch (no spinner shown)
    } else {
      // No cache — show loading state
      setIsLoading(true);
      setIsError(false);
      setNextPage(undefined);
      setArticles([]);
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const { articles: fetched, nextPage: np } = await fetchNews(
        selectedCategories,
        undefined,
        ctrl.signal,
        language,
      );

      if (!ctrl.signal.aborted) {
        const ranked = scoringCategories.length > 0
          ? [...fetched].sort((a, b) => scoreArticle(b, scoringCategories) - scoreArticle(a, scoringCategories))
          : fetched;
        if (__DEV__ && scoringCategories.length > 0) logScores(ranked, scoringCategories);
        setArticles(ranked);
        setNextPage(np);
        setCacheEntry(catsKey, ranked, np);
        if (ranked.length === 0 && !cached) setIsError(true);
      }
    } catch {
      // If we had stale cached data, keep showing it — user is unaffected
      if (!ctrl.signal.aborted && !cached) {
        setArticles([]);
        setIsError(true);
      }
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catsKey]);

  // Explicit refresh: bust cache so load() shows spinner and fetches fresh data
  const refresh = useCallback(() => {
    invalidateCacheEntry(catsKey);
    load();
  }, [catsKey, load]);

  const loadMore = useCallback(async () => {
    if (!nextPage || isLoadingMoreRef.current || isLoading) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const { articles: more, nextPage: np } = await fetchNews(
        selectedCategories,
        nextPage,
        undefined,
        language,
      );

      setArticles((prev) => {
        const seenIds = new Set(prev.map((a) => a.id));
        const seenTitles = new Set(
          prev.map((a) => a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)),
        );
        const fresh = more.filter((a) => {
          const titleKey = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
          return !seenIds.has(a.id) && !seenTitles.has(titleKey);
        });
        return [...prev, ...fresh];
      });
      setNextPage(np);
    } catch {
      // silently fail — user still has existing articles
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPage, isLoading, catsKey]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { articles, isLoading, isLoadingMore, isError, refresh, loadMore };
};

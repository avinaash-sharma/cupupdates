import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Article } from '../types';
import { fetchNews } from '../utils/newsApi';

export interface UseNewsResult {
  articles: Article[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export const useNews = (selectedCategories: string[], language = 'en'): UseNewsResult => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextPage, setNextPage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const catsKey = useMemo(
    () => selectedCategories.slice().sort().join(',') + ':' + language,
    [selectedCategories, language],
  );

  const load = useCallback(async () => {
    if (selectedCategories.length === 0) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setIsError(false);
    setNextPage(undefined);
    setArticles([]);

    try {
      const { articles: fetched, nextPage: np } = await fetchNews(
        selectedCategories,
        undefined,
        ctrl.signal,
        language,
      );

      if (!ctrl.signal.aborted) {
        setArticles(fetched);
        setNextPage(np);
        if (fetched.length === 0) setIsError(true);
      }
    } catch {
      if (!ctrl.signal.aborted) {
        setArticles([]);
        setIsError(true);
      }
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catsKey]);

  const loadMore = useCallback(async () => {
    if (!nextPage || isLoadingMore || isLoading) return;

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
        const fresh = more.filter((a) => !seenIds.has(a.id));
        return [...prev, ...fresh];
      });
      setNextPage(np);
    } catch {
      // silently fail — user still has existing articles
    } finally {
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPage, isLoadingMore, isLoading, catsKey]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { articles, isLoading, isLoadingMore, isError, refresh: load, loadMore };
};

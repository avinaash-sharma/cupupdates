import { useState, useCallback, useRef } from 'react';
import { searchNews } from '../utils/newsApi';
import { Article } from '../types';
import { posthog } from '../posthog';

export const useSearch = (language: string) => {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState<Article[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError]           = useState(false);
  const nextPageRef                     = useRef<string | undefined>();
  const abortRef                        = useRef<AbortController | null>(null);
  const debounceRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsError(false);
      nextPageRef.current = undefined;
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setIsError(false);
    nextPageRef.current = undefined;

    try {
      const { articles, nextPage } = await searchNews(
        q.trim(),
        language,
        undefined,
        abortRef.current.signal,
      );
      setResults(articles);
      nextPageRef.current = nextPage;
      posthog.capture('search_performed', { query: q.trim(), results_count: articles.length });
    } catch (err: any) {
      if (err?.name !== 'AbortError') setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 500);
  }, [runSearch]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    setResults([]);
    setIsError(false);
    setIsLoading(false);
    nextPageRef.current = undefined;
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextPageRef.current || isLoadingMore || !query.trim()) return;
    const page = nextPageRef.current;
    setIsLoadingMore(true);
    try {
      const { articles, nextPage } = await searchNews(query.trim(), language, page);
      setResults((prev) => [...prev, ...articles]);
      nextPageRef.current = nextPage;
    } catch {
      // silent fail on load-more
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, query, language]);

  return {
    query,
    handleQueryChange,
    clear,
    results,
    isLoading,
    isLoadingMore,
    isError,
    loadMore,
  };
};

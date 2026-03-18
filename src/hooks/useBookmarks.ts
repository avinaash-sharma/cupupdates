import { useState, useEffect, useCallback } from 'react';
import { Article } from '../types';
import { getBookmarks, saveBookmarks } from '../utils/storage';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  useEffect(() => {
    getBookmarks().then(setBookmarks);
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks],
  );

  const toggleBookmark = useCallback((article: Article) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === article.id);
      const next = exists
        ? prev.filter((b) => b.id !== article.id)
        : [article, ...prev];
      saveBookmarks(next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
};

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Article, DEFAULT_CATEGORY } from '../types';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../context/ThemeContext';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';
import { CategoryChips } from '../components/CategoryChips';
import { GreetingHeader } from '../components/GreetingHeader';
import { InterstitialAd } from '../components/InterstitialAd';
import { EmptyState } from '../components/EmptyState';

const INTERSTITIAL_INTERVAL = 5;

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const { selectedCategories, userName, prefsLoaded } = useSettings();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // ── Data source: per-category fetch for specific tabs, all-selected for "All" ──
  const categoriesToFetch = useMemo(() => {
    if (!prefsLoaded) return [];
    if (activeCategory === DEFAULT_CATEGORY) return selectedCategories;
    return [activeCategory];
  }, [prefsLoaded, activeCategory, selectedCategories]);

  const { articles, isLoading, isLoadingMore, isError, refresh, loadMore } =
    useNews(categoriesToFetch);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  // ── Chips: All + user's selected categories ──
  const chipCategories = useMemo(
    () => [DEFAULT_CATEGORY, ...selectedCategories],
    [selectedCategories],
  );

  // ── Category change: reset index + new fetch is triggered via categoriesToFetch ──
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  }, []);

  // ── Swipe forward (up) ──
  const handleSwipe = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next < articles.length ? next : prev;
    });
    setSwipeCount((prev) => {
      const next = prev + 1;
      if (next % INTERSTITIAL_INTERVAL === 0) setShowInterstitial(true);
      return next;
    });
  }, [articles.length]);

  // ── Swipe back (down) ──
  const handleSwipeBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // ── Pull-to-refresh (swipe down at index 0) ──
  const handleRefresh = useCallback(() => {
    setCurrentIndex(0);
    refresh();
  }, [refresh]);

  // ── Trigger loadMore when approaching the end ──
  const prevIndexRef = useRef(-1);
  if (currentIndex !== prevIndexRef.current) {
    prevIndexRef.current = currentIndex;
    if (!isLoadingMore && currentIndex >= articles.length - 5) {
      loadMore();
    }
  }

  const renderCard = useCallback(
    (article: Article) => (
      <NewsCard
        article={article}
        isBookmarked={isBookmarked(article.id)}
        onToggleBookmark={() => toggleBookmark(article)}
      />
    ),
    [isBookmarked, toggleBookmark],
  );

  const showSpinner = !prefsLoaded || isLoading;
  const showDeck = !showSpinner && articles.length > 0;
  const showEmpty = !showSpinner && articles.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        {showDeck && (
          <SwipeDeck
            articles={articles}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
            onSwipeBack={handleSwipeBack}
            onRefresh={handleRefresh}
            renderCard={renderCard}
          />
        )}
        {showSpinner && (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
        {showEmpty && (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <EmptyState isError={isError} onRetry={refresh} />
          </View>
        )}
      </View>

      <View
        style={[
          styles.headerBox,
          {
            paddingTop: insets.top,
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <GreetingHeader userName={userName} />
        <CategoryChips
          categories={chipCategories}
          selected={activeCategory}
          onSelect={handleCategoryChange}
        />
      </View>

      <InterstitialAd visible={showInterstitial} onClose={() => setShowInterstitial(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBox: { borderBottomWidth: StyleSheet.hairlineWidth },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

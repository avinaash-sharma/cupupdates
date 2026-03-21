import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Article, DEFAULT_CATEGORY, TRENDING_CATEGORY } from '../types';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSettings } from '../hooks/useSettings';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';
import { CategoryChips } from '../components/CategoryChips';
import { GreetingHeader } from '../components/GreetingHeader';
import { InterstitialAd } from '../components/InterstitialAd';
import { EmptyState } from '../components/EmptyState';
import { scoreArticle } from '../utils/scoreArticle';

const INTERSTITIAL_INTERVAL = 5;

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(TRENDING_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
  const swipeCountRef = useRef(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const { selectedCategories, userName, prefsLoaded, language } = useSettings();
  const insets = useSafeAreaInsets();

  // ── Per-category fetch: specific tab → fetch only that; All → fetch all selected ──
  const categoriesToFetch = useMemo(() => {
    if (!prefsLoaded) return [];
    if (activeCategory === TRENDING_CATEGORY) return ['Top'];
    if (activeCategory === DEFAULT_CATEGORY) return selectedCategories;
    return [activeCategory];
  }, [prefsLoaded, activeCategory, selectedCategories]);

  const { articles, isLoading, isLoadingMore, isError, refresh, loadMore } =
    useNews(categoriesToFetch, language, selectedCategories);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  const chipCategories = useMemo(
    () => [TRENDING_CATEGORY, DEFAULT_CATEGORY, ...selectedCategories],
    [selectedCategories],
  );

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  }, []);

  const handleSwipe = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next < articles.length) {
        const a = articles[next];
        if (__DEV__) {
          const score = scoreArticle(a, selectedCategories);
          console.log(
            `[Swipe] #${next + 1}/${articles.length}  score=${score}`,
            `| ${a.category} | ${a.source} | ${a.title.slice(0, 50)}`,
          );
        }
        return next;
      }
      return prev;
    });
    if (!hasSwipedOnce) setHasSwipedOnce(true);
    swipeCountRef.current += 1;
    if (swipeCountRef.current % INTERSTITIAL_INTERVAL === 0) setShowInterstitial(true);
  }, [articles, selectedCategories, hasSwipedOnce]);

  const handleSwipeBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleRefresh = useCallback(() => {
    setCurrentIndex(0);
    refresh();
  }, [refresh]);

  // ── Trigger loadMore near the end ──
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

  const currentArticle = articles[currentIndex];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <GreetingHeader userName={userName} />
      <CategoryChips
        categories={chipCategories}
        selected={activeCategory}
        onSelect={handleCategoryChange}
      />

      {/* ── Card container — rounds and clips the SwipeDeck ── */}
      <View style={styles.cardContainer}>
        {/* Explicit bg layer — workaround for iOS overflow:hidden+borderRadius bg bug */}
        <View style={[StyleSheet.absoluteFill, styles.cardBg]} pointerEvents="none" />
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
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
          </View>
        )}
        {showEmpty && (
          <View style={styles.centered}>
            <EmptyState isError={isError} onRetry={refresh} />
          </View>
        )}
      </View>

      {/* ── Bottom controls — outside card ── */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.swipeHint, hasSwipedOnce && styles.swipeHintHidden]}>
          <Ionicons name="arrow-up" size={16} color="rgba(255,255,255,0.3)" />
          <Text style={styles.swipeLabel}>SWIPE UP</Text>
        </View>

        {showDeck && (
          <Text style={styles.positionText}>
            {currentIndex + 1} / {articles.length}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
          onPress={() => { if (currentArticle?.url) WebBrowser.openBrowserAsync(currentArticle.url); }}
        >
          <Text style={styles.readBtnText}>Read Full Story</Text>
          <Ionicons name="arrow-forward" size={15} color="#ffffff" />
        </Pressable>
      </View>

      <InterstitialAd visible={showInterstitial} onClose={() => setShowInterstitial(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },
  cardBg: {
    backgroundColor: '#111',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  swipeHint: {
    alignItems: 'center',
    gap: 3,
  },
  swipeHintHidden: {
    opacity: 0,
  },
  swipeLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  positionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
  },
  readBtnPressed: {
    backgroundColor: '#4338ca',
    transform: [{ scale: 0.97 }],
  },
  readBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

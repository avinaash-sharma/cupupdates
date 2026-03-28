import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useWebView } from '../context/WebViewContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Article, DEFAULT_CATEGORY, TRENDING_CATEGORY } from '../types';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSettings } from '../hooks/useSettings';
import { useNotifications } from '../hooks/useNotifications';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';
import { CategoryChips } from '../components/CategoryChips';
import { GreetingHeader } from '../components/GreetingHeader';
import { InterstitialAd } from '../components/InterstitialAd';
import { EmptyState } from '../components/EmptyState';
import { SearchScreen } from './SearchScreen';
import { NotificationHistoryScreen } from './NotificationHistoryScreen';
import { scoreArticle } from '../utils/scoreArticle';
import { useTranslation } from '../i18n/useTranslation';
import { posthog } from '../posthog';

const INTERSTITIAL_INTERVAL = 5;

type HomeRouteProp = RouteProp<{ Home: { openNotifications?: boolean } }, 'Home'>;

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(TRENDING_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
  const swipeCountRef = useRef(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const t = useTranslation();
  const route = useRoute<HomeRouteProp>();
  const navigation = useNavigation();

  const { selectedCategories, userName, prefsLoaded, language } = useSettings();
  const { history, unreadCount, checkOnOpen, markRead } = useNotifications();
  const { openUrl } = useWebView();
  const insets = useSafeAreaInsets();

  // On-open keyword digest check
  useEffect(() => {
    if (prefsLoaded) {
      checkOnOpen();
    }
  }, [prefsLoaded, checkOnOpen]);

  // Open notification history when app was launched via a notification tap
  useEffect(() => {
    if (route.params?.openNotifications) {
      setShowNotifications(true);
      navigation.setParams({ openNotifications: undefined } as never);
    }
  }, [route.params?.openNotifications]);

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
    posthog.capture('category_selected', { category: cat });
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
    const swiped = articles[swipeCountRef.current - 1];
    if (swiped) {
      posthog.capture('article_swiped', {
        category: swiped.category,
        source: swiped.source,
        swipe_count: swipeCountRef.current,
      });
    }
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
      <GreetingHeader
        userName={userName}
        onSearchPress={() => setShowSearch(true)}
        onBellPress={() => setShowNotifications(true)}
        unreadCount={unreadCount}
      />
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
          <Text style={styles.swipeLabel}>{t.home.swipeUp}</Text>
        </View>

        {showDeck && (
          <Text style={styles.positionText}>
            {currentIndex + 1} / {articles.length}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
          onPress={() => {
            if (currentArticle?.url) {
              openUrl(currentArticle.url);
              posthog.capture('article_read', {
                category: currentArticle.category,
                source: currentArticle.source,
                screen: 'home',
              });
            }
          }}
        >
          <Text style={styles.readBtnText}>{t.home.readFullStory}</Text>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      <InterstitialAd visible={showInterstitial} onClose={() => setShowInterstitial(false)} />

      <SearchScreen
        visible={showSearch}
        language={language}
        onClose={() => setShowSearch(false)}
      />

      <NotificationHistoryScreen
        visible={showNotifications}
        history={history}
        onClose={() => setShowNotifications(false)}
        onMarkRead={markRead}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },
  cardBg: {
    backgroundColor: '#111113',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    backgroundColor: '#111113',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111113',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  swipeHint: {
    alignItems: 'center',
    gap: 3,
  },
  swipeHintHidden: {
    opacity: 0,
  },
  swipeLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  positionText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '500',
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 28,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  readBtnPressed: {
    backgroundColor: '#222228',
    transform: [{ scale: 0.97 }],
  },
  readBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

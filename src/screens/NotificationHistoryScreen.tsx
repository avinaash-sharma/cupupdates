import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Article, KeywordDigest } from '../types';
import { DigestDayGroup } from '../components/DigestDayGroup';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';
import { useBookmarks } from '../hooks/useBookmarks';
import { useWebView } from '../context/WebViewContext';

interface NotificationHistoryScreenProps {
  visible: boolean;
  history: KeywordDigest[];
  onClose: () => void;
  onMarkRead: (ids: string[]) => void;
}

export const NotificationHistoryScreen: React.FC<NotificationHistoryScreenProps> = ({
  visible,
  history,
  onClose,
  onMarkRead,
}) => {
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { openUrl } = useWebView();

  // Card viewer state — null means list mode
  const [cardView, setCardView] = useState<{
    digest: KeywordDigest;
    startIndex: number;
  } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);

  const handleArticlePress = useCallback((article: Article, digest: KeywordDigest) => {
    const startIndex = digest.articles.findIndex((a) => a.id === article.id);
    setCardView({ digest, startIndex: Math.max(startIndex, 0) });
    setCardIndex(Math.max(startIndex, 0));
  }, []);

  const handleCloseCardView = useCallback(() => {
    setCardView(null);
    setCardIndex(0);
  }, []);

  const handleSwipe = useCallback(() => {
    setCardIndex((prev) => {
      if (!cardView) return prev;
      return prev + 1 < cardView.digest.articles.length ? prev + 1 : prev;
    });
  }, [cardView]);

  const handleSwipeBack = useCallback(() => {
    setCardIndex((prev) => Math.max(prev - 1, 0));
  }, []);

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

  // Group digests by date, sort dates descending (newest first)
  const grouped = useMemo<[string, KeywordDigest[]][]>(() => {
    const map: Record<string, KeywordDigest[]> = {};
    for (const digest of history) {
      if (!map[digest.date]) map[digest.date] = [];
      map[digest.date].push(digest);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [history]);

  const isEmpty = grouped.length === 0;
  const currentArticle = cardView?.digest.articles[cardIndex];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cardView ? handleCloseCardView : onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.root, { paddingTop: insets.top }]}>

          {/* ── CARD VIEWER MODE ─────────────────────────────── */}
          {cardView ? (
            <>
              {/* Card viewer header */}
              <View style={styles.header}>
                <Pressable
                  onPress={handleCloseCardView}
                  style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                  hitSlop={8}
                >
                  <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
                </Pressable>

                <View style={styles.cardViewerPill}>
                  <Text style={styles.cardViewerPillText}>{cardView.digest.keyword}</Text>
                </View>

                <Text style={styles.cardViewerCounter}>
                  {cardIndex + 1} / {cardView.digest.articles.length}
                </Text>
              </View>

              {/* Swipe deck */}
              <View style={styles.cardContainer}>
                <View style={[StyleSheet.absoluteFill, styles.cardBg]} pointerEvents="none" />
                <SwipeDeck
                  articles={cardView.digest.articles}
                  currentIndex={cardIndex}
                  onSwipe={handleSwipe}
                  onSwipeBack={handleSwipeBack}
                  renderCard={renderCard}
                />
              </View>

              {/* Bottom controls */}
              <View style={[styles.cardControls, { paddingBottom: insets.bottom + 8 }]}>
                <Text style={styles.positionText} />
                <Pressable
                  style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
                  onPress={() => {
                    if (currentArticle?.url) openUrl(currentArticle.url);
                  }}
                >
                  <Text style={styles.readBtnText}>Read Full Story</Text>
                  <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>
            </>
          ) : (
            /* ── DIGEST LIST MODE ──────────────────────────────── */
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Keyword Digest</Text>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color="rgba(255,255,255,0.75)" />
                </Pressable>
              </View>

              {isEmpty ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔔</Text>
                  <Text style={styles.emptyTitle}>No digests yet</Text>
                  <Text style={styles.emptyDesc}>
                    Add keywords during setup or in Settings to track topics and receive daily digests.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {grouped.map(([date, digests]) => (
                    <DigestDayGroup
                      key={date}
                      date={date}
                      digests={digests}
                      onVisible={onMarkRead}
                      onArticlePress={handleArticlePress}
                    />
                  ))}
                  <View style={{ height: 40 }} />
                </ScrollView>
              )}
            </>
          )}

        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Card viewer ──
  cardViewerPill: {
    flex: 1,
    alignItems: 'center',
  },
  cardViewerPillText: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: '700',
  },
  cardViewerCounter: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '500',
    minWidth: 44,
    textAlign: 'right',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    backgroundColor: '#111113',
  },
  cardBg: {
    backgroundColor: '#111113',
  },
  cardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  positionText: {
    flex: 1,
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

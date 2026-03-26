import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getBookmarks, saveBookmarks } from '../utils/storage';
import { Article } from '../types';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';

export const BookmarksScreen: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [viewMode, setViewMode]   = useState<'list' | 'card'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndexRef = useRef(-1);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Reload every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, []),
  );

  // Clamp index if a bookmark is removed while in card view
  useEffect(() => {
    if (currentIndex >= bookmarks.length && bookmarks.length > 0) {
      setCurrentIndex(bookmarks.length - 1);
    }
  }, [bookmarks.length]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const handleSwipe = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 < bookmarks.length ? prev + 1 : prev));
  }, [bookmarks.length]);

  const handleSwipeBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleToggleView = useCallback(() => {
    setViewMode((v) => {
      if (v === 'list') {
        setCurrentIndex(0);
        prevIndexRef.current = -1;
        return 'card';
      }
      return 'list';
    });
  }, []);

  const renderCard = useCallback(
    (article: Article) => (
      <NewsCard
        article={article}
        isBookmarked={true}
        onToggleBookmark={() => removeBookmark(article.id)}
      />
    ),
    [removeBookmark],
  );

  // ── List view row ──────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Article }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.source, { color: colors.subtext }]}>{item.source}</Text>
          <TouchableOpacity
            onPress={() => removeBookmark(item.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.readMoreRow}
          onPress={() => WebBrowser.openBrowserAsync(item.url)}
        >
          <Text style={styles.readMore}>Read More</Text>
          <Ionicons name="arrow-forward" size={13} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentArticle = bookmarks[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Bookmarks</Text>
          <Text style={[styles.headerCount, { color: colors.subtext }]}>{bookmarks.length} saved</Text>
        </View>

        {bookmarks.length > 0 && (
          <Pressable
            onPress={handleToggleView}
            style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnPressed]}
            hitSlop={8}
          >
            <Ionicons
              name={viewMode === 'list' ? 'albums-outline' : 'list-outline'}
              size={20}
              color="rgba(255,255,255,0.75)"
            />
          </Pressable>
        )}
      </View>

      {/* ── Empty state ── */}
      {bookmarks.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color="rgba(255,255,255,0.18)" style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.subtext }]}>
            Tap the heart icon on any article to save it here.
          </Text>
        </View>
      )}

      {/* ── LIST VIEW ── */}
      {bookmarks.length > 0 && viewMode === 'list' && (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* ── CARD VIEW ── */}
      {bookmarks.length > 0 && viewMode === 'card' && (
        <>
          <View style={styles.cardContainer}>
            <View style={[StyleSheet.absoluteFill, styles.cardBg]} pointerEvents="none" />
            <SwipeDeck
              articles={bookmarks}
              currentIndex={currentIndex}
              onSwipe={handleSwipe}
              onSwipeBack={handleSwipeBack}
              renderCard={renderCard}
            />
          </View>

          <View style={[styles.cardControls, { paddingBottom: insets.bottom + 8 }]}>
            <Text style={styles.positionText}>
              {currentIndex + 1} / {bookmarks.length}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
              onPress={() => {
                if (currentArticle?.url) WebBrowser.openBrowserAsync(currentArticle.url);
              }}
            >
              <Text style={styles.readBtnText}>Read Full Story</Text>
              <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerCount: {
    fontSize: 13,
    marginTop: 2,
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ── Empty ──
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── List view ──
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '600',
  },

  // ── Card view ──
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
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

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Article } from '../types';
import { useSearch } from '../hooks/useSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { SwipeDeck } from '../components/SwipeDeck';
import { NewsCard } from '../components/NewsCard';
import { timeAgo } from '../utils/timeAgo';

interface SearchScreenProps {
  visible: boolean;
  language: string;
  onClose: () => void;
}

// ── Result row (list view) ────────────────────────────────────────────────────
const SearchResultRow: React.FC<{
  article: Article;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}> = ({ article, isBookmarked, onToggleBookmark }) => {
  const handlePress = useCallback(() => {
    if (article.url) WebBrowser.openBrowserAsync(article.url);
  }, [article.url]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
    >
      <View style={styles.rowBody}>
        <View style={styles.rowMeta}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.metaText} numberOfLines={1}>
            {article.source}{'  ·  '}{timeAgo(article.publishedAt)}
          </Text>
        </View>

        <Text style={styles.rowTitle} numberOfLines={3}>
          {article.title}
        </Text>

        {!!article.summary && (
          <Text style={styles.rowSummary} numberOfLines={2}>
            {article.summary}
          </Text>
        )}
      </View>

      <Pressable
        onPress={onToggleBookmark}
        hitSlop={12}
        style={({ pressed }) => [styles.bookmarkBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons
          name={isBookmarked ? 'heart' : 'heart-outline'}
          size={18}
          color={isBookmarked ? '#ff3b5c' : 'rgba(255,255,255,0.4)'}
        />
      </Pressable>
    </Pressable>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export const SearchScreen: React.FC<SearchScreenProps> = ({ visible, language, onClose }) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const { query, handleQueryChange, clear, results, isLoading, isLoadingMore, isError, loadMore } =
    useSearch(language);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndexRef = useRef(-1);

  // Reset card index whenever the query changes (new search)
  useEffect(() => {
    setCurrentIndex(0);
    prevIndexRef.current = -1;
  }, [query]);

  // Load-more trigger for card mode — fires when within 5 cards of the end
  if (viewMode === 'card' && currentIndex !== prevIndexRef.current) {
    prevIndexRef.current = currentIndex;
    if (!isLoadingMore && currentIndex >= results.length - 5) {
      loadMore();
    }
  }

  const handleSwipe = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
  }, [results.length]);

  const handleSwipeBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleToggleView = useCallback(() => {
    Keyboard.dismiss();
    setViewMode((v) => {
      if (v === 'list') {
        setCurrentIndex(0);
        prevIndexRef.current = -1;
        return 'card';
      }
      return 'list';
    });
  }, []);

  const handleClose = useCallback(() => {
    clear();
    setViewMode('list');
    setCurrentIndex(0);
    onClose();
  }, [clear, onClose]);

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

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <SearchResultRow
        article={item}
        isBookmarked={isBookmarked(item.id)}
        onToggleBookmark={() => toggleBookmark(item)}
      />
    ),
    [isBookmarked, toggleBookmark],
  );

  const renderListEmpty = () => {
    if (isLoading) return null;
    if (!query.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.12)" />
          <Text style={styles.emptyText}>Search for any topic, person, or event</Text>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.12)" />
          <Text style={styles.emptyText}>Something went wrong. Try again.</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="file-tray-outline" size={40} color="rgba(255,255,255,0.12)" />
        <Text style={styles.emptyText}>No results for "{query}"</Text>
      </View>
    );
  };

  const currentArticle = results[currentIndex];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={() => setTimeout(() => inputRef.current?.focus(), 100)}
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' && viewMode === 'list' ? 'padding' : undefined}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={17} color="rgba(255,255,255,0.35)" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Search news…"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={query}
              onChangeText={handleQueryChange}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <Pressable onPress={() => handleQueryChange('')} hitSlop={10}>
                <Ionicons name="close-circle" size={17} color="rgba(255,255,255,0.3)" />
              </Pressable>
            )}
          </View>

          {/* View mode toggle — only when there are results */}
          {results.length > 0 && (
            <Pressable
              onPress={handleToggleView}
              style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnPressed]}
              hitSlop={8}
            >
              <Ionicons
                name={viewMode === 'list' ? 'albums-outline' : 'list-outline'}
                size={19}
                color="rgba(255,255,255,0.75)"
              />
            </Pressable>
          )}

          <Pressable onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        {/* ── LIST VIEW ── */}
        {viewMode === 'list' && (
          <>
            {isLoading && (
              <View style={styles.loadingBar}>
                <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              </View>
            )}
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListEmptyComponent={renderListEmpty}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.loadMoreSpinner}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
                  </View>
                ) : null
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={results.length === 0 ? styles.flatListEmpty : styles.flatList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </>
        )}

        {/* ── CARD VIEW ── */}
        {viewMode === 'card' && (
          <>
            <View style={styles.cardContainer}>
              <View style={[StyleSheet.absoluteFill, styles.cardBg]} pointerEvents="none" />

              {results.length > 0 && (
                <SwipeDeck
                  articles={results}
                  currentIndex={currentIndex}
                  onSwipe={handleSwipe}
                  onSwipeBack={handleSwipeBack}
                  renderCard={renderCard}
                />
              )}

              {/* Spinner while first load */}
              {isLoading && results.length === 0 && (
                <View style={styles.cardCentered}>
                  <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
                </View>
              )}

              {/* Empty / error in card mode */}
              {!isLoading && results.length === 0 && (
                <View style={styles.cardCentered}>
                  <Ionicons
                    name={isError ? 'cloud-offline-outline' : 'file-tray-outline'}
                    size={40}
                    color="rgba(255,255,255,0.12)"
                  />
                  <Text style={styles.emptyText}>
                    {isError ? 'Something went wrong.' : query.trim() ? `No results for "${query}"` : 'Search something above'}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom controls */}
            <View style={[styles.cardControls, { paddingBottom: insets.bottom + 8 }]}>
              {/* Position counter */}
              <Text style={styles.positionText}>
                {results.length > 0 ? `${currentIndex + 1} / ${results.length}${isLoadingMore ? ' …' : ''}` : ''}
              </Text>

              {/* Read full story */}
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
      </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '400',
    padding: 0,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── List view ──
  loadingBar: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  flatList: {
    paddingBottom: 40,
  },
  flatListEmpty: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(79,70,229,0.70)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metaText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  rowTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    lineHeight: 21,
  },
  rowSummary: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    lineHeight: 17,
  },
  bookmarkBtn: {
    paddingTop: 2,
  },
  loadMoreSpinner: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // ── Shared empty/error ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  cardCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
    minWidth: 60,
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

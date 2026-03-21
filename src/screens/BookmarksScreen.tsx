import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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

export const BookmarksScreen: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Reload every time the tab is focused so additions from HomeScreen are reflected
  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, []),
  );

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveBookmarks(next);
      return next;
    });
  };

  const renderItem = ({ item }: { item: Article }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.source, { color: colors.subtext }]}>
            {item.source}
          </Text>
          <TouchableOpacity
            onPress={() => removeBookmark(item.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <TouchableOpacity style={styles.readMoreRow} onPress={() => WebBrowser.openBrowserAsync(item.url)}>
          <Text style={styles.readMore}>Read More</Text>
          <Ionicons name="arrow-forward" size={13} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bookmarks
        </Text>
        <Text style={[styles.headerCount, { color: colors.subtext }]}>
          {bookmarks.length} saved
        </Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color="rgba(255,255,255,0.18)" style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No bookmarks yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.subtext }]}>
            Tap the heart icon on any article to save it here.
          </Text>
        </View>
      ) : (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
});

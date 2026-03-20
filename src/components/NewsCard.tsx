import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Article } from '../types';
import { ShimmerBackground } from './ShimmerBackground';

interface NewsCardProps {
  article: Article;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const NewsCardInner: React.FC<NewsCardProps> = ({
  article,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = !!article.imageUrl && !imgError;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base shimmer — always present */}
      <ShimmerBackground />

      {/* Image — top 62% only, no aggressive zoom */}
      {showImage && (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient: fully clear at top, smooth fade into dark text zone */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(8,8,8,0.45)',
          'rgba(8,8,8,0.88)',
          'rgba(8,8,8,0.98)',
          '#080808',
        ]}
        locations={[0, 0.32, 0.50, 0.62, 0.72, 0.82]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Bookmark — top right */}
      <Pressable
        style={({ pressed }) => [styles.bookmarkBtn, pressed && styles.bookmarkBtnPressed]}
        onPress={onToggleBookmark}
        hitSlop={10}
      >
        <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconSaved]}>
          {isBookmarked ? '♥' : '♡'}
        </Text>
      </Pressable>

      {/* Content — anchored to bottom, sits in the dark zone */}
      <View style={styles.content}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>
      </View>
    </View>
  );
};

export const NewsCard = memo(NewsCardInner);

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 0.9 }],
  },
  bookmarkIcon: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
  },
  bookmarkIconSaved: {
    color: '#ff3b5c',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 16,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(79,70,229,0.80)',
    marginBottom: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 32,
    marginBottom: 10,
  },
  summary: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

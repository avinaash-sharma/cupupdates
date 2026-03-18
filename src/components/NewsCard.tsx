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

      {/* Full-bleed image */}
      {showImage && (
        <Image
          source={{ uri: article.imageUrl }}
          style={[StyleSheet.absoluteFill, styles.image]}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient: image visible at top, fades to dark from ~32% down */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(10,10,10,0.75)',
          'rgba(10,10,10,0.97)',
          '#0a0a0a',
        ]}
        locations={[0, 0.20, 0.45, 0.65, 0.80]}
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

      {/* Content — anchored to bottom */}
      <View style={styles.content}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={3}>
          {article.summary}
        </Text>
      </View>
    </View>
  );
};

export const NewsCard = memo(NewsCardInner);

const styles = StyleSheet.create({
  image: {
    transform: [{ scale: 1.05 }],
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 0.9 }],
  },
  bookmarkIcon: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
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
    paddingBottom: 24,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 10,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 35,
    marginBottom: 10,
  },
  summary: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 21,
  },
});

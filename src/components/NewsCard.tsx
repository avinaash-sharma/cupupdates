import React, { useState, memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Article } from '../types';
import { ShimmerBackground } from './ShimmerBackground';
import { timeAgo } from '../utils/timeAgo';

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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const showImage = !!article.imageUrl && !imgError;

  // Reset per-image state when the article changes
  useEffect(() => {
    setImgError(false);
    setIsImageLoaded(false);
  }, [article.imageUrl]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: article.title,
        message: Platform.OS === 'ios' ? article.title : `${article.title}\n\n${article.url}`,
        url: article.url,          // iOS only
      });
    } catch {
      // user dismissed or share unavailable — silent fail
    }
  }, [article.title, article.url]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Image container — dark base handles letterbox; shimmer shown while loading */}
      <View style={styles.imageContainer}>
        {showImage && !isImageLoaded && <ShimmerBackground />}
        {showImage && (
          <Image
            key={article.imageUrl}
            source={{ uri: article.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </View>

      {/* Gradient: fully clear at top, smooth fade into dark text zone */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(8,8,8,0.35)',
          'rgba(8,8,8,0.82)',
          'rgba(8,8,8,0.97)',
          '#080808',
        ]}
        locations={[0, 0.28, 0.44, 0.57, 0.68, 0.78]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Action buttons — vertical stack, top right */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={onToggleBookmark}
          hitSlop={10}
        >
          <Ionicons
            name={isBookmarked ? 'heart' : 'heart-outline'}
            size={20}
            color={isBookmarked ? '#ff3b5c' : 'rgba(255,255,255,0.88)'}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={handleShare}
          hitSlop={10}
        >
          <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.88)" />
        </Pressable>
      </View>

      {/* Content — anchored to bottom, sits in the dark zone */}
      <View style={styles.content}>
        <View style={styles.pillRow}>
          {article.isBreaking && (
            <View style={styles.breakingPill}>
              <Text style={styles.breakingText}>🔴 BREAKING</Text>
            </View>
          )}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>

        <Text style={styles.sourceMeta}>
          {article.source}{'  ·  '}{timeAgo(article.publishedAt)}
        </Text>
      </View>
    </View>
  );
};

export const NewsCard = memo(NewsCardInner);

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 0.9 }],
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  breakingPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(220,38,38,0.85)',
  },
  breakingText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(79,70,229,0.80)',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  sourceMeta: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 16,
    letterSpacing: 0.2,
  },
  title: {
    color: '#ffffff',
    fontSize: 23,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 33,
    marginBottom: 14,
  },
  summary: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
});

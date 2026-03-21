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
        url: article.url, // iOS only
      });
    } catch {
      // user dismissed or share unavailable — silent fail
    }
  }, [article.title, article.url]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Image container — cover mode fills frame; shimmer shown while loading */}
      <View style={styles.imageContainer}>
        {showImage && !isImageLoaded && <ShimmerBackground />}
        {showImage && (
          <Image
            key={article.imageUrl}
            source={{ uri: article.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </View>

      {/* Top vignette — darkens top edge so action buttons stay readable */}
      <LinearGradient
        colors={['rgba(5,5,5,0.72)', 'rgba(5,5,5,0.22)', 'transparent']}
        locations={[0, 0.16, 0.36]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Bottom gradient — pulls image into the dark content zone */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(5,5,5,0.45)',
          'rgba(5,5,5,0.88)',
          'rgba(5,5,5,0.97)',
          '#080808',
        ]}
        locations={[0, 0.32, 0.48, 0.60, 0.70, 0.80]}
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
            size={19}
            color={isBookmarked ? '#ff3b5c' : 'rgba(255,255,255,0.9)'}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={handleShare}
          hitSlop={10}
        >
          <Ionicons name="share-outline" size={19} color="rgba(255,255,255,0.9)" />
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
    height: '62%',
    backgroundColor: '#111113',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.05 }],
  },
  actions: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ scale: 0.9 }],
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 20,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  breakingPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(220,38,38,0.85)',
  },
  breakingText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  categoryPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(79,70,229,0.80)',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 10,
  },
  summary: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  sourceMeta: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 14,
    letterSpacing: 0.4,
  },
});

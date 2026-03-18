import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Share,
  Linking,
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

  const handleShare = async () => {
    try {
      await Share.share({ message: article.title, url: article.url });
    } catch {}
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Shimmer is always the base layer — visible while image loads or when missing */}
      <ShimmerBackground />

      {/* Photo sits on top of shimmer; shimmer shows through on load or error */}
      {showImage && (
        <Image
          source={{ uri: article.imageUrl }}
          style={[StyleSheet.absoluteFill, styles.image]}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Top scrim — keeps action buttons legible */}
      <LinearGradient
        colors={['rgba(0,0,0,0.54)', 'rgba(0,0,0,0.18)', 'transparent']}
        locations={[0, 0.22, 0.52]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Bottom fill — keeps text legible */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)', 'rgba(0,0,0,1)']}
        locations={[0.22, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Action buttons ── */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={onToggleBookmark}
          hitSlop={8}
        >
          <Text style={[styles.actionIcon, isBookmarked && styles.iconSaved]}>
            {isBookmarked ? '♥' : '♡'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={handleShare}
          hitSlop={8}
        >
          <Text style={styles.actionIcon}>↗</Text>
        </Pressable>
      </View>

      {/* ── Content — pinned to bottom ── */}
      <View style={styles.content}>
        <Text style={styles.source} numberOfLines={1}>
          {article.source.toUpperCase()}
        </Text>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={3}>
          {article.summary}
        </Text>

        <View style={styles.footer}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
            onPress={() => Linking.openURL(article.url)}
          >
            <Text style={styles.readBtnText}>Read Story  →</Text>
          </Pressable>
        </View>

        <View style={styles.swipeHint}>
          <Text style={styles.swipeChevron}>↑</Text>
        </View>
      </View>
    </View>
  );
};

export const NewsCard = memo(NewsCardInner);

const styles = StyleSheet.create({
  actions: {
    position: 'absolute',
    right: 18,
    top: '32%',
    gap: 12,
  },
  actionBtn: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 0.91 }],
  },
  actionIcon: {
    fontSize: 21,
    color: '#ffffff',
  },
  iconSaved: {
    color: '#ff3b5c',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  source: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  summary: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  readBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  readBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ scale: 0.96 }],
  },
  readBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  swipeHint: {
    alignItems: 'center',
  },
  swipeChevron: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 18,
  },
  image: {
    transform: [{ scale: 1.05 }],
  },
});

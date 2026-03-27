import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Article, KeywordDigest } from '../types';
import { ArticleThumbCard } from './ArticleThumbCard';

const CARD_WIDTH = 188; // card width (178) + marginRight (10)

interface KeywordDigestBlockProps {
  digest: KeywordDigest;
  onArticlePress?: (article: Article, digest: KeywordDigest) => void;
}

export const KeywordDigestBlock: React.FC<KeywordDigestBlockProps> = ({ digest, onArticlePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.min(
      Math.round(x / CARD_WIDTH),
      digest.articles.length - 1,
    );
    setActiveIndex(index);
  }, [digest.articles.length]);

  return (
    <View style={styles.block}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{digest.keyword}</Text>
        </View>
        <Text style={styles.count}>
          {digest.articles.length} article{digest.articles.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Horizontal scroll of article cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
      >
        {digest.articles.map((article) => (
          <ArticleThumbCard
            key={article.id}
            article={article}
            onPress={onArticlePress ? (a) => onArticlePress(a, digest) : undefined}
          />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      {digest.articles.length > 1 && (
        <View style={styles.dots}>
          {digest.articles.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  pill: {
    backgroundColor: 'rgba(79,70,229,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.45)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#4f46e5',
    borderRadius: 3,
  },
});

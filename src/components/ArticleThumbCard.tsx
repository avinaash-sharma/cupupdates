import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Article } from '../types';
import { timeAgo } from '../utils/timeAgo';
import { ShimmerBackground } from './ShimmerBackground';
import { useWebView } from '../context/WebViewContext';

interface ArticleThumbCardProps {
  article: Article;
  /** If provided, called on tap instead of opening the browser directly */
  onPress?: (article: Article) => void;
}

export const ArticleThumbCard: React.FC<ArticleThumbCardProps> = ({ article, onPress }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { openUrl } = useWebView();

  // Deterministic fallback seed from the article id
  const fallbackSeed = article.id.charCodeAt(0) % 1000;
  const imageUri = imageError
    ? `https://picsum.photos/seed/${fallbackSeed}/300/200`
    : article.imageUrl;

  const handlePress = () => {
    if (onPress) {
      onPress(article);
    } else {
      openUrl(article.url);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {!imageLoaded && <ShimmerBackground />}
        <Image
          key={imageUri}
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {article.source} · {timeAgo(article.publishedAt)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 178,
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#111113',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 10,
    gap: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  meta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
  },
});

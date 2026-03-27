import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Article, KeywordDigest } from '../types';
import { KeywordDigestBlock } from './KeywordDigestBlock';

interface DigestDayGroupProps {
  date: string;               // "2026-03-28"
  digests: KeywordDigest[];
  onVisible?: (ids: string[]) => void; // called once on mount with unread ids
  onArticlePress?: (article: Article, digest: KeywordDigest) => void;
}

function formatDay(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  // "Mar 26" style for older dates
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const DigestDayGroup: React.FC<DigestDayGroupProps> = ({
  date,
  digests,
  onVisible,
  onArticlePress,
}) => {
  const hasUnread = digests.some((d) => !d.isRead);

  useEffect(() => {
    const unreadIds = digests.filter((d) => !d.isRead).map((d) => d.id);
    if (unreadIds.length > 0 && onVisible) {
      // Slight delay so the user actually sees the content before marking read
      const timer = setTimeout(() => onVisible(unreadIds), 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.group}>
      {/* Day header */}
      <View style={styles.dayHeader}>
        {hasUnread && <View style={styles.unreadDot} />}
        <Text style={[styles.dayLabel, hasUnread && styles.dayLabelUnread]}>
          {formatDay(date)}
        </Text>
      </View>

      {/* Keyword blocks */}
      {digests.map((digest) => (
        <KeywordDigestBlock
          key={digest.id}
          digest={digest}
          onArticlePress={onArticlePress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dayLabelUnread: {
    color: 'rgba(255,255,255,0.85)',
  },
});

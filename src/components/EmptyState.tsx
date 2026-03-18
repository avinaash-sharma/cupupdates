import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  isError: boolean;
  onRetry: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isError, onRetry }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isError ? '⚠️' : '📰'}</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {isError ? 'Could not load news' : 'No stories found'}
      </Text>
      <Text style={[styles.desc, { color: colors.subtext }]}>
        {isError
          ? 'Check your connection or add your NewsData.io API key in src/constants/config.ts'
          : 'Try a different category'}
      </Text>
      {isError && (
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryPressed]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

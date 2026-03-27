import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n/useTranslation';

interface EmptyStateProps {
  isError: boolean;
  onRetry: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isError, onRetry }) => {
  const { colors } = useTheme();
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'newspaper-outline'}
        size={56}
        color="rgba(255,255,255,0.2)"
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.text }]}>
        {isError ? t.empty.errorTitle : t.empty.noStoriesTitle}
      </Text>
      <Text style={[styles.desc, { color: colors.subtext }]}>
        {isError ? t.empty.errorDesc : t.empty.noStoriesDesc}
      </Text>
      {isError && (
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryPressed]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>{t.empty.retry}</Text>
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
  icon: {
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

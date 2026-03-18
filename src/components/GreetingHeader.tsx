import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getGreeting } from '../utils/greeting';

interface GreetingHeaderProps {
  userName: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.headerBg }]}>
      <View style={styles.left}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting(userName)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Today's top stories
        </Text>
      </View>

      {/* Minimal logo mark */}
      <View style={[styles.mark, { borderColor: colors.border }]}>
        <Text style={styles.markEmoji}>☕</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  left: {
    gap: 2,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.1,
    opacity: 0.6,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markEmoji: {
    fontSize: 17,
  },
});

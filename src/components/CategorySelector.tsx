import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SUPPORTED_CATEGORIES } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategorySelectorProps {
  selected: string[];
  onChange: (cats: string[]) => void;
  min?: number;
  max?: number;
  /** Force dark palette — use on dark gradient backgrounds like onboarding */
  dark?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selected,
  onChange,
  min = 3,
  max = SUPPORTED_CATEGORIES.length,
  dark = false,
}) => {
  const { colors } = useTheme();

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      if (selected.length <= min) return; // enforce minimum
      onChange(selected.filter((c) => c !== cat));
    } else {
      if (selected.length >= max) return; // enforce maximum
      onChange([...selected, cat]);
    }
  };

  return (
    <View style={styles.grid}>
      {SUPPORTED_CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        const atMin = selected.length <= min && active;

        return (
          <Pressable
            key={cat}
            onPress={() => toggle(cat)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active
                  ? '#4f46e5'
                  : dark
                  ? 'rgba(255,255,255,0.08)'
                  : colors.card,
                borderColor: active
                  ? '#4f46e5'
                  : dark
                  ? 'rgba(255,255,255,0.2)'
                  : colors.border,
                opacity: pressed ? 0.82 : atMin ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: active
                    ? '#ffffff'
                    : dark
                    ? 'rgba(255,255,255,0.7)'
                    : colors.subtext,
                  fontWeight: active ? '700' : '500',
                },
              ]}
            >
              {cat}
            </Text>
            {active && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  checkmark: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

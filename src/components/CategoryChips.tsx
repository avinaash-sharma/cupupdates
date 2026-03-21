import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategoryChipsProps {
  categories: Category[];
  selected: Category;
  onSelect: (category: Category) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={{ backgroundColor: colors.headerBg, flexShrink: 0, maxHeight: 60 }}
    >
      {categories.map((cat) => {
        const active = cat === selected;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelect(cat)}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : styles.chipInactive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#ffffff',
  },
  chipInactive: {
    backgroundColor: 'transparent',
  },
  chipPressed: {
    transform: [{ scale: 0.93 }],
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#888888',
    fontWeight: '500',
  },
});

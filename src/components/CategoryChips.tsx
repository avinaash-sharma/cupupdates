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
              {
                backgroundColor: active ? colors.text : 'transparent',
                transform: [{ scale: pressed ? 0.93 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: active ? colors.background : colors.subtext,
                  fontWeight: active ? '700' : '500',
                },
              ]}
            >
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
    gap: 6,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

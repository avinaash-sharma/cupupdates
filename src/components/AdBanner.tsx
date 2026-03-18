import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const AdBanner: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      <View style={[styles.adLabelBox, { borderColor: colors.subtext }]}>
        <Text style={[styles.adLabel, { color: colors.subtext }]}>AD</Text>
      </View>
      <Text style={[styles.adText, { color: colors.text }]}>
        Advertisement — Your ad here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  adLabelBox: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  adLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  adText: {
    fontSize: 13,
  },
});

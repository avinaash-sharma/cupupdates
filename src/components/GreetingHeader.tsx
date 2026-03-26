import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGreeting } from '../utils/greeting';

interface GreetingHeaderProps {
  userName: string;
  onSearchPress: () => void;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName, onSearchPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting} numberOfLines={1}>
        {getGreeting(userName)}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onSearchPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={19} color="rgba(255,255,255,0.75)" />
        </Pressable>

        {/* Circular avatar mark */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>☕</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  greeting: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.1,
    flex: 1,
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 16,
  },
});

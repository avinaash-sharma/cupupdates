import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGreeting } from '../utils/greeting';
import { useTranslation } from '../i18n/useTranslation';

interface GreetingHeaderProps {
  userName: string;
  onSearchPress: () => void;
  onBellPress: () => void;
  unreadCount: number;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  onSearchPress,
  onBellPress,
  unreadCount,
}) => {
  const t = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.greeting} numberOfLines={1}>
        {getGreeting(t, userName)}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onSearchPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={19} color="rgba(255,255,255,0.75)" />
        </Pressable>

        {/* Bell icon with unread badge */}
        <Pressable
          onPress={onBellPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          hitSlop={8}
        >
          <Ionicons
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={19}
            color={unreadCount > 0 ? '#a5b4fc' : 'rgba(255,255,255,0.75)'}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : String(unreadCount)}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Circular avatar mark */}
        <View style={styles.avatar}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
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
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff3b5c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#080808',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fce4ec',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLogo: {
    width: 32,
    height: 32,
  },
});

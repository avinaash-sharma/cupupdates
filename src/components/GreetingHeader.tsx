import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getGreeting } from '../utils/greeting';

interface GreetingHeaderProps {
  userName: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting} numberOfLines={1}>
        {getGreeting(userName)}
      </Text>

      {/* Circular avatar mark */}
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>☕</Text>
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
    paddingVertical: 10,
  },
  greeting: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#ffffff',
    letterSpacing: 0.1,
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
});

import 'react-native-gesture-handler'; // must be first import
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { RestartContext } from './src/context/RestartContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { getUserPreferences } from './src/utils/storage';

const Tab = createBottomTabNavigator();

// RestartContext is defined in src/context/RestartContext.ts to avoid circular deps.

const ACTIVE_COLOR   = '#ffffff';
const INACTIVE_COLOR = 'rgba(255,255,255,0.38)';
const ICON_SIZE      = 24;

const MainTabs: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 58,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={ICON_SIZE}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={ICON_SIZE}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={ICON_SIZE}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppContent: React.FC = () => {
  // null = still reading storage, false = needs onboarding, true = ready
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    getUserPreferences().then((prefs) => setHasOnboarded(prefs?.hasOnboarded ?? false));
  }, []);

  if (hasOnboarded === null) return null;

  if (!hasOnboarded) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={() => setHasOnboarded(true)} />
      </>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <MainTabs />
    </NavigationContainer>
  );
};

export default function App() {
  const [appKey, setAppKey] = useState(0);
  const restartApp = useCallback(() => setAppKey((k) => k + 1), []);

  return (
    <RestartContext.Provider value={restartApp}>
      <GestureHandlerRootView key={appKey} style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RestartContext.Provider>
  );
}

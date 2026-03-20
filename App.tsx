import 'react-native-gesture-handler'; // must be first import
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { getUserPreferences } from './src/utils/storage';

const Tab = createBottomTabNavigator();

// ── Restart context ───────────────────────────────────────────────────────────
// Calling restartApp() forces the entire React tree to remount, which re-reads
// AsyncStorage so any persisted changes (e.g. language) take effect immediately.
export const RestartContext = createContext<() => void>(() => {});
export const useRestart = () => useContext(RestartContext);

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 24 : 21, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
);

const MainTabs: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: colors.subtext,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔖" focused={focused} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }}
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

import 'react-native-gesture-handler'; // must be first import
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { WebViewProvider } from './src/context/WebViewContext';
import { WebViewModal } from './src/components/WebViewModal';
import { useTranslation } from './src/i18n/useTranslation';
import { RestartContext } from './src/context/RestartContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { getUserPreferences } from './src/utils/storage';
import { registerBackgroundTask } from './src/tasks/keywordBackgroundTask';

const Tab = createBottomTabNavigator();

// RestartContext is defined in src/context/RestartContext.ts to avoid circular deps.

const ICON_SIZE = 24;

const MainTabs: React.FC = () => {
  const { colors, isDark } = useTheme();
  const t = useTranslation();

  const activeColor   = '#4f46e5';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0B0B0F' : colors.card,
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : colors.border,
          height: 58,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t.tabs.home,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={ICON_SIZE}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: t.tabs.bookmarks,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={ICON_SIZE}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.tabs.settings,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={ICON_SIZE}
              color={focused ? activeColor : inactiveColor}
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
    // Register background fetch task after the JS runtime is ready
    registerBackgroundTask();
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
            <LanguageProvider>
              <WebViewProvider
                renderModal={(state, close) => (
                  <WebViewModal url={state.url} visible={state.visible} onClose={close} />
                )}
              >
                <AppContent />
              </WebViewProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RestartContext.Provider>
  );
}

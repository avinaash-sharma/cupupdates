import 'react-native-gesture-handler'; // must be first import
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationContainer, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
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
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from './src/posthog';

type RootTabParamList = {
  Home: { openNotifications?: boolean } | undefined;
  Bookmarks: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const navigationRef = createNavigationContainerRef<RootTabParamList>();

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
  const pendingOpenNotif = useRef(false);

  useEffect(() => {
    getUserPreferences().then((prefs) => setHasOnboarded(prefs?.hasOnboarded ?? false));
    registerBackgroundTask();

    // Cold-start: app was killed and user tapped a notification to open it
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification.request.content.data?.type === 'keyword_digest') {
        pendingOpenNotif.current = true;
      }
    });

    // Foreground / background-to-foreground: notification tapped while app was alive
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.type === 'keyword_digest') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('Home', { openNotifications: true });
        } else {
          pendingOpenNotif.current = true;
        }
      }
    });
    return () => sub.remove();
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
    <NavigationContainer
      ref={navigationRef}
      theme={DarkTheme}
      onReady={() => {
        if (pendingOpenNotif.current) {
          pendingOpenNotif.current = false;
          navigationRef.navigate('Home', { openNotifications: true });
        }
      }}
    >
      <PostHogProvider client={posthog}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <MainTabs />
      </PostHogProvider>
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

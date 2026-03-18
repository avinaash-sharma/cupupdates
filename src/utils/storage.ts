import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, AppSettings, UserPreferences } from '../types';

const KEYS = {
  BOOKMARKS: '@bookmarks',
  SETTINGS: '@settings',
  PREFERENCES: '@preferences',
} as const;

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export const getBookmarks = async (): Promise<Article[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return data ? (JSON.parse(data) as Article[]) : [];
  } catch {
    return [];
  }
};

export const saveBookmarks = async (bookmarks: Article[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
};

// ── App settings (dark mode) ──────────────────────────────────────────────────

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? (JSON.parse(data) as AppSettings) : { darkMode: false };
  } catch {
    return { darkMode: false };
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

// ── User preferences (name + categories + onboarding flag) ────────────────────

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return data ? (JSON.parse(data) as UserPreferences) : null;
  } catch {
    return null;
  }
};

export const saveUserPreferences = async (prefs: UserPreferences): Promise<void> => {
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, AppSettings, UserPreferences, KeywordDigest } from '../types';

const KEYS = {
  BOOKMARKS: '@bookmarks',
  SETTINGS: '@settings',
  PREFERENCES: '@preferences',
  NOTIFICATION_HISTORY: '@notification_history',
} as const;

const MAX_DIGESTS = 100;
const MAX_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
    return data ? (JSON.parse(data) as AppSettings) : { darkMode: true };
  } catch {
    return { darkMode: true };
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

// ── Notification history ──────────────────────────────────────────────────────

export const getNotificationHistory = async (): Promise<KeywordDigest[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_HISTORY);
    return data ? (JSON.parse(data) as KeywordDigest[]) : [];
  } catch {
    return [];
  }
};

export const saveNotificationHistory = async (history: KeywordDigest[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_HISTORY, JSON.stringify(history));
};

/** Prepend new digests, then purge entries older than 30 days or beyond 100 total. */
export const addDigests = async (newDigests: KeywordDigest[]): Promise<void> => {
  const existing = await getNotificationHistory();
  const cutoff = Date.now() - MAX_DAYS_MS;
  const merged = [...newDigests, ...existing]
    .filter((d) => new Date(d.date).getTime() >= cutoff)
    .slice(0, MAX_DIGESTS);
  await saveNotificationHistory(merged);
};

export const markDigestsRead = async (ids: string[]): Promise<void> => {
  const existing = await getNotificationHistory();
  const idSet = new Set(ids);
  const updated = existing.map((d) => (idSet.has(d.id) ? { ...d, isRead: true } : d));
  await saveNotificationHistory(updated);
};

import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { KeywordDigest, DEFAULT_NOTIFICATION_HOUR } from '../types';
import { fetchKeywordDigests } from './useKeywordDigest';
import {
  addDigests,
  getNotificationHistory,
  markDigestsRead,
  getUserPreferences,
  saveUserPreferences,
} from '../utils/storage';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/**
 * Returns the number of seconds until the next occurrence of `hour:00`.
 * If that time has already passed today, returns seconds until tomorrow at that hour.
 */
function secondsUntilHour(hour: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(1, Math.floor((target.getTime() - now.getTime()) / 1000));
}

// Configure how incoming notifications are handled while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const [history, setHistory] = useState<KeywordDigest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadHistory = useCallback(async () => {
    const h = await getNotificationHistory();
    setHistory(h);
    setUnreadCount(h.filter((d) => !d.isRead).length);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }, []);

  const hasPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }, []);

  const scheduleDigestNotification = useCallback(
    async (digests: KeywordDigest[], notificationHour = DEFAULT_NOTIFICATION_HOUR) => {
      if (!(await hasPermission())) return;

      const parts = digests.map((d) => `${d.articles.length} about ${d.keyword}`);
      const secs = secondsUntilHour(notificationHour);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your daily keyword digest',
          body: parts.join(' · '),
          data: { type: 'keyword_digest' },
        },
        trigger: { seconds: secs },
      });
    },
    [hasPermission],
  );

  /**
   * Run on every app open. Checks if 24h have elapsed since the last keyword
   * fetch, then fetches + stores digests and fires a local notification.
   */
  const checkOnOpen = useCallback(async () => {
    const prefs = await getUserPreferences();
    if (!prefs?.keywords?.length) return;

    const now = Date.now();
    const last = prefs.lastKeywordCheck ?? 0;
    if (now - last < TWENTY_FOUR_HOURS) return;

    if (__DEV__) console.log('[Notifications] 24h elapsed — fetching keyword digests');

    const digests = await fetchKeywordDigests(prefs.keywords, prefs.language ?? 'en');

    // Always bump the timestamp even if no results, to avoid hammering the API
    await saveUserPreferences({ ...prefs, lastKeywordCheck: now });

    if (digests.length === 0) return;

    await addDigests(digests);
    await scheduleDigestNotification(digests, prefs.notificationHour ?? DEFAULT_NOTIFICATION_HOUR);
    await loadHistory();
  }, [scheduleDigestNotification, loadHistory]);

  const markRead = useCallback(
    async (ids: string[]) => {
      await markDigestsRead(ids);
      await loadHistory();
    },
    [loadHistory],
  );

  return {
    history,
    unreadCount,
    checkOnOpen,
    requestPermission,
    loadHistory,
    markRead,
  };
};

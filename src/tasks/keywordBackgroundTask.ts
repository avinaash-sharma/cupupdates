/**
 * Background fetch task for keyword digest updates.
 *
 * IMPORTANT: TaskManager.defineTask must be called at module load time (top-level),
 * not inside a component or effect, so the task is available when iOS/Android
 * wakes the app in the background.
 *
 * iOS note: Background fetch scheduling is managed by the OS and is best-effort.
 * The on-open check in useNotifications is the reliable delivery path.
 */
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { fetchKeywordDigests } from '../hooks/useKeywordDigest';
import { addDigests, getUserPreferences, saveUserPreferences } from '../utils/storage';
import { DEFAULT_NOTIFICATION_HOUR } from '../types';

export const KEYWORD_BACKGROUND_TASK = 'KEYWORD_BACKGROUND_FETCH';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function secondsUntilHour(hour: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(1, Math.floor((target.getTime() - now.getTime()) / 1000));
}

// Must be defined at top level — runs when the module is first imported.
TaskManager.defineTask(KEYWORD_BACKGROUND_TASK, async () => {
  try {
    const prefs = await getUserPreferences();
    if (!prefs?.keywords?.length) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const now = Date.now();
    const last = prefs.lastKeywordCheck ?? 0;
    if (now - last < TWENTY_FOUR_HOURS) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const digests = await fetchKeywordDigests(prefs.keywords, prefs.language ?? 'en');
    await saveUserPreferences({ ...prefs, lastKeywordCheck: now });

    if (digests.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await addDigests(digests);

    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      const parts = digests.map((d) => `${d.articles.length} about ${d.keyword}`);
      const secs = secondsUntilHour(prefs.notificationHour ?? DEFAULT_NOTIFICATION_HOUR);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your daily keyword digest',
          body: parts.join(' · '),
          data: { type: 'keyword_digest' },
        },
        trigger: { seconds: secs },
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    if (__DEV__) console.warn('[BgFetch] Task failed:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background task. Safe to call multiple times — no-ops if already registered.
 * Call this from App.tsx after the navigation tree is ready.
 */
export async function registerBackgroundTask(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      if (__DEV__) console.log('[BgFetch] Background fetch not available on this device/config');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(KEYWORD_BACKGROUND_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(KEYWORD_BACKGROUND_TASK, {
        minimumInterval: 60 * 60 * 24, // 24 hours in seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
      if (__DEV__) console.log('[BgFetch] Task registered');
    }
  } catch (err) {
    // Registration can fail in Expo Go — safe to ignore
    if (__DEV__) console.warn('[BgFetch] Registration skipped:', err);
  }
}

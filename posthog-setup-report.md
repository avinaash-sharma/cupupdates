# PostHog Analytics Setup Report

## Integration Summary

PostHog analytics was integrated into the **Headline** (CupUpdates) React Native Expo app using the `posthog-react-native` SDK. The integration uses a singleton client initialized from environment variables, wrapped with `PostHogProvider` at the app root, and instruments key user actions across onboarding, content consumption, bookmarking, search, and settings.

### Files Modified

| File | Change |
|------|--------|
| `.env` | Added `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` |
| `app.config.js` | Forwarded env vars to `expo.extra` for runtime access |
| `src/posthog.ts` | Created singleton PostHog client |
| `App.tsx` | Wrapped app tree with `PostHogProvider` |
| `src/screens/OnboardingScreen.tsx` | Added `identify` + onboarding/notification events |
| `src/screens/HomeScreen.tsx` | Added `article_read` event |
| `src/hooks/useBookmarks.ts` | Added bookmark events |
| `src/components/NewsCard.tsx` | Added share event |
| `src/hooks/useSearch.ts` | Added search event |
| `src/screens/SettingsScreen.tsx` | Added settings events |

---

## Events

| Event Name | Description | File |
|------------|-------------|------|
| `onboarding_completed` | Fired when user finishes onboarding; includes `user_name`, `categories` (array), `keywords` (array), `language` | `src/screens/OnboardingScreen.tsx` |
| `notification_permission_granted` | Fired when user grants push notification permission during onboarding | `src/screens/OnboardingScreen.tsx` |
| `notification_permission_denied` | Fired when user denies push notification permission during onboarding | `src/screens/OnboardingScreen.tsx` |
| `article_read` | Fired when user swipes to a new article in the feed; includes `category`, `source`, `is_breaking` | `src/screens/HomeScreen.tsx` |
| `article_bookmarked` | Fired when user bookmarks an article; includes `category`, `source` | `src/hooks/useBookmarks.ts` |
| `article_unbookmarked` | Fired when user removes a bookmark; includes `category`, `source` | `src/hooks/useBookmarks.ts` |
| `article_shared` | Fired after a successful share sheet action; includes `category`, `source` | `src/components/NewsCard.tsx` |
| `search_performed` | Fired on debounced search (500 ms); includes `query`, `results_count` | `src/hooks/useSearch.ts` |
| `settings_language_changed` | Fired when user switches app language; includes `language` | `src/screens/SettingsScreen.tsx` |
| `settings_keyword_added` | Fired when user adds a keyword filter; includes `keyword` | `src/screens/SettingsScreen.tsx` |
| `settings_keyword_removed` | Fired when user removes a keyword filter; includes `keyword` | `src/screens/SettingsScreen.tsx` |
| `settings_dark_mode_toggled` | Fired when user toggles dark mode; includes `dark_mode` (boolean) | `src/screens/SettingsScreen.tsx` |

### User Identification

`posthog.identify()` is called at onboarding completion with:
- `distinct_id`: trimmed user name (lowercased)
- `name`: display name
- `categories`: selected interest categories
- `language`: chosen language code

---

## Dashboard & Insights

### Dashboard

**Analytics basics** — [https://us.posthog.com/project/359968/dashboard/1407553](https://us.posthog.com/project/359968/dashboard/1407553)

### Insights

| Insight | Type | Description | Link |
|---------|------|-------------|------|
| Onboarding → Engagement Funnel | Funnel | Conversion from `onboarding_completed` → `article_read` → `article_bookmarked` (7-day window) | [WcBapq3j](https://us.posthog.com/project/359968/insights/WcBapq3j) |
| Content Engagement Over Time | Trends | Daily counts of `article_read`, `article_bookmarked`, `article_shared` | [RUHUEU6i](https://us.posthog.com/project/359968/insights/RUHUEU6i) |
| Notification Permission Rate | Trends | Daily comparison of `onboarding_completed` vs `notification_permission_granted` vs `notification_permission_denied` | [cSnjjG64](https://us.posthog.com/project/359968/insights/cSnjjG64) |
| Settings Changes Over Time | Trends | Weekly counts of all settings events (language, keywords, dark mode) | [JFiWjNsZ](https://us.posthog.com/project/359968/insights/JFiWjNsZ) |

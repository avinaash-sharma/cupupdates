# CupUpdates

A React Native news reader app with a cinematic swipe-through card experience for browsing personalized news.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74.5 + Expo SDK 51 |
| Language | TypeScript 5.3.3 |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Navigation | React Navigation — Bottom Tabs |
| Animations | react-native-reanimated |
| Storage | AsyncStorage |
| News API | NewsData.io |

---

## Screens & Navigation

3-tab bottom navigator: **Home**, **Bookmarks**, **Settings**

### Onboarding (3 steps)
- **Step 1 — Name**: Personalised greeting setup
- **Step 2 — Language**: Choose English or Hindi; hint shown that this can be changed later in Settings
- **Step 3 — Categories**: Select at least 5 from 11 available news topics

### Home
- Swipeable card deck (Tinder-style) with full-bleed news images
- Category filter chips at the top
- Pull-to-refresh by swiping down on the first card
- Interstitial ad every 5 swipes
- "Read Full Story" button opens the article URL in browser

### Bookmarks
- Saved articles in a scrollable list with thumbnail, source, and headline
- Remove individual bookmarks via the X icon
- Empty state with instructions

### Settings
- **Profile**: Edit display name
- **Categories**: Toggle preferred topics (minimum 3 required)
- **Language**: Switch between English and Hindi — triggers a full app restart to apply
- **Appearance**: Dark / light mode toggle
- **About**: App name and version

---

## Features

**News discovery**
- Swipe up → next article, swipe down → previous article
- Spring animations at 60fps via react-native-reanimated
- Lazy loading with pagination — loads more when within 5 articles of the end

**Card design**
- Image occupies the top 62% of the card with no aggressive zoom
- Smooth gradient fade from image into the text zone
- Category label (indigo pill), bold headline, and dimmed summary
- Bookmark button (heart icon) top-right with pressed state

**Language support**
- English (EN) and Hindi (हिंदी) selectable at onboarding and in Settings
- Language preference persisted to AsyncStorage
- Changing language triggers a full app restart to re-fetch news in the new language

**Bookmarks**
- Toggle bookmark on any card; persisted across sessions via AsyncStorage

**Theming**
- Dark / light mode driven by ThemeContext
- Preference persisted to storage and applied on next launch

**Image handling**
- Falls back to seeded `picsum.photos` placeholder if article image is missing or fails to load
- Shimmer animation shown while image loads

**Content processing**
- HTML tag stripping and entity decoding on article descriptions
- Summaries truncated to 45 words with ellipsis

---

## State & Data

| What | How |
|---|---|
| Theme (dark/light) | `ThemeContext` + AsyncStorage `@settings` |
| User prefs (name, categories, language, onboarded) | `useSettings` hook + AsyncStorage `@preferences` |
| News articles | `useNews` hook → NewsData.io API |
| Bookmarks | `useBookmarks` hook + AsyncStorage `@bookmarks` |

**Supported categories**: Business, Entertainment, Environment, Food, Health, Politics, Science, Sports, Technology, Top, World

**Supported languages**: English (`en`), Hindi (`hi`)

---

## Project Structure

```
src/
├── screens/      # OnboardingScreen, HomeScreen, BookmarksScreen, SettingsScreen
├── components/   # NewsCard, SwipeDeck, CategoryChips, CategorySelector,
│                 # GreetingHeader, ShimmerBackground, InterstitialAd,
│                 # AdBanner, EmptyState
├── hooks/        # useNews, useBookmarks, useSettings
├── context/      # ThemeContext
├── utils/        # newsApi, storage, greeting, newsTransform
├── constants/    # config (API key)
└── types/        # Article, UserPreferences, AppSettings, SUPPORTED_LANGUAGES
```

---

## Notable Config

- Splash screen: `#1a1a2e` (dark navy)
- Tab bar active colour: `#4f46e5` (indigo)
- API key stored in `src/constants/config.ts`
- App restart on language change: key-based React tree remount (no native restart needed)

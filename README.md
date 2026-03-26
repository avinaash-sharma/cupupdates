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
| In-app browser | expo-web-browser |

---

## Screens & Navigation

3-tab bottom navigator: **Home**, **Bookmarks**, **Settings**

### Onboarding (3 steps)
- **Step 1 — Name**: Personalised greeting setup
- **Step 2 — Language**: Choose English or Hindi; hint shown that this can be changed later in Settings
- **Step 3 — Categories**: Select at least 5 from 11 available news topics

### Home
- Swipeable card deck (Tinder-style) with full-bleed news images
- Category filter chips at the top — **Trending** selected by default, fetches top news
- Pull-to-refresh by swiping down on the first card
- Interstitial ad every 5 swipes
- Position indicator ("5 / 24") between the swipe hint and the read button
- "Read Full Story" opens the article in an **in-app browser sheet** (expo-web-browser)

### Bookmarks
- Saved articles in a scrollable list with thumbnail, source, and headline
- "Read More" opens the article in an **in-app browser sheet**
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
- Lazy loading with pagination — loads more when within 5 articles of the end (NewsData.io free tier: 10 results per page)
- **Trending** category chip (permanent, default) maps to the `top` endpoint on NewsData.io

**Card design**
- Image occupies the top 62% with `resizeMode="cover"` and a subtle `scale(1.05)` zoom — full-bleed, editorial feel
- Dual gradient overlay: top vignette keeps action buttons legible; bottom fade pulls the image into the dark content zone
- Georgia/serif headline at `fontSize 22`, `fontWeight 600`, `lineHeight 28` — tighter, more editorial than system default
- Summary at `fontSize 12`, `opacity 0.45` — clearly secondary to the headline
- Source name and relative time ("BBC News · 2h ago") recessed below the summary
- Red **BREAKING** pill shown on articles flagged `breaking_news = 1` by the API
- Bookmark and share buttons: 40×40 circular surface with `opacity 0.52` backdrop, press scales to 0.9

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
- `resizeMode="cover"` with `scale(1.05)` for a full-bleed, slightly zoomed editorial look
- Shimmer animation plays inside the image area while each image loads — previous image never bleeds through to the next card
- Image state (loaded / error) resets per article via `key` prop and `useEffect`, preventing stale state across swipes
- Falls back to seeded `picsum.photos` placeholder if an article has no image or the load fails

**API & fetch optimisation**
- In-memory cache with 5-minute TTL per category+language key — category switches are instant on revisit
- Stale-while-revalidate: stale cached articles shown immediately while a background re-fetch updates the list silently
- Explicit pull-to-refresh busts the cache and fetches fresh data with a loading spinner
- Concurrent `loadMore` calls prevented via a synchronous ref guard (not React state, which has render-cycle lag)
- Verbose per-result API logs stripped from production builds via `__DEV__` guards
- NewsData.io free tier is capped at 10 results per request

**Article ranking**
- Each article is scored 0–110 across four signals before being displayed:

  | Signal | Max | Logic |
  |---|---|---|
  | Recency | 40 | <1h=40, <6h=32, <24h=20, <72h=8 |
  | Category match | 30 | Article category in user's saved preferences |
  | Title quality | 20 | Word-count heuristic: 8–16 words = ideal |
  | Has real image | 10 | Picsum fallbacks score 0 |
  | Breaking bonus | +10 | Flat bonus for `breaking_news = 1` |

- Sorting applied to the initial fetch only — `loadMore` appends naturally so the current card never jumps
- In dev, every swipe logs `[Swipe] #n/total  score=N | category | source | headline` to the Metro console
- Full per-fetch score table (`console.table`) logged after each fresh load in dev; stripped in production via `__DEV__`

**Content processing**
- HTML tag stripping and entity decoding on article descriptions
- Summaries truncated to 45 words with ellipsis
- Deduplication by article ID and normalised title (catches same story from different sources)

---

## State & Data

| What | How |
|---|---|
| Theme (dark/light) | `ThemeContext` + AsyncStorage `@settings` |
| User prefs (name, categories, language, onboarded) | `useSettings` hook + AsyncStorage `@preferences` |
| News articles | `useNews` hook → NewsData.io API |
| Bookmarks | `useBookmarks` hook + AsyncStorage `@bookmarks` |

**Supported categories**: Trending (default), All, Business, Entertainment, Environment, Food, Health, Politics, Science, Sports, Technology, Top, World

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
├── utils/        # newsApi, newsCache, scoreArticle, storage, greeting, newsTransform, timeAgo
├── constants/    # config (API key)
└── types/        # Article, UserPreferences, AppSettings, SUPPORTED_LANGUAGES,
                  # DEFAULT_CATEGORY, TRENDING_CATEGORY
```

---

## Design System

| Token | Value | Used for |
|---|---|---|
| Background | `#080808` | App root, screen bg |
| Surface | `#111113` | Cards, card container |
| Elevated surface | `#1A1A1F` | CTA button, avatar bg |
| Border | `#2A2A2E` | CTA border, subtle dividers |
| Accent | `#4f46e5` (indigo) | Category pills, tab bar active |
| Inactive text | `#888888` | Category chip labels |

- "Swipe up" hint disappears after the first swipe — one-time affordance
- Category chips: active = white bg + black text; inactive = `#888` on transparent
- CTA button: dark surface `#1A1A1F` with `1px #2A2A2E` border pill
- Bottom nav: `#0B0B0F` background, `rgba(255,255,255,0.07)` top border
- Tab bar active tint: indigo `#4f46e5` on all modes

## Notable Config

- Splash screen: `#1a1a2e` (dark navy)
- Tab bar active colour: `#4f46e5` (indigo)
- API key stored in `src/constants/config.ts`
- App restart on language change: key-based React tree remount (no native restart needed)

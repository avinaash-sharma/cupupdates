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
| Animations | react-native-reanimated 3.10.1 |
| Gestures | react-native-gesture-handler 2.16.1 |
| Storage | AsyncStorage |
| News API | NewsData.io |
| In-app browser | expo-web-browser |
| Icons | Expo Vector Icons (Ionicons) |
| Gradients | expo-linear-gradient |

---

## Screens & Navigation

4-tab bottom navigator: **Home**, **Search**, **Bookmarks**, **Settings**

### Onboarding (3 steps)
- **Step 1 — Name**: Personalized greeting setup (min 2 characters)
- **Step 2 — Language**: Choose English or Hindi; can be changed later in Settings
- **Step 3 — Categories**: Select at least 5 from 11 available news topics

### Home
- Swipeable card deck with full-bleed news images
- Category filter chips at the top — **Trending** selected by default, fetches top news
- Pull-to-refresh by swiping down on the first card
- Interstitial ad every 5 swipes
- Position indicator ("5 / 24") between the swipe hint and the read button
- "Read Full Story" opens the article in an **in-app browser sheet**

### Search
- Full-text search powered by NewsData.io search endpoint
- **500ms debounce** on the input to minimize API calls
- **Dual view modes** toggled by a button in the header:
  - **List** (default) — compact rows with category pill, source, time, and headline
  - **Card** — full swipeable deck identical to HomeScreen
- Infinite scroll at 40% threshold from the bottom
- Clear button (×) resets query and results
- Bookmark articles directly from search results
- Empty and error states with contextual icons

### Bookmarks
- Saved articles in **List** or **Card** view (toggle in header)
- Tap article to open in-app browser; tap heart to remove bookmark
- Shows count of saved items
- Empty state with instructions when no bookmarks exist
- Card index auto-clamped if a bookmark is removed while in card view

### Settings
- **Profile**: Edit display name (min 2 characters)
- **Categories**: Toggle preferred topics (minimum 3 required)
- **Language**: Switch between English and Hindi
- **Appearance**: Dark / light mode toggle
- **About**: App name and version

---

## App Flow

```
Launch
  │
  ├── First launch → OnboardingScreen (3 steps)
  │     ├── Step 1: Enter name
  │     ├── Step 2: Select language (EN / HI)
  │     └── Step 3: Select categories (min 5)
  │           └── Complete → HomeScreen
  │
  └── Returning user → HomeScreen (hasOnboarded = true)

HomeScreen
  ├── useNews(selectedCategories) → check 5-min cache
  │     ├── Cache hit → serve immediately
  │     └── Cache miss → fetch API → transform → score → render
  ├── CategoryChips (Trending | All | user categories)
  │     └── Chip tap → re-fetch for selected category
  ├── SwipeDeck
  │     ├── Swipe up → next article
  │     ├── Swipe down → previous article
  │     ├── Pull-to-refresh at article #0 → bust cache & re-fetch
  │     └── Every 5 swipes → InterstitialAd modal
  └── NewsCard actions → bookmark / share / open browser

SearchScreen
  ├── Text input → debounce 500ms → useSearch(query, language)
  │     └── searchNews() → NewsData.io search endpoint
  ├── View toggle (list ↔ card)
  └── Infinite scroll → load more at 40% threshold

BookmarksScreen (useFocusEffect reloads on tab focus)
  ├── View toggle (list ↔ card)
  ├── Tap article → open browser
  └── Tap heart → remove from AsyncStorage

SettingsScreen
  ├── Name edit → saved to @preferences
  ├── Category grid → saved to @preferences
  ├── Language select → saved to @preferences → context update
  └── Dark mode toggle → saved to @settings → ThemeContext update
```

---

## Features

### News Discovery
- Swipe up → next article, swipe down → previous article
- Spring animations at 60fps via react-native-reanimated worklets
- Lazy loading with pagination — loads more near the end of the deck
- **Trending** chip maps to the `top` endpoint on NewsData.io

### Card Design
- Image occupies the top 62% with `resizeMode="cover"` and a subtle `scale(1.05)` zoom
- Dual gradient overlay: top vignette keeps action buttons legible; bottom fade pulls the image into the dark content zone
- Georgia/serif headline at `fontSize 22`, `fontWeight 600`, `lineHeight 28`
- Summary at `fontSize 12`, `opacity 0.45` — clearly secondary to the headline
- Source name and relative time ("BBC News · 2h ago") below the summary
- Red **BREAKING** pill shown on articles flagged `breaking_news = 1` by the API
- Bookmark and share buttons: 40×40 circular surface with `opacity 0.52` backdrop, press scales to 0.9

### Language Support
- English (EN) and Hindi (हिंदी) selectable at onboarding and in Settings
- All UI strings managed via `src/i18n/translations.ts` and `useTranslation()` hook
- Language preference persisted to AsyncStorage
- Changing language updates `LanguageContext` → news re-fetches in new language

### Bookmarks
- Toggle bookmark on any card in Home, Search, or Bookmarks screens
- Persisted across sessions via AsyncStorage (`@bookmarks`)

### Theming
- Dark / light mode driven by `ThemeContext`
- Preference persisted to `AsyncStorage` (`@settings`) and applied on next launch
- Default: dark mode

### Image Handling
- Shimmer animation plays while each image loads
- Image state resets per article via `key` prop and `useEffect`
- Falls back to seeded `picsum.photos` placeholder if no image or load fails

### API & Fetch Optimisation
- In-memory cache with 5-minute TTL per category+language key — category switches are instant on revisit
- Stale-while-revalidate: stale cached articles shown immediately while a background re-fetch updates the list
- Pull-to-refresh busts the cache and fetches fresh data
- Concurrent `loadMore` calls prevented via a synchronous ref guard
- NewsData.io free tier: 500 requests/day, 10 results per page

### Article Ranking
Each article is scored 0–110 across four signals:

| Signal | Max | Logic |
|---|---|---|
| Recency | 40 | <1h=40, <6h=32, <24h=20, <72h=8 |
| Category match | 30 | Article category in user's saved preferences |
| Title quality | 20 | Word-count heuristic: 8–16 words = ideal |
| Has real image | 10 | Picsum fallbacks score 0 |
| Breaking bonus | +10 | Flat bonus for `breaking_news = 1` |

Sorting applied to initial fetch only — `loadMore` appends naturally so the current card never jumps.

### Content Processing
- HTML tag stripping and entity decoding on article descriptions
- Summaries truncated to 45 words with ellipsis
- Deduplication by article ID and normalised title (catches same story from different sources)

---

## State & Data

| What | Where | Storage Key |
|---|---|---|
| Theme (dark/light) | `ThemeContext` | `@settings` |
| User prefs (name, categories, language, onboarded) | `useSettings` + `LanguageContext` | `@preferences` |
| News articles | `useNews` hook → NewsData.io | in-memory cache |
| Search results | `useSearch` hook → NewsData.io | none (ephemeral) |
| Bookmarks | `useBookmarks` hook | `@bookmarks` |

**Supported categories**: Trending (default), All, Business, Entertainment, Environment, Food, Health, Politics, Science, Sports, Technology, Top, World

**Supported languages**: English (`en`), Hindi (`hi`)

---

## Project Structure

```
cupupdates/
├── App.tsx                    # Root: navigation + context providers
├── app.json                   # Expo config (splash, icons, bundle ID)
├── babel.config.js            # nativewind + reanimated babel plugins
├── metro.config.js            # Metro bundler config
├── tailwind.config.js         # Tailwind/NativeWind config
├── tsconfig.json              # TypeScript config
└── src/
    ├── screens/
    │   ├── OnboardingScreen.tsx   # 3-step first-launch flow
    │   ├── HomeScreen.tsx         # Swipeable card news feed
    │   ├── SearchScreen.tsx       # Search with list/card toggle
    │   ├── BookmarksScreen.tsx    # Saved articles with list/card toggle
    │   └── SettingsScreen.tsx     # User preferences
    ├── components/
    │   ├── SwipeDeck.tsx          # Core swipeable card stack (Reanimated)
    │   ├── NewsCard.tsx           # Individual article card UI
    │   ├── CategoryChips.tsx      # Horizontal category filter tabs
    │   ├── CategorySelector.tsx   # Grid-based category multi-select
    │   ├── GreetingHeader.tsx     # Top header with time-based greeting
    │   ├── EmptyState.tsx         # Error / no-results display
    │   ├── ShimmerBackground.tsx  # Loading skeleton animation
    │   ├── InterstitialAd.tsx     # Ad modal placeholder
    │   └── AdBanner.tsx           # Banner ad placeholder
    ├── hooks/
    │   ├── useNews.ts             # News fetching, caching, scoring
    │   ├── useSearch.ts           # Search with debounce + pagination
    │   ├── useBookmarks.ts        # Bookmark CRUD + AsyncStorage
    │   └── useSettings.ts         # User preferences management
    ├── context/
    │   ├── ThemeContext.tsx        # Dark/light theme + colors
    │   ├── LanguageContext.tsx     # Active language state
    │   └── RestartContext.ts      # App restart trigger
    ├── i18n/
    │   ├── translations.ts        # Full EN + HI string tables
    │   └── useTranslation.ts      # Hook to access current language strings
    ├── utils/
    │   ├── newsApi.ts             # NewsData.io API calls + deduplication
    │   ├── newsCache.ts           # In-memory 5-min cache (singleton)
    │   ├── newsTransform.ts       # HTML strip, truncate, image fallback
    │   ├── scoreArticle.ts        # Article ranking algorithm
    │   ├── storage.ts             # AsyncStorage typed wrappers
    │   ├── greeting.ts            # Time-based greeting string
    │   └── timeAgo.ts             # Relative time formatter
    ├── types/
    │   └── index.ts               # Article, UserPreferences, AppSettings, Category types
    ├── constants/
    │   └── config.ts              # API key + base URLs
    └── data/
        └── mockNews.ts            # (unused) mock data for development
```

---

## Design System

| Token | Value | Used for |
|---|---|---|
| Background (dark) | `#0f0f1a` | App root, screen bg |
| Card surface (dark) | `#1a1a2e` | Cards, card container |
| Background (light) | `#f8f8f8` | Light mode bg |
| Card surface (light) | `#ffffff` | Light mode cards |
| Accent | `#4f46e5` (indigo) | Active chips, tab bar, category pills |
| Destructive | `#ff3b5c` | Bookmark / remove actions |
| Subtext (dark) | `#aaaaaa` | Secondary labels |
| Border (dark) | `#2a2a4a` | Dividers, card borders |

- "Swipe up" hint disappears after the first swipe — one-time affordance
- Category chips: active = accent bg + white text; inactive = muted on transparent
- Bottom nav: dark bg with subtle top border, indigo active tint
- Splash screen background: `#1a1a2e` (dark navy)

---

## Notable Config

- **API key**: stored in `src/constants/config.ts` (NewsData.io, free tier: 500 req/day)
- **Babel plugins**: `nativewind/babel` + `react-native-reanimated/plugin` (must be last)
- **Onboarding min categories**: 5 required; Settings allows reducing to 3
- **Cache TTL**: 5 minutes per category + language key
- **Search debounce**: 500ms
- **Interstitial ad**: every 5 swipes (placeholder, no live ad SDK)

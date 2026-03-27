export interface Article {
  id: string;
  title: string;
  summary: string;
  category: Category;
  imageUrl: string;
  url: string;
  source: string;
  publishedAt: string;
  isBreaking?: boolean;
}

export type Category = string;

// Fixed internal category list — values must match NewsData.io category params (lowercased at call time)
export const SUPPORTED_CATEGORIES = [
  'Business',
  'Entertainment',
  'Environment',
  'Food',
  'Health',
  'Politics',
  'Science',
  'Sports',
  'Technology',
  'Top',
  'World',
] as const;

export const DEFAULT_CATEGORY = 'All';
export const TRENDING_CATEGORY = 'Trending';

export interface UserPreferences {
  name: string;
  selectedCategories: string[];
  hasOnboarded: boolean;
  language?: string;
  keywords?: string[];
  lastKeywordCheck?: number; // timestamp ms
  notificationHour?: number; // 0–23, hour of day to fire digest notification
}

export const NOTIFICATION_TIMES = [
  { label: 'Morning', time: '8 AM',  hour: 8  },
  { label: 'Noon',    time: '1 PM',  hour: 13 },
  { label: 'Evening', time: '7 PM',  hour: 19 },
  { label: 'Night',   time: '10 PM', hour: 22 },
] as const;

export const DEFAULT_NOTIFICATION_HOUR = 8;

export interface KeywordDigest {
  id: string;
  date: string;       // ISO date of the day fetched, e.g. "2026-03-28"
  keyword: string;
  articles: Article[];
  isRead: boolean;
  notifiedAt: number; // timestamp ms
}

export interface AppSettings {
  darkMode: boolean;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
] as const;

export type LanguageCode = 'en' | 'hi';

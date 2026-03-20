export interface Article {
  id: string;
  title: string;
  summary: string;
  category: Category;
  imageUrl: string;
  url: string;
  source: string;
  publishedAt: string;
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

export interface UserPreferences {
  name: string;
  selectedCategories: string[];
  hasOnboarded: boolean;
  language?: string;
}

export interface AppSettings {
  darkMode: boolean;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
] as const;

export type LanguageCode = 'en' | 'hi';

import { useState, useEffect, useCallback } from 'react';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_CATEGORIES, DEFAULT_NOTIFICATION_HOUR } from '../types';

const DEFAULT_CATEGORIES = SUPPORTED_CATEGORIES.slice(0, 5) as unknown as string[];

export const useSettings = () => {
  const [userName, setUserNameState] = useState('');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>([]);
  const [keywords, setKeywordsState] = useState<string[]>([]);
  const [notificationHour, setNotificationHourState] = useState(DEFAULT_NOTIFICATION_HOUR);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const { isDark, toggleDark } = useTheme();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (prefs) {
        const cats =
          prefs.selectedCategories.length > 0 ? prefs.selectedCategories : DEFAULT_CATEGORIES;
        console.log('[Settings] loaded categories:', cats);
        setUserNameState(prefs.name);
        setSelectedCategoriesState(cats);
        setKeywordsState(prefs.keywords ?? []);
        setNotificationHourState(prefs.notificationHour ?? DEFAULT_NOTIFICATION_HOUR);
      } else {
        console.log('[Settings] no preferences found, using defaults:', DEFAULT_CATEGORIES);
      }
      setPrefsLoaded(true);
    });
  }, []);

  const setUserName = useCallback(async (name: string) => {
    setUserNameState(name);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name,
      selectedCategories: existing?.selectedCategories ?? DEFAULT_CATEGORIES,
      hasOnboarded: existing?.hasOnboarded ?? true,
      language: existing?.language ?? 'en',
      keywords: existing?.keywords ?? [],
      lastKeywordCheck: existing?.lastKeywordCheck,
      notificationHour: existing?.notificationHour ?? DEFAULT_NOTIFICATION_HOUR,
    });
  }, []);

  const updateCategories = useCallback(async (cats: string[]) => {
    setSelectedCategoriesState(cats);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name: existing?.name ?? '',
      selectedCategories: cats,
      hasOnboarded: true,
      language: existing?.language ?? 'en',
      keywords: existing?.keywords ?? [],
      lastKeywordCheck: existing?.lastKeywordCheck,
      notificationHour: existing?.notificationHour ?? DEFAULT_NOTIFICATION_HOUR,
    });
  }, []);

  const updateKeywords = useCallback(async (kw: string[]) => {
    setKeywordsState(kw);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name: existing?.name ?? '',
      selectedCategories: existing?.selectedCategories ?? DEFAULT_CATEGORIES,
      hasOnboarded: true,
      language: existing?.language ?? 'en',
      keywords: kw,
      lastKeywordCheck: existing?.lastKeywordCheck,
      notificationHour: existing?.notificationHour ?? DEFAULT_NOTIFICATION_HOUR,
    });
  }, []);

  const updateNotificationHour = useCallback(async (hour: number) => {
    setNotificationHourState(hour);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name: existing?.name ?? '',
      selectedCategories: existing?.selectedCategories ?? DEFAULT_CATEGORIES,
      hasOnboarded: true,
      language: existing?.language ?? 'en',
      keywords: existing?.keywords ?? [],
      lastKeywordCheck: existing?.lastKeywordCheck,
      notificationHour: hour,
    });
  }, []);

  const updateLanguage = useCallback((lang: string) => {
    return setLanguage(lang);
  }, [setLanguage]);

  return {
    userName, setUserName,
    selectedCategories, updateCategories,
    keywords, updateKeywords,
    notificationHour, updateNotificationHour,
    language, updateLanguage,
    prefsLoaded, isDark, toggleDark,
  };
};

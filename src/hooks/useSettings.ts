import { useState, useEffect, useCallback } from 'react';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_CATEGORIES } from '../types';

const DEFAULT_CATEGORIES = SUPPORTED_CATEGORIES.slice(0, 5) as unknown as string[];

export const useSettings = () => {
  const [userName, setUserNameState] = useState('');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>([]);
  const [language, setLanguageState] = useState('en');
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const { isDark, toggleDark } = useTheme();

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (prefs) {
        const cats =
          prefs.selectedCategories.length > 0 ? prefs.selectedCategories : DEFAULT_CATEGORIES;
        console.log('[Settings] loaded categories:', cats);
        setUserNameState(prefs.name);
        setSelectedCategoriesState(cats);
        setLanguageState(prefs.language ?? 'en');
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
    });
  }, []);

  const updateLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name: existing?.name ?? '',
      selectedCategories: existing?.selectedCategories ?? DEFAULT_CATEGORIES,
      hasOnboarded: true,
      language: lang,
    });
  }, []);

  return {
    userName, setUserName,
    selectedCategories, updateCategories,
    language, updateLanguage,
    prefsLoaded, isDark, toggleDark,
  };
};

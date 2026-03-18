import { useState, useEffect, useCallback } from 'react';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_CATEGORIES } from '../types';

const DEFAULT_CATEGORIES = SUPPORTED_CATEGORIES.slice(0, 5) as unknown as string[];

export const useSettings = () => {
  const [userName, setUserNameState] = useState('');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>([]);
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
    });
  }, []);

  const updateCategories = useCallback(async (cats: string[]) => {
    setSelectedCategoriesState(cats);
    const existing = await getUserPreferences();
    await saveUserPreferences({
      name: existing?.name ?? '',
      selectedCategories: cats,
      hasOnboarded: true,
    });
  }, []);

  return { userName, setUserName, selectedCategories, updateCategories, prefsLoaded, isDark, toggleDark };
};

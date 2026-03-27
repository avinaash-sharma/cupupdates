import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';

interface LanguageContextValue {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (prefs?.language) setLanguageState(prefs.language);
    });
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    const prefs = await getUserPreferences();
    await saveUserPreferences({
      name: prefs?.name ?? '',
      selectedCategories: prefs?.selectedCategories ?? [],
      hasOnboarded: prefs?.hasOnboarded ?? true,
      language: lang,
      keywords: prefs?.keywords ?? [],
      lastKeywordCheck: prefs?.lastKeywordCheck,
      notificationHour: prefs?.notificationHour,
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

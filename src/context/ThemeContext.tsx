import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  chip: string;
  chipActive: string;
  chipText: string;
  chipActiveText: string;
  headerBg: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#f8f8f8',
  card: '#ffffff',
  text: '#1a1a1a',
  subtext: '#666666',
  border: '#e0e0e0',
  chip: '#f0f0f0',
  chipActive: '#1a1a2e',
  chipText: '#444444',
  chipActiveText: '#ffffff',
  headerBg: '#ffffff',
};

const darkColors: ThemeColors = {
  background: '#0f0f1a',
  card: '#1a1a2e',
  text: '#f0f0f0',
  subtext: '#aaaaaa',
  border: '#2a2a4a',
  chip: '#1a1a2e',
  chipActive: '#4f46e5',
  chipText: '#aaaaaa',
  chipActiveText: '#ffffff',
  headerBg: '#0f0f1a',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    getSettings().then((s) => setIsDark(s.darkMode));
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    saveSettings({ darkMode: next }); // fire-and-forget
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleDark, colors: isDark ? darkColors : lightColors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { THEMES } from '../constants/themes';
import { loadSettings, saveSettings } from '../utils/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      if (s.theme === 'light' || s.theme === 'dark') setThemeState(s.theme);
      setReady(true);
    });
  }, []);

  const setTheme = (mode) => {
    setThemeState(mode);
    saveSettings({ theme: mode });
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    colors: THEMES[theme] || THEMES.dark,
    ready,
  }), [theme, ready]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

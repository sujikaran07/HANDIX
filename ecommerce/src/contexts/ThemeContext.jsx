import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme context for managing light/dark mode
const ThemeContext = createContext(undefined);

// Theme options
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const ThemeProvider = ({ children }) => {
  // State: theme, initialized from localStorage or defaults to light
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('handixTheme');
    return savedTheme || THEMES.LIGHT;
  });

  // Sync theme to localStorage and update document class on change
  useEffect(() => {
    localStorage.setItem('handixTheme', theme);
    // Add or remove 'dark' class on <html> for global styling
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme =>
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };

  // Set a specific theme if valid
  const setThemeMode = (mode) => {
    if (Object.values(THEMES).includes(mode)) {
      setTheme(mode);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDarkMode: theme === THEMES.DARK,
      isLightMode: theme === THEMES.LIGHT,
      toggleTheme,
      setTheme: setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

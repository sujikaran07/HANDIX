import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
const ThemeContext = createContext(undefined);

// Available themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme state from localStorage or default to light theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('handixTheme');
    return savedTheme || THEMES.LIGHT;
  });

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('handixTheme', theme);
    
    // Update document with theme class
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

  // Set a specific theme
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

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

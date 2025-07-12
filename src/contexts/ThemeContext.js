import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { THEME_CONFIG } from '../constants';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: THEME_CONFIG.PRIMARY_COLOR,
      },
      secondary: {
        main: THEME_CONFIG.SECONDARY_COLOR,
      },
      error: {
        main: THEME_CONFIG.ERROR_COLOR,
      },
      background: {
        default: darkMode ? '#121212' : THEME_CONFIG.BACKGROUND_COLOR,
        paper: darkMode ? '#1e1e1e' : THEME_CONFIG.PAPER_COLOR,
      },
      text: {
        primary: darkMode ? '#ffffff' : THEME_CONFIG.TEXT_PRIMARY,
        secondary: darkMode ? '#b3b3b3' : THEME_CONFIG.TEXT_SECONDARY,
      },
    },
    typography: {
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const contextValue = {
    darkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

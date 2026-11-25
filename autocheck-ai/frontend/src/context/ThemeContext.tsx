import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const aplicarClasesTema = (t: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (t === 'dark') {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
  }
};

const obtenerTemaInicial = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('autocheck_theme');
    if (saved === 'dark' || saved === 'light') {
      aplicarClasesTema(saved);
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      aplicarClasesTema('dark');
      localStorage.setItem('autocheck_theme', 'dark');
      return 'dark';
    }
  } catch (e) {}
  aplicarClasesTema('light');
  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(obtenerTemaInicial);

  useEffect(() => {
    aplicarClasesTema(theme);
    try {
      localStorage.setItem('autocheck_theme', theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'autocheck_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        aplicarClasesTema(e.newValue);
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('autocheck_theme', nextTheme);
      } catch (e) {}
      aplicarClasesTema(nextTheme);
      return nextTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('autocheck_theme', newTheme);
    } catch (e) {}
    aplicarClasesTema(newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};

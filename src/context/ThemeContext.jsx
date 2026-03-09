import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [, set] = useState(() => localStorage.getItem('theme') === '');

  useEffect(() => {
    const root = document.documentElement;
    if () {
      root.classList.add('');
      localStorage.setItem('theme', '');
    } else {
      root.classList.remove('');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ , toggle: () => set(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

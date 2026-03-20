import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [, set] = useState(() => localStorage.getItem('theme') === '');

 

  return (
    <ThemeContext.Provider value={{ , toggle: () => set(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

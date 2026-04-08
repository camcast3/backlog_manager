import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  dark: {
    label: '🌙 Dark',
    vars: {
      '--bg': '#0f0f1a',
      '--surface': '#1a1a2e',
      '--surface-alt': '#16213e',
      '--border': '#2a2a4a',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d28d9',
      '--accent-light': '#a78bfa',
      '--text': '#e2e8f0',
      '--text-muted': '#94a3b8',
      '--shadow': '0 4px 20px rgba(0,0,0,0.4)',
    },
  },
  light: {
    label: '☀️ Light',
    vars: {
      '--bg': '#f5f5f5',
      '--surface': '#ffffff',
      '--surface-alt': '#f0f0f0',
      '--border': '#d4d4d8',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d28d9',
      '--accent-light': '#7c3aed',
      '--text': '#1a1a2e',
      '--text-muted': '#6b7280',
      '--shadow': '0 4px 20px rgba(0,0,0,0.08)',
    },
  },
  midnight: {
    label: '🌌 Midnight',
    vars: {
      '--bg': '#020617',
      '--surface': '#0f172a',
      '--surface-alt': '#1e293b',
      '--border': '#1e293b',
      '--accent': '#3b82f6',
      '--accent-hover': '#2563eb',
      '--accent-light': '#60a5fa',
      '--text': '#e2e8f0',
      '--text-muted': '#94a3b8',
      '--shadow': '0 4px 20px rgba(0,0,0,0.6)',
    },
  },
  forest: {
    label: '🌲 Forest',
    vars: {
      '--bg': '#0a1a0f',
      '--surface': '#142118',
      '--surface-alt': '#1a2e20',
      '--border': '#2a4a35',
      '--accent': '#22c55e',
      '--accent-hover': '#16a34a',
      '--accent-light': '#4ade80',
      '--text': '#e2e8f0',
      '--text-muted': '#94a3b8',
      '--shadow': '0 4px 20px rgba(0,0,0,0.4)',
    },
  },
  sunset: {
    label: '🌅 Sunset',
    vars: {
      '--bg': '#1a0a0f',
      '--surface': '#2a1520',
      '--surface-alt': '#3a1f2e',
      '--border': '#4a2a3a',
      '--accent': '#f97316',
      '--accent-hover': '#ea580c',
      '--accent-light': '#fb923c',
      '--text': '#fde8e8',
      '--text-muted': '#d4a0a0',
      '--shadow': '0 4px 20px rgba(0,0,0,0.4)',
    },
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('backlog-theme') || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    const vars = THEMES[theme]?.vars ?? THEMES.dark.vars;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    try { localStorage.setItem('backlog-theme', theme); }
    catch { /* ignore */ }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

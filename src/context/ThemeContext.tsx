import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId } from '../types';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  shortName: string;
  description: string;
  swatches: [string, string, string];
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'charcoal',
    name: 'Matte Charcoal',
    shortName: 'Charcoal',
    description: 'Deep studio charcoal with warm amber focus',
    swatches: ['#111113', '#27272A', '#E5A93C'],
  },
  {
    id: 'ivory',
    name: 'Editorial Ivory',
    shortName: 'Ivory',
    description: 'Warm archival paper with crisp cobalt accent',
    swatches: ['#F8F7F4', '#E4E2DA', '#2563EB'],
  },
  {
    id: 'monochrome',
    name: 'Swiss Monochrome',
    shortName: 'Mono',
    description: 'High-contrast jet black and stark white grid',
    swatches: ['#050505', '#262626', '#FFFFFF'],
  },
  {
    id: 'slate',
    name: 'Midnight Slate',
    shortName: 'Slate',
    description: 'Cool technical slate with sky blue highlights',
    swatches: ['#0B111E', '#22304B', '#38BDF8'],
  },
];

const STORAGE_KEY = 'abr_portfolio_theme';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
  currentThemeDef: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return 'charcoal';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors
    }
  }, [theme]);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
  };

  const cycleTheme = () => {
    const idx = THEMES.findIndex((t) => t.id === theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setThemeState(next.id);
  };

  const currentThemeDef = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, currentThemeDef }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

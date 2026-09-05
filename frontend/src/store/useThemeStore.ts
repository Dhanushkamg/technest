import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'technest_theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDOM = (theme: Theme): 'light' | 'dark' => {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  return resolved;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage write failures
    }
    const resolved = applyThemeToDOM(theme);
    set({ theme, resolvedTheme: resolved });
  },

  initTheme: () => {
    let savedTheme: Theme = 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        savedTheme = stored;
      }
    } catch {
      savedTheme = 'system';
    }

    const resolved = applyThemeToDOM(savedTheme);
    set({ theme: savedTheme, resolvedTheme: resolved });

    // Setup listener for OS system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (get().theme === 'system') {
          const newResolved = applyThemeToDOM('system');
          set({ resolvedTheme: newResolved });
        }
      };

      try {
        mediaQuery.addEventListener('change', listener);
      } catch {
        mediaQuery.addListener(listener);
      }
    }
  },
}));

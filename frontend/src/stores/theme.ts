'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        applyThemeClass(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      initTheme: () => {
        const saved = get().theme;
        const resolved: ResolvedTheme = saved === 'system' ? getSystemTheme() : saved;
        applyThemeClass(resolved);
        set({ resolvedTheme: resolved });

        // Listen for OS color scheme changes if in system mode
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const listener = (e: MediaQueryListEvent) => {
            if (get().theme === 'system') {
              const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
              applyThemeClass(newResolved);
              set({ resolvedTheme: newResolved });
            }
          };
          mediaQuery.addEventListener('change', listener);
        }
      },
    }),
    {
      name: 'learnhub-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

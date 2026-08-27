'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, type Theme } from '@/stores/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'simple' | 'dropdown' | 'segmented';
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({
  variant = 'simple',
  className = '',
  size = 'md',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, initTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted) {
    return (
      <div
        className={`rounded-lg bg-surface-100 dark:bg-surface-800 animate-pulse ${
          size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
        } ${className}`}
      />
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 ${className}`}>
        {(['light', 'dark', 'system'] as Theme[]).map((t) => {
          const isSelected = theme === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-2xs'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
              title={`Switch to ${t} theme`}
            >
              {t === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {t === 'dark' && <Moon className="w-3.5 h-3.5 text-brand-400" />}
              {t === 'system' && <Monitor className="w-3.5 h-3.5 text-surface-500" />}
              <span className="capitalize">{t}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer ${
            size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
          }`}
          title="Change theme preference"
          aria-label="Change theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-brand-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg p-1 z-40 space-y-0.5">
              {[
                { id: 'light' as Theme, label: 'Light', icon: Sun, color: 'text-amber-500' },
                { id: 'dark' as Theme, label: 'Dark', icon: Moon, color: 'text-brand-400' },
                { id: 'system' as Theme, label: 'System', icon: Monitor, color: 'text-surface-400' },
              ].map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTheme(id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    theme === id
                      ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default simple click-to-toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-xl border border-surface-200 dark:border-surface-700/80 bg-surface-50 dark:bg-surface-800/80 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all cursor-pointer shadow-2xs ${
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      } ${className}`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme mode"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-brand-600 hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}

'use client';

import React from 'react';
import { Search } from 'lucide-react';

export interface PageHeroProps {
  badgeIcon?: React.ReactNode;
  badgeText?: string;
  title: string;
  description: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function PageHero({
  badgeIcon,
  badgeText,
  title,
  description,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: PageHeroProps) {
  return (
    <div className="bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 text-white py-16 px-6 border-b border-brand-800/60 dark:border-brand-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-brand-200 uppercase tracking-wider mb-1">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {title}
        </h1>

        <p className="text-lg text-brand-200 dark:text-surface-300 max-w-2xl mx-auto">
          {description}
        </p>

        {onSearchChange !== undefined && (
          <div className="max-w-md mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-surface-400 dark:text-surface-500 pointer-events-none z-10" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/95 dark:bg-surface-900/95 backdrop-blur border border-white/20 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-md transition-all"
              />
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

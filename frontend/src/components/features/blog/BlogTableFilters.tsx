'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface BlogTableFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: 'all' | 'published' | 'draft';
  onFilterChange: (filter: 'all' | 'published' | 'draft') => void;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function BlogTableFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
  publishedCount,
  draftCount,
  pageSize,
  onPageSizeChange,
}: BlogTableFiltersProps) {
  return (
    <div className="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-full lg:w-72">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
        <input
          type="text"
          placeholder="Search article by title..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          All Posts ({totalCount})
        </button>
        <button
          onClick={() => onFilterChange('published')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'published'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => onFilterChange('draft')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'draft'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-surface-500 dark:text-surface-400 font-medium">
        <span>Per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

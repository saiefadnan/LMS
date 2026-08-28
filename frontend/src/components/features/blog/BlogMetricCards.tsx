'use client';

import React from 'react';
import { FileText, Globe, PenTool } from 'lucide-react';

interface BlogMetricCardsProps {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
}

export function BlogMetricCards({
  totalCount,
  publishedCount,
  draftCount,
}: BlogMetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 flex items-center justify-center border border-surface-200 dark:border-surface-700">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">{totalCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Total Articles</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{publishedCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Live & Published</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{draftCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Drafts in Progress</p>
        </div>
      </div>
    </div>
  );
}

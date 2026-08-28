'use client';

import React from 'react';

export interface CourseFiltersProps {
  levelFilter: string;
  onLevelChange: (level: string) => void;
  totalCourses: number;
  startCount: number;
  endCount: number;
}

const levels = [
  { key: 'all', label: 'All Levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

export function CourseFilters({
  levelFilter,
  onLevelChange,
  totalCourses,
  startCount,
  endCount,
}: CourseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">All Courses</h2>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
          Showing {startCount}–{endCount} of {totalCourses} course{totalCourses !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {levels.map((lvl) => (
          <button
            key={lvl.key}
            onClick={() => onLevelChange(lvl.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              levelFilter === lvl.key
                ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs'
                : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
}

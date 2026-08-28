'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface UserTableFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  totalCount: number;
  studentCount: number;
  instructorCount: number;
  managerCount: number;
  adminCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function UserTableFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  totalCount,
  studentCount,
  instructorCount,
  managerCount,
  adminCount,
  pageSize,
  onPageSizeChange,
}: UserTableFiltersProps) {
  return (
    <div className="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-full lg:w-72">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
        <button
          onClick={() => onRoleFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          All Roles ({totalCount})
        </button>
        <button
          onClick={() => onRoleFilterChange('student')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            roleFilter === 'student'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
          }`}
        >
          Students ({studentCount})
        </button>
        <button
          onClick={() => onRoleFilterChange('instructor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            roleFilter === 'instructor'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
          }`}
        >
          Instructors ({instructorCount})
        </button>
        <button
          onClick={() => onRoleFilterChange('content_manager')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            roleFilter === 'content_manager'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
          }`}
        >
          Managers ({managerCount})
        </button>
        <button
          onClick={() => onRoleFilterChange('admin')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            roleFilter === 'admin'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60'
          }`}
        >
          Admins ({adminCount})
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

'use client';

import React from 'react';
import { Users, GraduationCap, UserCheck, ShieldCheck } from 'lucide-react';

interface UserMetricCardsProps {
  totalCount: number;
  studentCount: number;
  instructorCount: number;
  managerAndAdminCount: number;
}

export function UserMetricCards({
  totalCount,
  studentCount,
  instructorCount,
  managerAndAdminCount,
}: UserMetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 flex items-center justify-center border border-surface-200 dark:border-surface-700">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-black text-surface-900 dark:text-surface-50">{totalCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Total Users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{studentCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Students</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{instructorCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Instructors</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{managerAndAdminCount}</span>
          <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Managers & Admins</p>
        </div>
      </div>
    </div>
  );
}

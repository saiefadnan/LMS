'use client';

import React from 'react';
import { GraduationCap, UserCheck } from 'lucide-react';

interface AuthRoleSelectorProps {
  selectedRole: 'student' | 'instructor';
  onSelectRole: (role: 'student' | 'instructor') => void;
  animationDelay?: string;
}

export function AuthRoleSelector({
  selectedRole,
  onSelectRole,
  animationDelay = '150ms',
}: AuthRoleSelectorProps) {
  return (
    <div className="animate-item-slide-left" style={{ animationDelay }}>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectRole('student')}
          className={`p-2.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${
            selectedRole === 'student'
              ? 'border-brand-600 dark:border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 ring-1 ring-brand-600 dark:ring-brand-500'
              : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-surface-300'
          }`}
        >
          <GraduationCap
            className={`w-4 h-4 mb-1 ${
              selectedRole === 'student'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-surface-400'
            }`}
          />
          <span
            className={`block font-bold text-xs ${
              selectedRole === 'student'
                ? 'text-brand-900 dark:text-brand-200'
                : 'text-surface-900 dark:text-surface-100'
            }`}
          >
            Learn
          </span>
          <span className="text-[10px] text-surface-500 dark:text-surface-400 block">
            Take courses & quizzes
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole('instructor')}
          className={`p-2.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${
            selectedRole === 'instructor'
              ? 'border-brand-600 dark:border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 ring-1 ring-brand-600 dark:ring-brand-500'
              : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-surface-300'
          }`}
        >
          <UserCheck
            className={`w-4 h-4 mb-1 ${
              selectedRole === 'instructor'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-surface-400'
            }`}
          />
          <span
            className={`block font-bold text-xs ${
              selectedRole === 'instructor'
                ? 'text-brand-900 dark:text-brand-200'
                : 'text-surface-900 dark:text-surface-100'
            }`}
          >
            Teach
          </span>
          <span className="text-[10px] text-surface-500 dark:text-surface-400 block">
            Publish courses & lessons
          </span>
        </button>
      </div>
    </div>
  );
}

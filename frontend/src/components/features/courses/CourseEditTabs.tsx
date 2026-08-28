'use client';

import React from 'react';
import { FileText, BookOpen, HelpCircle, Users, Layers } from 'lucide-react';

export type EditCourseTab = 'details' | 'lessons' | 'quizzes' | 'students' | 'all';

interface CourseEditTabsProps {
  activeTab: EditCourseTab;
  onTabChange: (tab: EditCourseTab) => void;
  lessonCount: number;
  quizCount: number;
  studentCount: number;
}

export function CourseEditTabs({
  activeTab,
  onTabChange,
  lessonCount,
  quizCount,
  studentCount,
}: CourseEditTabsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-x-auto">
      <button
        onClick={() => onTabChange('details')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'details'
            ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span>Course Details & Settings</span>
      </button>

      <button
        onClick={() => onTabChange('lessons')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'lessons'
            ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Curriculum ({lessonCount})</span>
      </button>

      <button
        onClick={() => onTabChange('quizzes')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'quizzes'
            ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
        }`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Quizzes ({quizCount})</span>
      </button>

      <button
        onClick={() => onTabChange('students')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'students'
            ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Student Roster ({studentCount})</span>
      </button>

      <button
        onClick={() => onTabChange('all')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
          activeTab === 'all'
            ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
            : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>All Sections</span>
      </button>
    </div>
  );
}

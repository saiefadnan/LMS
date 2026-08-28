'use client';

import React from 'react';
import { Course } from '@/types';
import { CheckCircle2, Users, BookOpen, HelpCircle } from 'lucide-react';

interface CourseEditMetricsProps {
  course: Course;
}

export function CourseEditMetrics({ course }: CourseEditMetricsProps) {
  const lessonCount = course.lessons?.length || 0;
  const quizCount = course.quizzes?.length || 0;
  const studentCount = course.enrollments?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Visibility Status</p>
          <p className="text-base font-bold text-surface-900 dark:text-surface-100 mt-1">
            {course.published ? 'Live & Public' : 'Draft Mode'}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            course.published
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Total Enrolled</p>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{studentCount} Learners</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Lessons Count</p>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{lessonCount} Modules</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Assessments</p>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{quizCount} Quizzes</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <HelpCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

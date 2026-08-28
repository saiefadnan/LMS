'use client';

import React from 'react';
import { Lesson } from '@/types';
import { Video, FileText } from 'lucide-react';

interface CourseCurriculumListProps {
  lessons?: Lesson[];
}

export function CourseCurriculumList({ lessons = [] }: CourseCurriculumListProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
      <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-4 tracking-tight">
        Course Curriculum
      </h2>

      {lessons.length > 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 divide-y divide-surface-100 dark:divide-surface-800 shadow-xs">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="p-4 sm:p-5 flex items-start gap-4 hover:bg-surface-50/70 dark:hover:bg-surface-800/60 transition-colors"
            >
              <div className="shrink-0 w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 font-bold text-xs mt-0.5">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                  {lesson.videoUrl ? (
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                      <span>Video Lesson</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                      <span>Reading Module</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
          <p className="text-surface-500 dark:text-surface-400">
            No lessons have been published for this course yet.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

interface CourseEditSidebarProps {
  course: Course;
  isDeleting: boolean;
  onDeleteCourse: () => void;
}

export function CourseEditSidebar({
  course,
  isDeleting,
  onDeleteCourse,
}: CourseEditSidebarProps) {
  const lessonCount = course.lessons?.length || 0;
  const quizCount = course.quizzes?.length || 0;
  const studentCount = course.enrollments?.length || 0;

  return (
    <div className="space-y-6">
      <div className="bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
        <h3 className="font-bold text-surface-900 dark:text-surface-50 text-sm mb-3.5">Course Overview</h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400">Status</span>
            <span
              className={
                course.published
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-amber-700 dark:text-amber-400 font-semibold'
              }
            >
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400">Students</span>
            <span className="text-surface-900 dark:text-surface-100 font-semibold">{studentCount}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400">Lessons</span>
            <span className="text-surface-900 dark:text-surface-100 font-semibold">{lessonCount}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400">Quizzes</span>
            <span className="text-surface-900 dark:text-surface-100 font-semibold">{quizCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500 dark:text-surface-400">Created</span>
            <span className="text-surface-700 dark:text-surface-300">
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 p-5 space-y-3 shadow-xs">
        <h3 className="font-bold text-red-900 dark:text-red-300 text-xs uppercase tracking-wider">Danger Zone</h3>
        <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">
          Permanently remove this course, its lessons, quizzes, and associated records.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onDeleteCourse}
          isLoading={isDeleting}
          className="w-full gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Course</span>
        </Button>
      </div>
    </div>
  );
}

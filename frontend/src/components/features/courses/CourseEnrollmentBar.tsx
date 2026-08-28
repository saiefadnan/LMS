'use client';

import React from 'react';
import Link from 'next/link';
import { Course, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Settings, ArrowRight } from 'lucide-react';

interface CourseEnrollmentBarProps {
  course: Course;
  user: User | null;
  roleType: string | null;
  isInstructorOfCourse: boolean;
  isGlobalManager: boolean;
  isEnrolled: boolean;
  enrolling: boolean;
  onEnroll: () => void;
}

export function CourseEnrollmentBar({
  course,
  user,
  roleType,
  isInstructorOfCourse,
  isGlobalManager,
  isEnrolled,
  enrolling,
  onEnroll,
}: CourseEnrollmentBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-md border border-surface-200 dark:border-surface-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
            {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse)
              ? 'Course Management'
              : 'Ready to start learning?'}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-xs mt-0.5">
            {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse)
              ? 'You have permission to edit curriculum, quizzes, and monitor enrolled student progress.'
              : 'Join this course to access all lessons and track your progress.'}
          </p>
        </div>

        <div className="w-full sm:w-auto min-w-[200px]">
          {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse) ? (
            <Link href={`/dashboard/courses/${course.documentId}/edit`} className="block w-full">
              <Button variant="primary" className="w-full gap-2 cursor-pointer" size="lg">
                <Settings className="w-4 h-4" />
                <span>Edit Curriculum & Settings</span>
              </Button>
            </Link>
          ) : roleType === 'instructor' ? (
            <div className="text-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-xs text-surface-600 dark:text-surface-300 font-semibold">
              Instructor Account (Enrollment is for Students)
            </div>
          ) : isEnrolled ? (
            <Link href={`/learn/${course.documentId}`} className="block w-full">
              <Button variant="secondary" className="w-full gap-2 cursor-pointer" size="lg">
                <span>Resume Course</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 cursor-pointer"
              onClick={onEnroll}
              isLoading={enrolling}
            >
              Enroll Now
            </Button>
          )}

          {!user && !isEnrolled && (
            <p className="text-xs text-center text-surface-400 mt-2">
              You will be asked to sign in as student
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

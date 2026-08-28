'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyEnrollments } from '@/hooks/queries/useCourses';
import { useMyEnrollmentsProgress } from '@/hooks/queries/useProgress';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { CourseGrid } from '@/components/features/CourseGrid';
import { Search } from 'lucide-react';

export default function MyCoursesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments(Boolean(user));
  const { progressMap, isLoading: progressLoading } = useMyEnrollmentsProgress(enrollments);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  if (!user) return null;

  const isLoading = enrollmentsLoading || progressLoading;

  const enrolledCourses = enrollments
    .map((e) => e.course)
    .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined);

  const filteredCourses = enrolledCourses.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.category || '').toLowerCase().includes(term)
    );
  });

  const totalCourses = filteredCourses.length;
  const pageCount = Math.ceil(totalCourses / pageSize) || 1;
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const startCount = totalCourses === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalCourses);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
            Continue learning and track your progress across all enrolled courses
          </p>
        </div>
        <Link href="/courses">
          <Button variant="primary" className="cursor-pointer">
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
        </div>

        <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
          Showing {startCount}–{endCount} of {totalCourses} course{totalCourses !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white dark:bg-surface-900 rounded-xl h-64 border border-surface-200 dark:border-surface-800"></div>
      ) : (
        <>
          <CourseGrid
            courses={paginatedCourses}
            emptyMessage={
              searchQuery
                ? 'No enrolled courses matched your search query.'
                : "You haven't enrolled in any courses yet. Discover our catalog to get started!"
            }
            renderAction={(course) => {
              const prog = progressMap[course.documentId] || { completed: 0, total: course.lessons?.length || 0, percentage: 0 };
              const isFinished = prog.percentage === 100 && prog.total > 0;
              const hasStarted = prog.completed > 0;

              return (
                <div className="w-full space-y-2.5 pt-1">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-surface-500 dark:text-surface-400">
                        {prog.completed} / {prog.total} lessons
                      </span>
                      <span className={isFinished ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}>
                        {prog.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isFinished ? 'bg-emerald-500' : 'bg-brand-600 dark:bg-brand-500'
                        }`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/learn/${course.documentId}`} className="block">
                    <Button
                      variant={isFinished ? 'outline' : 'primary'}
                      className="w-full text-xs font-semibold cursor-pointer"
                    >
                      {isFinished ? 'Review Course' : hasStarted ? 'Resume Learning' : 'Start Course'}
                    </Button>
                  </Link>
                </div>
              );
            }}
          />

          <Pagination
            currentPage={page}
            totalPages={pageCount}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

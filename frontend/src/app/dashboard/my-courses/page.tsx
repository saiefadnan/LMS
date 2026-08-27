'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyEnrollments, getMyProgress } from '@/lib/api';
import { type Enrollment } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { CourseGrid } from '@/components/features/CourseGrid';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number; percentage: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchEnrollmentsAndProgress() {
      if (!user) return;
      try {
        const res = await getMyEnrollments();
        const rawEnrollments = res.data || [];
        setEnrollments(rawEnrollments);

        // Fetch progress for each course in parallel
        const map: Record<string, { completed: number; total: number; percentage: number }> = {};
        await Promise.all(
          rawEnrollments.map(async (e) => {
            const course = e.course;
            if (!course || !course.documentId) return;
            try {
              const progRes = await getMyProgress(course.documentId);
              const completedCount = (progRes.data || []).filter((p) => p.completed).length;
              const totalLessons = course.lessons?.length || 0;
              const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
              map[course.documentId] = { completed: completedCount, total: totalLessons, percentage };
            } catch {
              map[course.documentId] = { completed: 0, total: course.lessons?.length || 0, percentage: 0 };
            }
          })
        );
        setProgressMap(map);
      } catch (error) {
        console.error('Failed to load enrollments', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollmentsAndProgress();
  }, [user]);

  if (!user) return null;

  // Extract courses from enrollments
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">My Enrolled Courses</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Pick up right where you left off</p>
        </div>
        <Link href="/courses">
          <Button variant="secondary" className="cursor-pointer">
            Browse Catalog
          </Button>
        </Link>
      </div>

      {/* Search & Counter Bar */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
            <input
              type="text"
              placeholder="Search your enrolled courses..."
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
      )}

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-surface-900 rounded-xl h-64 border border-surface-200 dark:border-surface-800"></div>
      ) : (
        <>
          <CourseGrid 
            courses={paginatedCourses} 
            emptyMessage={
              searchQuery
                ? 'No enrolled courses matched your search.'
                : "You haven't enrolled in any courses yet."
            }
            renderAction={(course) => {
              const prog = progressMap[course.documentId] || { completed: 0, total: course.lessons?.length || 0, percentage: 0 };
              return (
                <div className="w-full space-y-2.5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">
                      <span>Progress ({prog.completed}/{prog.total} lessons)</span>
                      <span className={`font-bold ${prog.percentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400'}`}>
                        {prog.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          prog.percentage === 100 ? 'bg-emerald-500' : 'bg-brand-600 dark:bg-brand-500'
                        }`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                  <Link href={`/learn/${course.documentId}`} className="w-full block">
                    <Button 
                      variant={prog.percentage === 100 ? 'outline' : 'primary'} 
                      className="w-full text-xs"
                    >
                      <span>{prog.percentage === 100 ? 'Review Curriculum' : prog.completed > 0 ? 'Resume Learning' : 'Start Course'}</span>
                    </Button>
                  </Link>
                </div>
              );
            }}
          />

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 shadow-xs">
                Page {page} of {pageCount}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

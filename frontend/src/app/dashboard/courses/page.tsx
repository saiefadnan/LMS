'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCourses, useMyCourses, useDeleteCourse } from '@/hooks/queries/useCourses';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { CourseGrid } from '@/components/features/CourseGrid';
import { Search, Plus, Trash2 } from 'lucide-react';
import { modal } from '@/stores/modal';

export default function InstructorCoursesPage() {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';
  const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

  // Server-side paginated queries
  const allCoursesQuery = useCourses(
    isGlobalManager ? { page, pageSize, search: searchQuery } : { page: 1, pageSize: 1 }
  );
  const myCoursesQuery = useMyCourses(
    !isGlobalManager ? { page, pageSize, search: searchQuery } : {},
    !isGlobalManager && Boolean(user)
  );

  const activeQuery = isGlobalManager ? allCoursesQuery : myCoursesQuery;
  const courses = activeQuery.data?.courses || [];
  const pagination = activeQuery.data?.pagination || { page: 1, pageSize: 6, pageCount: 1, total: 0 };
  const isLoading = activeQuery.isLoading;

  const deleteMutation = useDeleteCourse();

  const handleDeleteCourse = async (targetCourse: Course) => {
    const confirmed = await modal.confirm({
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete course "${targetCourse.title}"? All associated lessons, quizzes, and student records will be removed.`,
      variant: 'danger',
      confirmText: 'Delete Course',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(targetCourse.documentId);
    } catch (err: any) {
      modal.alert({
        title: 'Deletion Failed',
        message: err.message || 'Failed to delete course. Please try again.',
        variant: 'danger',
      });
    }
  };

  if (!user) return null;

  const totalCourses = pagination.total;
  const pageCount = pagination.pageCount;
  const startCount = totalCourses === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalCourses);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
            {isGlobalManager ? 'All Courses' : 'My Courses'}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
            Manage your curriculum and student enrollments
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button variant="primary" className="gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
          <input
            type="text"
            placeholder="Search courses by title or topic..."
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
            courses={courses}
            emptyMessage={
              searchQuery
                ? 'No courses matched your search query.'
                : "You haven't created any courses yet."
            }
            renderAction={(course) => (
              <div className="flex items-center gap-2.5 w-full py-1">
                <Link href={`/dashboard/courses/${course.documentId}/edit`} className="flex-1">
                  <Button variant="secondary" className="w-full text-xs font-semibold cursor-pointer">
                    Edit Course
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCourse(course)}
                  className="px-2.5 text-xs cursor-pointer"
                  title="Delete course"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
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

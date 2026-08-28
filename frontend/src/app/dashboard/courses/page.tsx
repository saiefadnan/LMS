'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses, getMyCourses, deleteCourse } from '@/lib/api';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { CourseGrid } from '@/components/features/CourseGrid';
import { Search, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const user = useAuthStore((s) => s.user);

  const roleType = user
    ? (typeof user.role === 'object' ? user.role?.type : user.role) || 'student'
    : 'student';

  useEffect(() => {
    async function fetchMyCourses() {
      if (!user) return;
      try {
        // Admins and Content Managers see all courses, Instructors see only their own
        const isGlobal = roleType === 'admin' || roleType === 'content_manager';
        const res = isGlobal
          ? await getCourses()
          : await getMyCourses();
        setCourses(res.data || []);
      } catch (error) {
        console.error('Failed to load courses', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, [user, roleType]);

  const handleDeleteCourse = async (targetCourse: Course) => {
    if (!window.confirm(`Are you sure you want to delete course "${targetCourse.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCourse(targetCourse.documentId);
      setCourses((prev) => prev.filter((c) => c.documentId !== targetCourse.documentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  if (!user) return null;

  const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

  const filteredCourses = courses.filter((c) => {
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
            {isGlobalManager ? 'All Courses' : 'My Courses'}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Manage your curriculum and student enrollments</p>
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

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-surface-900 rounded-xl h-64 border border-surface-200 dark:border-surface-800"></div>
      ) : (
        <>
          <CourseGrid 
            courses={paginatedCourses} 
            emptyMessage={
              searchQuery
                ? 'No courses matched your search query.'
                : "You haven't created any courses yet."
            }
            renderAction={(course) => (
              <div className="flex items-center gap-2 w-full">
                <Link href={`/dashboard/courses/${course.documentId}/edit`} className="flex-1">
                  <Button variant="secondary" className="w-full text-xs cursor-pointer">
                    Edit Course
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCourse(course)}
                  className="px-2.5 text-xs cursor-pointer"
                  title="Delete course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
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

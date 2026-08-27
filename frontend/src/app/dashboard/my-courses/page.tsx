'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyEnrollments } from '@/lib/api';
import { type Enrollment } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { CourseGrid } from '@/components/features/CourseGrid';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      try {
        const res = await getMyEnrollments();
        setEnrollments(res.data || []);
      } catch (error) {
        console.error('Failed to load enrollments', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
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
          <h1 className="text-2xl font-bold text-surface-900">My Learning</h1>
          <p className="text-surface-500 text-sm mt-0.5">Pick up right where you left off</p>
        </div>
        <Link href="/courses">
          <Button variant="secondary" className="cursor-pointer">
            Browse Catalog
          </Button>
        </Link>
      </div>

      {/* Search & Counter Bar */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-surface-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search your enrolled courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-surface-900"
            />
          </div>

          <span className="text-xs text-surface-500 font-medium">
            Showing {startCount}–{endCount} of {totalCourses} course{totalCourses !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-white rounded-xl h-64 border border-surface-200"></div>
      ) : (
        <>
          <CourseGrid 
            courses={paginatedCourses} 
            emptyMessage={
              searchQuery
                ? 'No enrolled courses matched your search.'
                : "You haven't enrolled in any courses yet."
            }
            renderAction={(course) => (
              <Link href={`/learn/${course.documentId}`} className="w-full">
                <Button variant="primary" className="w-full group cursor-pointer">
                  Resume Course
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
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

              <span className="text-xs font-semibold text-surface-700 bg-white px-3 py-1.5 rounded-lg border border-surface-200 shadow-sm">
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

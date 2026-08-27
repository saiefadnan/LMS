'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { type Course } from '@/types';
import { CourseGrid } from '@/components/features/CourseGrid';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await getCourses();
        setCourses(response.data || []);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(term) ||
      (course.description || '').toLowerCase().includes(term) ||
      (course.category || '').toLowerCase().includes(term);

    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const totalCourses = filteredCourses.length;
  const pageCount = Math.ceil(totalCourses / pageSize) || 1;
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const startCount = totalCourses === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalCourses);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Navbar for Public Pages */}
      <nav className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-1">
                <span className="text-brand-600">Learn</span>Hub
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/blog" className="text-surface-600 hover:text-surface-900 font-medium hidden sm:block mr-2">
                Blog
              </Link>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-surface-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Expand Your Knowledge
          </h1>
          <p className="text-xl text-surface-300 max-w-2xl mx-auto">
            Discover premium courses created by expert instructors. Start learning today.
          </p>

          {/* Search bar inside hero */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search courses by topic, title, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-surface-900 shadow-lg placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-surface-900">All Courses</h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Showing {startCount}–{endCount} of {totalCourses} course{totalCourses !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLevelFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                levelFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => {
                setLevelFilter('beginner');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                levelFilter === 'beginner'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => {
                setLevelFilter('intermediate');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                levelFilter === 'intermediate'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => {
                setLevelFilter('advanced');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                levelFilter === 'advanced'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-surface-200 overflow-hidden h-[400px]">
                <div className="h-48 bg-surface-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-surface-200 rounded w-3/4"></div>
                  <div className="h-4 bg-surface-200 rounded w-full"></div>
                  <div className="h-4 bg-surface-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <CourseGrid
              courses={paginatedCourses}
              emptyMessage={
                searchQuery || levelFilter !== 'all'
                  ? 'No courses matched your search or filter.'
                  : 'No courses found in the catalog.'
              }
            />

            {/* Pagination Controls */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8">
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

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-surface-500">
          <p>© 2026 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { type Course } from '@/types';
import { CourseGrid } from '@/components/features/CourseGrid';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Expand Your Knowledge
          </h1>
          <p className="text-xl text-surface-300 max-w-2xl mx-auto">
            Discover hundreds of premium courses created by expert instructors. Start learning today.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-surface-900">All Courses</h2>
          <div className="text-surface-500 text-sm">
            Showing {courses.length} result{courses.length !== 1 ? 's' : ''}
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
          <CourseGrid courses={courses} />
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

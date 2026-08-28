'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '@/lib/api';
import { type Course } from '@/types';
import { Navbar } from '@/components/ui/Navbar';
import { PageHero } from '@/components/ui/PageHero';
import { Footer } from '@/components/ui/Footer';
import { Pagination } from '@/components/ui/Pagination';
import { CourseGrid } from '@/components/features/CourseGrid';
import { CourseFilters } from '@/components/features/courses/CourseFilters';
import { GraduationCap } from 'lucide-react';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;

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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col transition-colors duration-150">
      <Navbar />

      <PageHero
        badgeIcon={<GraduationCap className="w-4 h-4" />}
        badgeText="Course Directory"
        title="Expand Your Knowledge"
        description="Discover premium courses created by expert instructors. Start learning today."
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Search courses by topic, title, or category..."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-8">
        <CourseFilters
          levelFilter={levelFilter}
          onLevelChange={(lvl) => {
            setLevelFilter(lvl);
            setPage(1);
          }}
          totalCourses={totalCourses}
          startCount={startCount}
          endCount={endCount}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <CourseGrid
              courses={paginatedCourses}
              emptyMessage={
                searchQuery || levelFilter !== 'all'
                  ? 'No courses match your active search filters.'
                  : 'No courses are currently available.'
              }
            />

            <Pagination
              currentPage={page}
              totalPages={pageCount}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

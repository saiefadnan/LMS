'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyEnrollments } from '@/lib/api';
import { type Enrollment } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { CourseGrid } from '@/components/features/CourseGrid';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      try {
        const res = await getMyEnrollments(user.id);
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
    .map(e => e.course)
    .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Learning</h1>
          <p className="text-surface-500 mt-1">Pick up right where you left off.</p>
        </div>
        <Link href="/courses">
          <Button variant="secondary">Browse Catalog</Button>
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white rounded-xl h-64 border border-surface-200"></div>
      ) : (
        <CourseGrid 
          courses={enrolledCourses} 
          emptyMessage="You haven't enrolled in any courses yet."
          renderAction={(course) => (
            <Link href={`/learn/${course.documentId}`} className="w-full">
              <Button variant="primary" className="w-full group">
                Resume Course
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          )}
        />
      )}
    </div>
  );
}

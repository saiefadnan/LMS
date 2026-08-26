'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { CourseGrid } from '@/components/features/CourseGrid';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchMyCourses() {
      if (!user) return;
      try {
        // Admins see all courses, Instructors see only their own
        const query = user.role.type === 'admin' 
          ? '' 
          : `filters[instructor][id][$eq]=${user.id}`;
        
        const res = await getCourses(query);
        setCourses(res.data);
      } catch (error) {
        console.error('Failed to load courses', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {user.role.type === 'admin' ? 'All Courses' : 'My Courses'}
          </h1>
          <p className="text-surface-500 mt-1">Manage your course catalog</p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button variant="primary">
            + Create New Course
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white rounded-xl h-64 border border-surface-200"></div>
      ) : (
        <CourseGrid 
          courses={courses} 
          emptyMessage="You haven't created any courses yet."
          renderAction={(course) => (
            <Link href={`/dashboard/courses/${course.documentId}/edit`} className="w-full">
              <Button variant="secondary" className="w-full">
                Edit Course
              </Button>
            </Link>
          )}
        />
      )}
    </div>
  );
}

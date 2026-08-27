'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/api';
import { Course } from '@/types';
import LearningSidebar from '@/components/features/LearningSidebar';
import { useProgressStore } from '@/stores/progress';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { progress, fetchProgress } = useProgressStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes] = await Promise.all([
          getCourse(courseId),
          fetchProgress(courseId)
        ]);
        
        const fetchedCourse = courseRes.data;
        if (!fetchedCourse) {
          router.push('/dashboard/my-courses');
          return;
        }

        // Sort lessons immediately
        if (fetchedCourse.lessons) {
          fetchedCourse.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        
        setCourse(fetchedCourse);
      } catch (err) {
        console.error('Failed to load learning data', err);
        router.push('/dashboard/my-courses');
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId) {
      loadData();
    }
  }, [courseId, router, fetchProgress]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return null;

  const completedLessonIds = progress
    .filter(p => p.completed && p.lesson)
    .map(p => p.lesson!.id);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-150">
      <LearningSidebar 
        course={course} 
        completedLessonIds={completedLessonIds} 
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

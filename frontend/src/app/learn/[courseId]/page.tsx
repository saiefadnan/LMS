'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '@/hooks/queries/useCourses';

export default function LearnIndexPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading, isError } = useCourse(courseId);

  useEffect(() => {
    if (isLoading) return;

    if (isError || !course) {
      router.replace('/dashboard/my-courses');
      return;
    }

    if (course.lessons && course.lessons.length > 0) {
      const sorted = [...course.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
      const firstLesson = sorted[0];
      router.replace(`/learn/${courseId}/${firstLesson.documentId}`);
    }
  }, [course, isLoading, isError, courseId, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-8 text-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">No Lessons Found</h2>
        <p className="text-surface-500">This course doesn't have any lessons yet.</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/api';

export default function LearnIndexPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectFirstLesson() {
      try {
        const res = await getCourse(courseId);
        const course = res.data;
        if (course && course.lessons && course.lessons.length > 0) {
          const sorted = [...course.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
          const firstLesson = sorted[0];
          router.replace(`/learn/${courseId}/${firstLesson.documentId}`);
        } else {
          // If no lessons, just stay here or show a message
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load course for redirect', err);
        router.replace('/dashboard/my-courses');
      }
    }
    
    redirectFirstLesson();
  }, [courseId, router]);

  if (loading) {
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

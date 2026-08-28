'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '@/hooks/queries/useCourses';
import { useCourseProgress } from '@/hooks/queries/useProgress';
import LearningSidebar from '@/components/features/LearningSidebar';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: progress = [], isLoading: progressLoading } = useCourseProgress(courseId);

  const loading = courseLoading || progressLoading;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    router.push('/dashboard/my-courses');
    return null;
  }

  // Sort lessons if present
  if (course.lessons) {
    course.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const completedLessonIds = progress
    .filter((p) => p.completed && p.lesson)
    .map((p) => p.lesson!.id);

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

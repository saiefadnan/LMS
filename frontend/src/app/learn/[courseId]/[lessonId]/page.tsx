'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/queries/useCourses';
import { useCourseProgress, useMarkLessonComplete } from '@/hooks/queries/useProgress';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: progress = [], isLoading: progressLoading } = useCourseProgress(courseId);
  const markCompleteMutation = useMarkLessonComplete();

  const loading = courseLoading || progressLoading;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!course || !course.lessons) {
    router.push('/dashboard/my-courses');
    return null;
  }

  const sortedLessons = [...course.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentLesson = sortedLessons.find((l) => l.documentId === lessonId);

  if (!currentLesson) {
    router.replace(`/learn/${courseId}`);
    return null;
  }

  const isCompleted = progress.some((p) => p.completed && p.lesson?.id === currentLesson.id);

  // Navigation
  const currentIndex = sortedLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (isCompleted || markCompleteMutation.isPending) return;
    try {
      if (roleType === 'student') {
        await markCompleteMutation.mutateAsync({
          lessonId: currentLesson.id,
          courseDocId: courseId,
        });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    }
  };

  // Helper to safely embed youtube videos
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
          {currentLesson.title}
        </h1>
      </div>

      {/* Video Player */}
      {currentLesson.videoUrl && (
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-xl border border-surface-200/20">
          <iframe
            src={getEmbedUrl(currentLesson.videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentLesson.title}
          />
        </div>
      )}

      {/* Lesson Content */}
      <div className="prose prose-surface dark:prose-invert max-w-none mb-12 text-surface-800 dark:text-surface-200 whitespace-pre-wrap leading-relaxed text-lg font-serif">
        {currentLesson.content || 'No text content available for this lesson.'}
      </div>

      {/* Action / Next Steps */}
      <div className="mt-12 p-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          {isCompleted ? "You've completed this lesson!" : 'Finished learning?'}
        </h3>
        <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">
          {isCompleted
            ? 'Great job. Keep up the momentum and move on to the next one.'
            : 'Mark this lesson as complete to track your progress.'}
        </p>

        <Button
          size="lg"
          variant={isCompleted ? 'secondary' : 'primary'}
          onClick={handleMarkComplete}
          disabled={isCompleted || markCompleteMutation.isPending}
          className="w-full sm:w-auto min-w-48 cursor-pointer"
        >
          {markCompleteMutation.isPending ? (
            'Marking...'
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex items-center justify-between pt-8 border-t border-surface-200 dark:border-surface-800">
        {prevLesson ? (
          <Link href={`/learn/${courseId}/${prevLesson.documentId}`}>
            <Button variant="ghost" className="gap-2 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div></div>
        )}

        {nextLesson ? (
          <Link href={`/learn/${courseId}/${nextLesson.documentId}`}>
            <Button variant="secondary" className="gap-2 group cursor-pointer">
              Next Lesson
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : course.quizzes && course.quizzes.length > 0 ? (
          <Link href={`/learn/${courseId}/quiz/${course.quizzes[0].documentId}`}>
            <Button
              variant="primary"
              className="gap-2 group bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Take Course Assessment</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" disabled>
            End of Course
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourse, markLessonComplete } from '@/lib/api';
import { Course, Lesson } from '@/types';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useProgressStore } from '@/stores/progress';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  
  const { progress, fetchProgress } = useProgressStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes] = await Promise.all([
          getCourse(courseId),
          // We don't necessarily need to fetch progress here if layout already did it,
          // but we can ensure it's loaded just in case this page is hit directly
          progress.length === 0 ? fetchProgress(courseId) : Promise.resolve()
        ]);
        
        const fetchedCourse = courseRes.data;
        if (!fetchedCourse || !fetchedCourse.lessons) {
          router.push('/dashboard/my-courses');
          return;
        }

        const sortedLessons = [...fetchedCourse.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
        fetchedCourse.lessons = sortedLessons;
        setCourse(fetchedCourse);
        
        const lesson = sortedLessons.find(l => l.documentId === lessonId);
        if (!lesson) {
          router.replace(`/learn/${courseId}`);
          return;
        }
        setCurrentLesson(lesson);
      } catch (err) {
        console.error('Failed to load lesson', err);
        router.push('/dashboard/my-courses');
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId && lessonId) {
      loadData();
    }
  }, [courseId, lessonId, router, fetchProgress, progress.length]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  const isCompleted = progress.some(p => p.completed && p.lesson?.id === currentLesson.id);
  
  // Navigation
  const currentIndex = course.lessons!.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? course.lessons![currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons!.length - 1 ? course.lessons![currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (isCompleted || marking) return;
    setMarking(true);
    try {
      await markLessonComplete(currentLesson.id);
      
      // Update global store state
      await fetchProgress(courseId);
      
      // Optionally auto-navigate to next lesson
      // if (nextLesson) {
      //   router.push(`/learn/${courseId}/${nextLesson.documentId}`);
      // }
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    } finally {
      setMarking(false);
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
        <h1 className="text-3xl font-bold text-surface-900">{currentLesson.title}</h1>
      </div>

      {/* Video Player */}
      {currentLesson.videoUrl && (
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-xl">
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
      <div className="prose prose-surface max-w-none mb-12 text-surface-800 whitespace-pre-wrap leading-relaxed text-lg">
        {currentLesson.content || 'No text content available for this lesson.'}
      </div>

      {/* Action / Next Steps */}
      <div className="mt-12 p-8 bg-white border border-surface-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="text-xl font-bold text-surface-900 mb-2">
          {isCompleted ? "You've completed this lesson!" : "Finished learning?"}
        </h3>
        <p className="text-surface-500 mb-6">
          {isCompleted 
            ? "Great job. Keep up the momentum and move on to the next one." 
            : "Mark this lesson as complete to track your progress."}
        </p>
        
        <Button 
          size="lg" 
          variant={isCompleted ? 'outline' : 'primary'}
          onClick={handleMarkComplete}
          disabled={isCompleted || marking}
          className="w-full sm:w-auto min-w-48"
        >
          {marking ? 'Marking...' : isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex items-center justify-between pt-8 border-t border-surface-200">
        {prevLesson ? (
          <Link href={`/learn/${courseId}/${prevLesson.documentId}`}>
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div></div> // Spacer
        )}
        
        {nextLesson ? (
          <Link href={`/learn/${courseId}/${nextLesson.documentId}`}>
            <Button variant="secondary" className="gap-2 group">
              Next Lesson
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

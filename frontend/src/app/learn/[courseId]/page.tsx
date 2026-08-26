'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/lib/api';
import { type Course, type Lesson } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';

function LessonViewerContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseDocumentId = params.courseId as string;
  const currentLessonId = searchParams.get('lessonId');
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getCourse(courseDocumentId);
        setCourse(res.data);
      } catch (err) {
        console.error('Failed to load course for learning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseDocumentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link href="/dashboard/my-courses">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];
  
  // Find current lesson or default to first
  const activeLessonIndex = currentLessonId 
    ? lessons.findIndex(l => l.id.toString() === currentLessonId)
    : 0;
    
  const activeLesson = lessons[activeLessonIndex !== -1 ? activeLessonIndex : 0];

  const hasNext = activeLessonIndex < lessons.length - 1;
  const hasPrev = activeLessonIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      router.push(`/learn/${course.documentId}?lessonId=${lessons[activeLessonIndex + 1].id}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      router.push(`/learn/${course.documentId}?lessonId=${lessons[activeLessonIndex - 1].id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-50">
      
      {/* Sidebar - Curriculum */}
      <div className="w-full md:w-80 bg-surface-900 text-surface-300 flex flex-col flex-shrink-0 h-auto md:h-screen sticky top-0">
        <div className="p-4 border-b border-surface-800">
          <Link href="/dashboard/my-courses" className="text-surface-400 hover:text-white flex items-center gap-2 text-sm mb-4">
            ← Back to Dashboard
          </Link>
          <h2 className="text-lg font-bold text-white line-clamp-2">{course.title}</h2>
          <div className="mt-2 text-sm">
            <span className="text-brand-400">{lessons.length}</span> Lessons
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4 space-y-2">
          {lessons.length === 0 ? (
            <p className="text-sm italic">No lessons available.</p>
          ) : (
            lessons.map((lesson, idx) => {
              const isActive = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => router.push(`/learn/${course.documentId}?lessonId=${lesson.id}`)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex gap-3 ${
                    isActive 
                      ? 'bg-brand-600 text-white font-medium' 
                      : 'hover:bg-surface-800 text-surface-300'
                  }`}
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2">{lesson.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full p-6 md:p-12">
          
          {activeLesson ? (
            <>
              <h1 className="text-3xl font-bold text-surface-900 mb-6">{activeLesson.title}</h1>
              
              {activeLesson.videoUrl && (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8">
                  {/* Basic iframe embed - in a real app, use a proper video player component */}
                  <iframe 
                    src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} 
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="prose prose-brand max-w-none mb-12">
                {/* 
                  We use dangerouslySetInnerHTML here because Strapi returns Rich Text.
                  In production, we should sanitize this with DOMPurify. 
                */}
                <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center pt-8 border-t border-surface-200 mt-auto">
                <Button 
                  variant="ghost" 
                  onClick={handlePrev} 
                  disabled={!hasPrev}
                >
                  ← Previous
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleNext} 
                  disabled={!hasNext}
                >
                  {hasNext ? 'Next Lesson →' : 'Finish Course 🏆'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">📭</span>
              <h2 className="text-2xl font-bold text-surface-900">No content available</h2>
              <p className="text-surface-500 mt-2">The instructor hasn't added any lessons yet.</p>
            </div>
          )}
          
        </div>
      </div>

    </div>
  );
}

export default function LessonViewerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-900 flex items-center justify-center text-white">Loading...</div>}>
      <LessonViewerContent />
    </Suspense>
  );
}

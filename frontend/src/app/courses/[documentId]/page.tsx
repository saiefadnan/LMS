'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, enrollInCourse, getMyEnrollments } from '@/lib/api';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, enrollmentsRes] = await Promise.all([
          getCourse(documentId),
          user ? getMyEnrollments() : Promise.resolve({ data: [] }),
        ]);

        const loadedCourse = courseRes.data;
        setCourse(loadedCourse);

        // Check if user is already enrolled
        if (user && enrollmentsRes.data) {
          const enrolled = enrollmentsRes.data.some(
            (e) => e.course?.id === loadedCourse.id
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Could not load course details.');
      } finally {
        setLoading(false);
      }
    }

    if (documentId) {
      loadData();
    }
  }, [documentId, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      setError('');
      await enrollInCourse(course.id);
      setIsEnrolled(true);
      // Give a slight delay before redirecting for UX
      setTimeout(() => {
        router.push(`/dashboard/learn/${course.documentId}`);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in course');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-4">{error || 'Course not found'}</h1>
          <Link href="/courses">
            <Button variant="secondary">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Public Navbar Minimal */}
      <nav className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/courses" className="text-surface-500 hover:text-surface-900 flex items-center gap-2">
              <span>←</span> Back to Catalog
            </Link>
            {user && (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-surface-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex gap-2 mb-6">
                <Badge variant="default" className="bg-brand-500/20 text-brand-300 border-none">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="text-surface-300 border-surface-600">
                  {course.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-surface-300 mb-8 max-w-xl">
                {course.description}
              </p>
              <div className="flex items-center gap-4 text-surface-200">
                <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center font-bold">
                  {course.instructor?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{course.instructor?.username}</p>
                  <p className="text-sm">Instructor</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-surface-800">
              {course.thumbnail ? (
                <img
                  src={getThumbnailSrc(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg border border-surface-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Ready to start learning?</h2>
            <p className="text-surface-500">Join this course to access all lessons and track your progress.</p>
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            {isEnrolled ? (
              <Link href={`/dashboard/learn/${course.documentId}`} className="block w-full">
                <Button variant="secondary" className="w-full" size="lg">
                  Continue Learning →
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500"
                onClick={handleEnroll}
                isLoading={enrolling}
              >
                Enroll Now
              </Button>
            )}
            {!user && !isEnrolled && (
              <p className="text-xs text-center text-surface-400 mt-2">You will be asked to sign in</p>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum (Lessons preview) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-surface-900 mb-6">Course Curriculum</h2>
        
        {course.lessons && course.lessons.length > 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100">
            {course.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-surface-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 font-medium text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-medium text-surface-900">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Video
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reading
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
            <p className="text-surface-500">No lessons have been published for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

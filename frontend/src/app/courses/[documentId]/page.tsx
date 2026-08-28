'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, enrollInCourse, getMyEnrollments } from '@/lib/api';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/ui/Footer';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';
import { ArrowLeft, ArrowRight, BookOpen, Settings, Video, FileText, CheckCircle2 } from 'lucide-react';

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

  const roleType = user
    ? (typeof user.role === 'object' ? user.role?.type : user.role) || 'student'
    : null;

  const isInstructorOfCourse = Boolean(
    user && course?.instructor && (course.instructor.id === user.id || (course.instructor as any) === user.id)
  );
  const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

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
      await enrollInCourse(course.documentId);
      setIsEnrolled(true);
      // Give a slight delay before redirecting for UX
      setTimeout(() => {
        router.push(`/learn/${course.documentId}`);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in course');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">{error || 'Course not found'}</h1>
          <Link href="/courses">
            <Button variant="secondary">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20 transition-colors duration-150">
      {/* Public Navbar Minimal */}
      <nav className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/courses" className="text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 flex items-center gap-1.5 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Catalog</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle size="sm" />
              {user && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-surface-900 dark:bg-surface-950 text-white py-16 lg:py-20 border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex gap-2 mb-4">
                {course.level && (
                  <Badge variant="outline" className="bg-white/10 text-brand-200 border-white/20">
                    {course.level}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="outline" className="text-surface-300 border-surface-700 bg-surface-800">
                    {course.category}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
                {course.title}
              </h1>
              <p className="text-base text-surface-300 mb-6 max-w-xl leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center gap-3 text-surface-200">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-sm">
                  {course.instructor?.username?.charAt(0).toUpperCase() || 'I'}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{course.instructor?.username || 'Verified Instructor'}</p>
                  <p className="text-xs text-surface-400">Course Lead</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-surface-800 border border-surface-700/50">
              {course.thumbnail ? (
                <img
                  src={getThumbnailSrc(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-surface-500">
                  <BookOpen className="w-14 h-14 stroke-[1.5]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white dark:bg-surface-900 rounded-xl shadow-md border border-surface-200 dark:border-surface-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
              {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse)
                ? 'Course Management'
                : 'Ready to start learning?'}
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-xs mt-0.5">
              {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse)
                ? 'You have permission to edit curriculum, quizzes, and monitor enrolled student progress.'
                : 'Join this course to access all lessons and track your progress.'}
            </p>
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            {isGlobalManager || (roleType === 'instructor' && isInstructorOfCourse) ? (
              <Link href={`/dashboard/courses/${course.documentId}/edit`} className="block w-full">
                <Button variant="primary" className="w-full gap-2" size="lg">
                  <Settings className="w-4 h-4" />
                  <span>Edit Curriculum & Settings</span>
                </Button>
              </Link>
            ) : roleType === 'instructor' ? (
              <div className="text-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-xs text-surface-600 dark:text-surface-300 font-semibold">
                Instructor Account (Enrollment is for Students)
              </div>
            ) : isEnrolled ? (
              <Link href={`/learn/${course.documentId}`} className="block w-full">
                <Button variant="secondary" className="w-full gap-2" size="lg">
                  <span>Resume Course</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 cursor-pointer"
                onClick={handleEnroll}
                isLoading={enrolling}
              >
                Enroll Now
              </Button>
            )}
            {!user && !isEnrolled && (
              <p className="text-xs text-center text-surface-400 mt-2">You will be asked to sign in as student</p>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum (Lessons preview) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-4 tracking-tight">Course Curriculum</h2>
        
        {course.lessons && course.lessons.length > 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 divide-y divide-surface-100 dark:divide-surface-800 shadow-xs">
            {course.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-surface-50/70 dark:hover:bg-surface-800/60 transition-colors">
                <div className="shrink-0 w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 font-bold text-xs mt-0.5">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                    {lesson.videoUrl ? (
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                        <span>Video Lesson</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                        <span>Reading Module</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
            <p className="text-surface-500 dark:text-surface-400">No lessons have been published for this course yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

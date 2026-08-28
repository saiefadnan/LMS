'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, enrollInCourse, getMyEnrollments } from '@/lib/api';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { CourseDetailHero } from '@/components/features/courses/CourseDetailHero';
import { CourseEnrollmentBar } from '@/components/features/courses/CourseEnrollmentBar';
import { CourseCurriculumList } from '@/components/features/courses/CourseCurriculumList';

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
            (e) => e.course?.id === loadedCourse.id || e.course?.documentId === loadedCourse.documentId
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            {error || 'Course not found'}
          </h1>
          <Link href="/courses">
            <Button variant="secondary">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20 flex flex-col transition-colors duration-150">
      <Navbar />

      <CourseDetailHero course={course} />

      <CourseEnrollmentBar
        course={course}
        user={user}
        roleType={roleType}
        isInstructorOfCourse={isInstructorOfCourse}
        isGlobalManager={isGlobalManager}
        isEnrolled={isEnrolled}
        enrolling={enrolling}
        onEnroll={handleEnroll}
      />

      <CourseCurriculumList lessons={course.lessons} />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

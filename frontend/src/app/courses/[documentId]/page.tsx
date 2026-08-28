'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse, useMyEnrollments, useEnrollCourse } from '@/hooks/queries/useCourses';
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

  const { data: course, isLoading, isError, error } = useCourse(documentId);
  const { data: enrollments = [] } = useMyEnrollments(Boolean(user));
  const enrollMutation = useEnrollCourse();

  const roleType = user
    ? (typeof user.role === 'object' ? user.role?.type : user.role) || 'student'
    : null;

  const isInstructorOfCourse = Boolean(
    user && course?.instructor && (course.instructor.id === user.id || (course.instructor as any) === user.id)
  );
  const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

  const isEnrolled = Boolean(
    user &&
      course &&
      enrollments.some(
        (e) => e.course?.id === course.id || e.course?.documentId === course.documentId
      )
  );

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!course) return;

    try {
      await enrollMutation.mutateAsync(course.documentId);
      setTimeout(() => {
        router.push(`/learn/${course.documentId}`);
      }, 300);
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            {error instanceof Error ? error.message : 'Course not found'}
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
        enrolling={enrollMutation.isPending}
        onEnroll={handleEnroll}
      />

      <CourseCurriculumList lessons={course.lessons} />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

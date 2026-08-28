'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, updateCourse, deleteCourse } from '@/lib/api';
import { type CourseFormValues } from '@/lib/validations';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { LessonManager } from '@/components/features/LessonManager';
import { QuizManager } from '@/components/features/QuizManager';
import { StudentProgressManager } from '@/components/features/StudentProgressManager';
import { CourseEditMetrics } from '@/components/features/courses/CourseEditMetrics';
import { CourseEditTabs, type EditCourseTab } from '@/components/features/courses/CourseEditTabs';
import { CourseDetailsForm } from '@/components/features/courses/CourseDetailsForm';
import { CourseEditSidebar } from '@/components/features/courses/CourseEditSidebar';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';
import { modal } from '@/stores/modal';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<EditCourseTab>('details');
  const [isDeleting, setIsDeleting] = useState(false);

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  const fetchCourse = useCallback(async () => {
    try {
      const res = await getCourse(documentId);
      const courseData = res.data;

      if (user && roleType === 'student') {
        router.push('/dashboard/my-courses');
        return;
      }
      if (user && roleType === 'instructor') {
        const isOwner = (courseData.instructor as any)?.id === user.id || (courseData.instructor as any) === user.id;
        if (courseData.instructor && !isOwner) {
          modal.alert({
            title: 'Permission Denied',
            message: 'You can only edit courses you created.',
            variant: 'warning',
          });
          router.push('/dashboard/courses');
          return;
        }
      }

      setCourse(courseData);
    } catch (error) {
      console.error('Failed to load course', error);
      setSaveError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [documentId, user, roleType, router]);

  useEffect(() => {
    if (documentId) {
      fetchCourse();
    }
  }, [documentId, fetchCourse]);

  const handleSaveCourse = async (data: CourseFormValues) => {
    try {
      setSaveError('');
      const payload: Record<string, any> = {
        title: data.title,
        description: data.description,
        level: data.level,
        category: data.category,
        published: Boolean(data.published),
      };

      if (data.thumbnail && data.thumbnail.trim()) {
        payload.thumbnail = data.thumbnail.trim();
      }

      await updateCourse(documentId, payload);
      modal.alert({
        title: 'Course Updated',
        message: 'Your course details and configuration changes were saved successfully.',
        variant: 'success',
      });
      fetchCourse();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    const confirmed = await modal.confirm({
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete course "${course.title}"? All lessons, quizzes, enrollments, and student progress records will be removed.`,
      variant: 'danger',
      confirmText: 'Delete Course',
    });
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteCourse(documentId);
      window.location.href = '/dashboard/courses';
    } catch (err: any) {
      console.error('Course deletion failed:', err);
      modal.alert({
        title: 'Deletion Error',
        message: err.message || 'Failed to delete course. Please try again.',
        variant: 'danger',
      });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-surface-600 text-sm">Course not found</div>;
  }

  const lessonCount = course.lessons?.length || 0;
  const quizCount = course.quizzes?.length || 0;
  const studentCount = course.enrollments?.length || 0;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/courses"
            className="text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 flex items-center gap-1.5 text-xs font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
              Edit Course: {course.title}
            </h1>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                course.published
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
              }`}
            >
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/courses/${course.documentId}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <CourseEditMetrics course={course} />

      {/* Segmented Studio Navigation Tabs */}
      <CourseEditTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lessonCount={lessonCount}
        quizCount={quizCount}
        studentCount={studentCount}
      />

      {/* Details & Settings Workspace */}
      {(activeTab === 'details' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseDetailsForm
              course={course}
              saveError={saveError}
              onSaveCourse={handleSaveCourse}
            />
          </div>

          <CourseEditSidebar
            course={course}
            isDeleting={isDeleting}
            onDeleteCourse={handleDeleteCourse}
          />
        </div>
      )}

      {/* Curriculum / Lessons View */}
      {(activeTab === 'lessons' || activeTab === 'all') && (
        <div className="w-full">
          <LessonManager course={course} onLessonChanged={fetchCourse} />
        </div>
      )}

      {/* Quizzes View */}
      {(activeTab === 'quizzes' || activeTab === 'all') && (
        <div className="w-full">
          <QuizManager course={course} onQuizChanged={fetchCourse} />
        </div>
      )}

      {/* Student Progress Roster View */}
      {(activeTab === 'students' || activeTab === 'all') && (
        <div className="w-full">
          <StudentProgressManager courseDocumentId={course.documentId} />
        </div>
      )}
    </div>
  );
}

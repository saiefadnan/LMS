'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/queries/useCourses';
import { type CourseFormValues } from '@/lib/validations';
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

  const { data: course, isLoading, refetch } = useCourse(documentId);
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<EditCourseTab>('details');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

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

      await updateMutation.mutateAsync({ documentId, data: payload });
      modal.alert({
        title: 'Course Updated',
        message: 'Your course details and configuration changes were saved successfully.',
        variant: 'success',
      });
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
      await deleteMutation.mutateAsync(documentId);
      window.location.href = '/dashboard/courses';
    } catch (err: any) {
      console.error('Course deletion failed:', err);
      modal.alert({
        title: 'Deletion Error',
        message: err.message || 'Failed to delete course. Please try again.',
        variant: 'danger',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-surface-600 text-sm">Course not found</div>;
  }

  const isOwner = (course.instructor as any)?.id === user?.id || (course.instructor as any) === user?.id;
  if (user && roleType === 'instructor' && course.instructor && !isOwner) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-600 dark:text-surface-400 text-sm mb-4">You can only edit courses you created.</p>
        <Link href="/dashboard/courses">
          <Button variant="secondary">Back to Courses</Button>
        </Link>
      </div>
    );
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
            isDeleting={deleteMutation.isPending}
            onDeleteCourse={handleDeleteCourse}
          />
        </div>
      )}

      {/* Curriculum / Lessons View */}
      {(activeTab === 'lessons' || activeTab === 'all') && (
        <div className="w-full">
          <LessonManager course={course} onLessonChanged={() => refetch()} />
        </div>
      )}

      {/* Quizzes View */}
      {(activeTab === 'quizzes' || activeTab === 'all') && (
        <div className="w-full">
          <QuizManager course={course} onQuizChanged={() => refetch()} />
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
